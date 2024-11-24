'use server'

import { transcribeAudio, runLemurTask, summarizeTranscript, askQuestions, generateActionItems } from '@/providers/assemblyai/api';
import { Transcript, LemurTaskResponse, LemurSummaryResponse, LemurQuestionAnswerResponse, LemurActionItemsResponse } from 'assemblyai';

export async function transcribe(audioUrl: string): Promise<Transcript> {
    try {
        const transcript = await transcribeAudio(audioUrl);
        return transcript;
    } catch (error) {
        console.error('Error in transcribe action:', error);
        throw new Error('Failed to transcribe audio');
    }
}

export async function lemurTask(transcriptId: string, prompt: string): Promise<LemurTaskResponse> {
    try {
        const result = await runLemurTask(transcriptId, prompt);
        return result;
    } catch (error) {
        console.error('Error in lemurTask action:', error);
        throw new Error('Failed to run Lemur task');
    }
}

export async function summarize(transcriptId: string, context?: string): Promise<LemurSummaryResponse> {
    try {
        const summary = await summarizeTranscript(transcriptId, context);
        return summary;
    } catch (error) {
        console.error('Error in summarize action:', error);
        throw new Error('Failed to summarize transcript');
    }
}

export async function questionAnswer(transcriptId: string, questions: Array<{ question: string, answer_format?: string }>): Promise<LemurQuestionAnswerResponse> {
    try {
        const answers = await askQuestions(transcriptId, questions);
        return answers;
    } catch (error) {
        console.error('Error in questionAnswer action:', error);
        throw new Error('Failed to answer questions');
    }
}

export async function actionItems(transcriptId: string, context?: string, answer_format?: string): Promise<LemurActionItemsResponse> {
    try {
        const items = await generateActionItems(transcriptId, context, answer_format);
        return items;
    } catch (error) {
        console.error('Error in actionItems action:', error);
        throw new Error('Failed to generate action items');
    }
}
