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

      assemblyAIWebSocket.on('partialTranscript', (text) => {
        rawWs.send(JSON.stringify({ type: 'partial', text }));
      });

      assemblyAIWebSocket.on('finalTranscript', (text) => {
        rawWs.send(JSON.stringify({ type: 'final', text }));
      });

      // Assuming the client sends audio data
      rawWs.on('message', (message) => {
        // Process the incoming audio data and send it to AssemblyAI
        // This part depends on how you're receiving audio from the client
        // You might need to adjust this based on your specific implementation
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