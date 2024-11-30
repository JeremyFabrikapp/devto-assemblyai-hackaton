"use client";

import { Session } from '@/types/database';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SessionState {
  sessions: Session[];
  addSession: (session: Session) => void;
  updateSession: (id: string, updates: Partial<Session>) => void;
  deleteSession: (id: string) => void;
  getSession: (id: string) => Session | undefined;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      sessions: [],
      addSession: (session) =>
        set((state) => ({
          sessions: [...state.sessions, session],
        })),
      updateSession: (id, updates) =>
        set((state) => ({
          sessions: state.sessions.map((session) =>
            session.id === id ? { ...session, ...updates } : session
          ),
        })),
      deleteSession: (id) =>
        set((state) => ({
          sessions: state.sessions.filter((session) => session.id !== id),
        })),
      getSession: (id) => get().sessions.find((session) => session.id === id),
    }),
    {
      name: 'echolearn-sessions',
    }
  )
);