import { AssemblyAIClient } from './client';
import { Transcript, LemurTaskResponse, LemurSummaryResponse, LemurQuestionAnswerResponse, LemurActionItemsResponse } from 'assemblyai';

export const transcribeAudio = async (audioUrl: string): Promise<Transcript> => {
    const transcript = await AssemblyAIClient.transcripts.transcribe({ audio: audioUrl });
    return transcript;
};

export const runLemurTask = async (transcriptId: string, prompt: string): Promise<LemurTaskResponse> => {
    const result = await AssemblyAIClient.lemur.task({
        transcript_ids: [transcriptId],
        prompt,
        final_model: 'anthropic/claude-3-5-sonnet'
    });
    return result;
};

export const summarizeTranscript = async (transcriptId: string, context?: string): Promise<LemurSummaryResponse> => {
    const result = await AssemblyAIClient.lemur.summary({
        transcript_ids: [transcriptId],
        context
    });
    return result;
};

export const askQuestions = async (transcriptId: string, questions: Array<{ question: string, answer_format?: string }>): Promise<LemurQuestionAnswerResponse> => {
    const result = await AssemblyAIClient.lemur.questionAnswer({
        transcript_ids: [transcriptId],
        questions
    });
    return result;
};

export const generateActionItems = async (transcriptId: string, context?: string, answer_format?: string): Promise<LemurActionItemsResponse> => {
    const result = await AssemblyAIClient.lemur.actionItems({
        transcript_ids: [transcriptId],
        context,
        answer_format
    });
    return result;
};
