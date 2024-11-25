import "dotenv/config";
import { WebSocket } from "ws";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { createNodeWebSocket } from "@hono/node-ws";
import { serveStatic } from "@hono/node-server/serve-static";
import { AssemblyAIClient } from "./providers/assemblyai/client";
import { createAssemblyAIWebSocket } from "./providers/assemblyai/websocket";
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { exec } from 'child_process';
import util from 'util';
import { generateDownloadLink, getFileUrl, getStorageFileAsAdmin, uploadFile } from "./providers/supabase/cloudStorage";
import { Recording, Session, createRecording, createSession, updateRecording, updateSession } from "./providers/supabase/database";
import { runLemurTask, runLemurTaskWithCustomOutput, transcribeAudio } from "./providers/assemblyai/api";
import { Transcript } from "assemblyai";
import { calculateDurationFromWords } from "./providers/assemblyai/utils";

const execPromise = util.promisify(exec);

const app = new Hono();
const WS_PORT = 8888;

const { injectWebSocket, upgradeWebSocket } = createNodeWebSocket({ app });

const convertWebmToPcm = async (webmBuffer: ArrayBuffer) => {
    const audioContext = new AudioContext();
    const audioData = await audioContext.decodeAudioData(webmBuffer);
    const pcmData = audioData.getChannelData(0); // Assuming mono audio
    return pcmData;
};

const convertPcmToMp3 = async (pcmFilePath: string, mp3FilePath: string, frequency: number = 24000) => {
    try {
        await execPromise(`ffmpeg -f s16le -ar ${frequency} -ac 1 -i ${pcmFilePath} ${mp3FilePath}`);
        console.log(`Converted ${pcmFilePath} to ${mp3FilePath} with frequency ${frequency} Hz`);
    } catch (error) {
        console.error('Error converting PCM to MP3:', error);
    }
};

app.get(
    "/ws",
    upgradeWebSocket((c) => ({
        onOpen: async (c, ws) => {
            console.log('WebSocket connection request received');
            if (!process.env.ASSEMBLYAI_API_KEY) {
                return ws.close();
            }
            console.log('WebSocket connection opened');
            console.log('AssemblyAI API Key:', process.env.ASSEMBLYAI_API_KEY);

            const rawWs = ws.raw as WebSocket;
            const assemblyAIWebSocket = createAssemblyAIWebSocket(process.env.ASSEMBLYAI_API_KEY);
            assemblyAIWebSocket.initializeWebSocket();

            let userId: string | undefined;
            const sessionId = uuidv4();

            const fileName = `audio_${sessionId}.pcm`;
            const filePath = path.join(__dirname, '..', 'audio_files', fileName);

            assemblyAIWebSocket.on('partialTranscript', (text) => {
                rawWs.send(JSON.stringify({ type: 'subtitle', status: 'partial', text }));
            });

            assemblyAIWebSocket.on('finalTranscript', (text) => {
                rawWs.send(JSON.stringify({ type: 'subtitle', status: 'final', text }));
            });

            rawWs.on('message', (message) => {
                // console.log('Received audio data from client', message);

                if (Buffer.isBuffer(message)) {
                    const stringMessage = message.toString('utf8');
                    try {
                        const jsonMessage = JSON.parse(stringMessage);
                        console.log('Received message:', stringMessage);
                        if (jsonMessage.type === 'session_start') {
                            userId = jsonMessage.userId;
                            console.log(`Session started for user: ${userId}`);
                            return; // Exit early, don't process this as audio data
                        }
                    } catch (error) {
                        // If it's not JSON, assume it's audio data
                    }
                    try {
                        fs.appendFileSync(filePath, message);
                        assemblyAIWebSocket.sendAudioBuffer(message);
                    } catch (error) {
                        console.error('Error processing Buffer:', error);
                    }
                } else if (message instanceof ArrayBuffer) {
                    try {
                        const buffer = Buffer.from(message);
                        fs.appendFileSync(filePath, buffer);
                        assemblyAIWebSocket.sendAudioBuffer(buffer);
                    } catch (error) {
                        console.error('Error processing ArrayBuffer:', error);
                    }
                } else {
                    console.log('Received non-Buffer message:', message);
                    if (typeof message === 'string') {
                        try {
                            const jsonMessage = JSON.parse(message);
                            if (jsonMessage.type === 'session_start') {
                                userId = jsonMessage.userId;
                                console.log(`Session started for user: ${userId}`);
                                // You can use userId here or store it for later use
                            }
                        } catch (error) {
                            console.error('Error parsing JSON message:', error);
                        }
                    }
                }
            });

            rawWs.on('close', async () => {
                const mp3FileName = `audio_${sessionId}.mp3`;
                const mp3FilePath = path.join(__dirname, '..', 'audio_files', mp3FileName);

                await convertPcmToMp3(filePath, mp3FilePath);

                const sessionInfo = {
                    sessionId,
                    userId,
                    pcmFileName: fileName,
                    pcmFilePath: filePath,
                    mp3FileName,
                    mp3FilePath,
                    storagePath: "",
                    publicUrl: ""
                };
                const sessionInfoPath = path.join(__dirname, '..', 'session_info', `${sessionId}.json`);
                fs.writeFileSync(sessionInfoPath, JSON.stringify(sessionInfo, null, 2));
                console.log(`Session info saved: ${sessionInfoPath}`);

                // Upload the MP3 file to Supabase storage
                try {

                    const fileBody = await fs.promises.readFile(mp3FilePath);
                    const storagePath = `audio/${mp3FileName}`;
                    await uploadFile(storagePath, fileBody);
                    console.log(`MP3 file uploaded to Supabase: ${storagePath}`);

                    // Get the public URL of the uploaded file
                    const publicUrl = await getFileUrl(storagePath);
                    console.log(`Public URL of the uploaded file: ${publicUrl}`);

                    // Update the session info with the storage path and public URL
                    sessionInfo.storagePath = storagePath;
                    sessionInfo.publicUrl = publicUrl;
                    fs.writeFileSync(sessionInfoPath, JSON.stringify(sessionInfo, null, 2));
                    console.log(`Session info updated with storage details`);

                    // Create a recording record in the database
                    try {
                        const recordingData: Partial<Recording> = {
                            title: `Recording ${sessionId}`,
                            start_time: new Date().toISOString(),
                            duration: 0, // You'll need to calculate this
                            status: 'starting',
                            audio_file: storagePath,
                            user_id: userId
                        };
                        const recording = await createRecording(recordingData);
                        console.log(`Recording created with ID: ${recording.id}`);

                        // Create a session record in the database
                        const sessionData: Partial<Session> = {
                            title: `Session ${sessionId}`,
                            date: new Date().toISOString(),
                            status: 'completed',
                            recording_id: recording.id,
                            user_id: userId
                        };
                        const session = await createSession(sessionData);
                        console.log(`Session created with ID: ${session.id}`);
                        let transcript;
                        // Trigger AssemblyAI transcription
                        try {
                            const audioFileUrl = await generateDownloadLink(storagePath);
                            transcript = await transcribeAudio(audioFileUrl);

                            // Update the recording with the transcript information
                            await updateRecording(recording.id, {
                                status: 'completed',
                                transcript: transcript,
                                duration: calculateDurationFromWords(transcript), // You'll need to calculate this
                                // Add any other relevant transcript data
                            });

                            console.log(`Transcription completed for recording ${recording.id}`);

                            const prompt = `Please provide a suitable short title for the recording based on the content.`;
                            const promptSummary = `Please summarize the content of the recording and provide a suitable title.`;
                            const promptShortSummary = `Please provide a short summary (less than 200 char) the content of the recording and provide a suitable title.`;
                            const lemurTaskRecordingTitleResult = await runLemurTaskWithCustomOutput(transcript?.id, prompt);
                            const lemurTaskRecordingShortSummaryResult = await runLemurTaskWithCustomOutput(transcript?.id, promptShortSummary);
                            const lemurTaskRecordingSummaryResult = await runLemurTaskWithCustomOutput(transcript?.id, promptSummary);
                            const title = lemurTaskRecordingTitleResult.response || `Recording ${sessionId}`; // Fallback title if none provided
                            const summary = lemurTaskRecordingSummaryResult.response || 'No summary available'; // Fallback summary if none provided
                            const shortSummary = lemurTaskRecordingShortSummaryResult.response || 'No summary available'; // Fallback summary if none provided

                            console.log(`Recording title updated to: ${title}`);
                            console.log(`Recording summary updated to: ${summary}`);
                            console.log(`Recording short summary updated to: ${shortSummary}`);
                            // Update the recording with the new title
                            await updateSession(session.id, { title, summary: shortSummary });
                            await updateRecording(recording.id, { title, summary });
                        } catch (transcriptionError) {
                            console.error('Error during transcription:', transcriptionError);
                            await updateRecording(recording.id, { status: 'failed' });
                        }


                        // Update the session info file with database record IDs
                        // sessionInfo.recordingId = recording.id;
                        // sessionInfo.sessionId = session.id;
                        // fs.writeFileSync(sessionInfoPath, JSON.stringify(sessionInfo, null, 2));
                        console.log(`Session info updated with database record IDs`);
                    } catch (error) {
                        console.error('Error creating database records:', error);
                    }
                } catch (error) {
                    console.error('Error uploading file to Supabase:', error);
                }
                // Remove the PCM file after conversion
                fs.unlinkSync(filePath);
                console.log(`PCM file removed: ${filePath}`);
            });
        },
        onClose: (c, ws) => {
            console.log("Client disconnected");
        },
    }))
);



const server = serve({
    fetch: app.fetch,
    port: WS_PORT,
});

injectWebSocket(server);

console.log(`Server is running on port ${WS_PORT}`);
