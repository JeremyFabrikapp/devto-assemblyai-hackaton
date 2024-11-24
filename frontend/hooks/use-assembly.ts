import { useState } from 'react';
import {
  transcribeAudio,
  runLemurTask,
  summarizeTranscript,
  askQuestions,
  generateActionItems,
} from '../providers/assemblyai/api';
import { Transcript, LemurTaskResponse, LemurSummaryResponse, LemurQuestionAnswerResponse, LemurActionItemsResponse } from 'assemblyai';

export const useAssembly = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRequest = async <T>(request: () => Promise<T>): Promise<T | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await request();
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const handleTranscribeAudio = (audioUrl: string) => 
    handleRequest<Transcript>(() => transcribeAudio(audioUrl));

  const handleRunLemurTask = (transcriptId: string, prompt: string) => 
    handleRequest<LemurTaskResponse>(() => runLemurTask(transcriptId, prompt));

  const handleSummarizeTranscript = (transcriptId: string, context?: string) => 
    handleRequest<LemurSummaryResponse>(() => summarizeTranscript(transcriptId, context));

  const handleAskQuestions = (transcriptId: string, questions: Array<{ question: string, answer_format?: string }>) => 
    handleRequest<LemurQuestionAnswerResponse>(() => askQuestions(transcriptId, questions));

  const handleGenerateActionItems = (transcriptId: string, context?: string, answer_format?: string) => 
    handleRequest<LemurActionItemsResponse>(() => generateActionItems(transcriptId, context, answer_format));

  return {
    isLoading,
    error,
    transcribeAudio: handleTranscribeAudio,
    runLemurTask: handleRunLemurTask,
    summarizeTranscript: handleSummarizeTranscript,
    askQuestions: handleAskQuestions,
    generateActionItems: handleGenerateActionItems,
  };
};
