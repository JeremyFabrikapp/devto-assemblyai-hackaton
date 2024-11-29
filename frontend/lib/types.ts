// export interface Session {
//     id: string;
//     title: string;
//     date: string;
//     duration: number;
//     transcript: TranscriptSegment[];
//     notes: GeneratedNote[];
//     status: 'active' | 'completed';
//     audioFile: string;
// }


export interface TranscriptSegment {
    id: number;
    speaker: string;
    text: string;
    timestamp: string;
    confidence: number;
}

export interface SessionInfoProps {
    isRecording: boolean;
    isPaused: boolean;
    duration: number;
    transcript: TranscriptSegment[];
    formatDuration: (seconds: number) => string;
}

export interface TranscriptViewProps {
    transcript: string;
    words?: TranscriptSegment[];
}


// export interface GeneratedNote {
//     id: number;
//     instruction: string;
//     content: string;
//     timestamp: string;
// }

// export interface Note {
//     id: string;
//     title: string;
//     content: string;
//     createdAt: string;
//     updatedAt: string;
//     tags: string[];
//     isStarred: boolean;
//     sessionId?: string;
// }

// export interface Recording {
//     id: string;
//     title: string;
//     startTime: string;
//     duration: number;
//     transcript: TranscriptSegment[];
//     status: 'recording' | 'paused' | 'completed';
// }

export {}