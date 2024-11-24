"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Recording, TranscriptSegment } from './types';

interface RecordingState {
  currentRecording: Recording | null;
  recordings: Recording[];
  startRecording: (title: string) => void;
  pauseRecording: () => void;
  resumeRecording: () => void;
  stopRecording: () => void;
  addTranscriptSegment: (segment: TranscriptSegment) => void;
  updateRecordingTitle: (title: string) => void;
  getRecording: (id: string) => Recording | undefined;
}

export const useRecordingStore = create<RecordingState>()(
  persist(
    (set, get) => ({
      currentRecording: null,
      recordings: [],
      startRecording: (title) =>
        set({
          currentRecording: {
            id: Date.now().toString(),
            title,
            startTime: new Date().toISOString(),
            duration: 0,
            transcript: [],
            status: 'recording',
          },
        }),
      pauseRecording: () =>
        set((state) => ({
          currentRecording: state.currentRecording
            ? { ...state.currentRecording, status: 'paused' }
            : null,
        })),
      resumeRecording: () =>
        set((state) => ({
          currentRecording: state.currentRecording
            ? { ...state.currentRecording, status: 'recording' }
            : null,
        })),
      stopRecording: () =>
        set((state) => {
          if (!state.currentRecording) return state;
          const completedRecording = {
            ...state.currentRecording,
            status: 'completed' as const,
          };
          return {
            currentRecording: null,
            recordings: [...state.recordings, completedRecording],
          };
        }),
      addTranscriptSegment: (segment) =>
        set((state) => ({
          currentRecording: state.currentRecording
            ? {
                ...state.currentRecording,
                transcript: [...state.currentRecording.transcript, segment],
              }
            : null,
        })),
      updateRecordingTitle: (title) =>
        set((state) => ({
          currentRecording: state.currentRecording
            ? { ...state.currentRecording, title }
            : null,
        })),
      getRecording: (id) => get().recordings.find((recording) => recording.id === id),
    }),
    {
      name: 'echolearn-recordings',
    }
  )
);