import WebSocket from 'ws';
import fs from 'fs';
import { AssemblyAI } from 'assemblyai';

class AssemblyAIWebSocket {
    private socket: WebSocket | null = null;
    private state: string = 'idle';
    private transcriptText: string = '';
    private filePath: string = '';
    private client: AssemblyAI;

    constructor(private sampleRate: number = 8000, apiKey: string) {
        this.client = new AssemblyAI({ apiKey });
    }

    private initializeWebSocket(): void {
        const url = `wss://api.assemblyai.com/v2/realtime/ws?sample_rate=${this.sampleRate}`;
        this.socket = new WebSocket(url, {
            headers: {
                Authorization: process.env.ASSEMBLYAI_API_KEY || ''
            }
        });

        this.setupSocketListeners();
    }

    private setupSocketListeners(): void {
        if (!this.socket) return;

        this.socket.onmessage = this.handleMessage.bind(this);
        this.socket.onerror = this.handleError.bind(this);
        this.socket.onclose = this.handleClose.bind(this);
        this.socket.onopen = this.handleOpen.bind(this);
    }

    private async handleMessage(message: WebSocket.MessageEvent): Promise<void> {
        const res = JSON.parse(message.data.toString());

        if (res.message_type === 'PartialTranscript') {
            console.log('Partial Text:', res.text);
        }
        if (res.message_type === 'FinalTranscript') {
            console.log('Final Text:', res.text);
            this.transcriptText += res.text + ' ';
        }

        if (res.message_type === 'SessionBegins') {
            console.log('Session Begins');
            await this.sendAudioData();
        }
    }

    private handleError(event: WebSocket.ErrorEvent): void {
        console.error(event);
    }

    private handleClose(event: WebSocket.CloseEvent): void {
        this.writeTranscriptToFile();
        console.log(`Got socket close event type=${event.type} code=${event.code} reason="${event.reason}" wasClean=${event.wasClean}`);
    }

    private handleOpen(): void {
        this.state = 'started';
        console.log('socket open');
    }

    private async sendAudioData(): Promise<void> {
        const data = fs.readFileSync(this.filePath);
        for (let i = 0; i < data.length; i += 2000) {
            const chunk = data.slice(i, i + 2000);
            if (chunk.length < 2000) continue;

            const audioData = chunk.toString('base64');
            this.socket?.send(JSON.stringify({ audio_data: audioData }));
            await new Promise(resolve => setTimeout(resolve, 50));
        }
        this.socket?.send(JSON.stringify({ terminate_session: true }));
    }

    private writeTranscriptToFile(): void {
        fs.writeFile(`${this.filePath}_transcript.txt`, this.transcriptText, (err) => {
            if (err) throw err;
        });
    }

    public transcribeFile(filePath: string): void {
        this.filePath = filePath;
        this.initializeWebSocket();
    }
}

export const createAssemblyAIWebSocket = (apiKey: string) => new AssemblyAIWebSocket(8000, apiKey);
