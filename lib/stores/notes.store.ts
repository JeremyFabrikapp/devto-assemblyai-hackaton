"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Note } from '../types';

interface NoteState {
  notes: Note[];
  addNote: (note: Note) => void;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  getNote: (id: string) => Note | undefined;
  toggleStar: (id: string) => void;
}

export const useNoteStore = create<NoteState>()(
  persist(
    (set, get) => ({
      notes: [],
      addNote: (note) =>
        set((state) => ({
          notes: [...state.notes, note],
        })),
      updateNote: (id, updates) =>
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === id ? { ...note, ...updates } : note
          ),
        })),
      deleteNote: (id) =>
        set((state) => ({
          notes: state.notes.filter((note) => note.id !== id),
        })),
      getNote: (id) => get().notes.find((note) => note.id === id),
      toggleStar: (id) =>
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === id ? { ...note, isStarred: !note.isStarred } : note
          ),
        })),
    }),
    {
      name: 'echolearn-notes',
    }
  )
);