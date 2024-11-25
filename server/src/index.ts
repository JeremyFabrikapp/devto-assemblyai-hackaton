import "dotenv/config";
import { WebSocket } from "ws";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { createNodeWebSocket } from "@hono/node-ws";
import { serveStatic } from "@hono/node-server/serve-static";
import { AssemblyAIClient } from "./assemblyai/client";
import { createAssemblyAIWebSocket } from "./assemblyai/websocket";

const app = new Hono();
const WS_PORT = 8888;

const { injectWebSocket, upgradeWebSocket } = createNodeWebSocket({ app });

// app.use("/", serveStatic({ path: "./static/index.html" }));
// app.use("/static/*", serveStatic({ root: "./" }));
const convertWebmToPcm = async (webmBuffer: ArrayBuffer) => {
    const audioContext = new AudioContext();
    const audioData = await audioContext.decodeAudioData(webmBuffer);
    const pcmData = audioData.getChannelData(0); // Assuming mono audio
    return pcmData;
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
            assemblyAIWebSocket.on('partialTranscript', (text) => {
                rawWs.send(JSON.stringify({ type: 'subtitle', status: 'partial', text }));
            });

            assemblyAIWebSocket.on('finalTranscript', (text) => {
                rawWs.send(JSON.stringify({ type: 'subtitle', status: 'final', text }));
            });

            // Assuming the client sends audio data
            rawWs.on('message', (message) => {
                // console.log('Received audio data from client', Buffer.isBuffer(message),typeof message, message);

                if (Buffer.isBuffer(message)) {
                    try {
                        assemblyAIWebSocket.sendAudioBuffer(message);
                    } catch (error) {
                        console.error('Error sending PCM data to AssemblyAI:', error);
                    }
                } else if (message instanceof ArrayBuffer) {
                    try {
                        const buffer = Buffer.from(message);
                        assemblyAIWebSocket.sendAudioBuffer(buffer);
                    } catch (error) {
                        console.error('Error converting ArrayBuffer to Buffer:', error);
                    }
                } else {
                    console.log('Received non-Buffer message:', message);
                }
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