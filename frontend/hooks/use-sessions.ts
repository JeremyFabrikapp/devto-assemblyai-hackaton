"use client";
import { useState, useEffect } from 'react';
import { Session } from '@/types/database';
import { getUserSessions } from '@/app/actions/database';

export function useSessions(userId: string) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSessions() {
      try {
        setLoading(true);
        const fetchedSessions = await getUserSessions(userId);
        setSessions(fetchedSessions);
        setError(null);
      } catch (err) {
        console.error('Error fetching sessions:', err);
        setError('Failed to fetch sessions. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    if (userId) {
      fetchSessions();
    }
  }, [userId]);

  return { sessions, loading, error };
}
