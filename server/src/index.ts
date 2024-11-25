import "dotenv/config";
import { WebSocket } from "ws";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { createNodeWebSocket } from "@hono/node-ws";
import { serveStatic } from "@hono/node-server/serve-static";
import { AssemblyAIClient } from "./assemblyai/client";
import { createAssemblyAIWebSocket } from "./assemblyai/websocket";
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { exec } from 'child_process';
import util from 'util';

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
                    mp3FilePath
                };
                const sessionInfoPath = path.join(__dirname, '..', 'session_info', `${sessionId}.json`);
                fs.writeFileSync(sessionInfoPath, JSON.stringify(sessionInfo, null, 2));
                console.log(`Session info saved: ${sessionInfoPath}`);

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