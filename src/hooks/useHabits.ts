
"use client";

import { useState, useEffect, useCallback } from 'react';
import type { Habit } from '@/types';
import { getHabitInsights, type HabitInsightsOutput } from '@/ai/flows/habit-insights';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  doc,
  updateDoc,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';

export function useHabits() {
  const { user } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isLoadingHabits, setIsLoadingHabits] = useState(true);
  const [aiInsight, setAiInsight] = useState<HabitInsightsOutput | null>(null);
  const [isLoadingInsight, setIsLoadingInsight] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const { toast } = useToast();

  const getTodayString = () => new Date().toISOString().split('T')[0];

  const getYesterdayString = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
  };

  useEffect(() => {
    if (user && db) {
      setIsLoadingHabits(true);
      const habitsCollection = collection(db, 'habits');
      const q = query(habitsCollection, where('userId', '==', user.uid));

      const unsubscribe = onSnapshot(q, async (querySnapshot) => {
        const todayStr = getTodayString();
        const yesterdayStr = getYesterdayString();
        const batch = writeBatch(db);
        let writesInBatch = 0;
        
        const habitsData: Habit[] = querySnapshot.docs.map(doc => {
          const data = doc.data();
          const history = data.history?.sort() || [];
          const lastCompletionDate = history.length > 0 ? history[history.length - 1] : null;

          let currentStreak = data.streak || 0;
          if (lastCompletionDate && lastCompletionDate < yesterdayStr) {
            currentStreak = 0;
            // If the streak is broken, update it in Firestore
            if (data.streak > 0) {
               batch.update(doc.ref, { streak: 0 });
               writesInBatch++;
            }
          }
          
          return {
            id: doc.id,
            name: data.name,
            streak: currentStreak,
            history: history,
            completion: data.completion || 0,
            completedToday: lastCompletionDate === todayStr,
          };
        });

        // Commit any streak reset updates if necessary
        if (writesInBatch > 0) {
          try {
              await batch.commit();
          } catch(e) {
              console.error("Error resetting streaks:", e);
              toast({ title: "Error", description: "Could not update habit streaks.", variant: "destructive" });
          }
        }

        setHabits(habitsData);
        setIsLoadingHabits(false);
      }, (error) => {
        console.error("Error fetching habits:", error);
        toast({ title: "Error", description: "Could not fetch habits.", variant: "destructive" });
        setIsLoadingHabits(false);
      });

      return () => unsubscribe();
    } else {
      // Not logged in or Firebase not configured
      setHabits([]);
      setIsLoadingHabits(false);
    }
  }, [user, toast]);

  const addHabit = useCallback(async (name: string) => {
    if (!user || !db) {
        toast({ title: "Error", description: "You must be logged in to add habits.", variant: "destructive" });
        return;
    }
    try {
      await addDoc(collection(db, 'habits'), {
        userId: user.uid,
        name,
        streak: 0,
        history: [],
        completion: 0,
        createdAt: serverTimestamp(),
      });
      toast({ title: "Habit Added", description: `"${name}" has been added.` });
    } catch (error) {
      console.error("Error adding habit:", error);
      toast({ title: "Error", description: "Could not add habit.", variant: "destructive" });
    }
  }, [user, toast]);

  const trackHabit = useCallback(async (id: string) => {
    if (!user || !db) return;

    const habit = habits.find(h => h.id === id);
    if (!habit || habit.completedToday) return;

    const todayStr = getTodayString();
    const yesterdayStr = getYesterdayString();
    
    const completedYesterday = habit.history.includes(yesterdayStr);
    const newStreak = completedYesterday ? habit.streak + 1 : 1;
    
    // Ensure history is unique and sorted
    const newHistory = [...new Set([...habit.history, todayStr])].sort();

    try {
      const habitRef = doc(db, 'habits', id);
      await updateDoc(habitRef, {
        history: newHistory,
        streak: newStreak,
        completion: Math.min(100, habit.completion + 10),
      });
    } catch (error) {
       console.error("Error tracking habit:", error);
       toast({ title: "Error", description: "Could not update habit.", variant: "destructive" });
    }
  }, [user, habits, toast]);

  const getAIInsights = useCallback(async () => {
    if (habits.length === 0) {
      setAiError("Add some habits first to get insights!");
      toast({
        title: "No Habits Found",
        description: "Please add at least one habit before requesting AI insights.",
        variant: "destructive",
      })
      return;
    }

    setIsLoadingInsight(true);
    setAiInsight(null);
    setAiError(null);

    const habitData = habits.map(({ name, streak, completion }) => ({
      name,
      streak,
      completion,
    }));

    try {
      const result = await getHabitInsights({ habitData });
      setAiInsight(result);
    } catch (error) {
      console.error("Error fetching AI insights:", error);
      setAiError('⚠️ Error getting insights. Please try again.');
       toast({
        title: "AI Insight Error",
        description: "There was a problem getting insights from the AI. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsLoadingInsight(false);
    }
  }, [habits, toast]);

  return { habits, addHabit, trackHabit, getAIInsights, aiInsight, isLoadingInsight, aiError, isLoadingHabits };
}
