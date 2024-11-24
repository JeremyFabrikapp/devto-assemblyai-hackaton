import { Player } from "@/lib/player";
import { Recorder } from "@/lib/recorder";
import { useState, useCallback, useEffect } from "react";
const BUFFER_SIZE = 4096;

export const useAssemblyStream = (onNewMessage?: (message: string, isBot: boolean) => void) => {
    const [isAudioOn, setIsAudioOn] = useState(false);
    const [audioPlayer] = useState(() => new Player());
    const [audioRecorder, setAudioRecorder] = useState<Recorder | null>(null);
    const [webSocket, setWebSocket] = useState<WebSocket | null>(null);

    const startAudio = useCallback(async () => {
        try {
            const ws = new WebSocket("ws://localhost:8080");
            setWebSocket(ws);

            await audioPlayer.init(24000);

            let buffer = new Uint8Array();

            const appendToBuffer = (newData: Uint8Array) => {
                const newBuffer = new Uint8Array(buffer.length + newData.length);
                newBuffer.set(buffer);
                newBuffer.set(newData, buffer.length);
                buffer = newBuffer;
            };

            const handleAudioData = (data: ArrayBuffer) => {
                const uint8Array = new Uint8Array(data);
                appendToBuffer(uint8Array);

                if (buffer.length >= BUFFER_SIZE) {
                    const toSend = new Uint8Array(buffer.slice(0, BUFFER_SIZE));
                    buffer = new Uint8Array(buffer.slice(BUFFER_SIZE));

                    const regularArray = String.fromCharCode(...toSend);
                    const base64 = btoa(regularArray);

                    ws.send(JSON.stringify({ type: 'transcribe', audio: base64 }));
                }
            };

            const recorder = new Recorder(handleAudioData);
            setAudioRecorder(recorder);

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            await recorder.start(stream);

            setIsAudioOn(true);
        } catch (error) {
            console.error('Error starting audio:', error);
            alert('Error accessing the microphone. Please check your settings and try again.');
        }
    }, [audioPlayer]);

    const stopAudio = useCallback(() => {
        if (audioRecorder) {
            audioRecorder.stop();
        }
        if (webSocket) {
            webSocket.close();
        }
        setIsAudioOn(false);
    }, [audioRecorder, webSocket]);

    useEffect(() => {
        if (webSocket) {
            webSocket.onmessage = (event) => {
                const data = JSON.parse(event.data);
                if (data.type === 'transcription') {
                    onNewMessage?.(data.text, false);
                }
            };
        }
    }, [webSocket, onNewMessage]);

    return {
        isAudioOn,
        startAudio,
        stopAudio
    };
};