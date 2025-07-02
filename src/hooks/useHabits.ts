
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
  arrayUnion,
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

  // Listener for habit changes
  useEffect(() => {
    if (!user || !db) {
      setHabits([]);
      setIsLoadingHabits(false);
      return;
    }

    setIsLoadingHabits(true);
    const habitsCollection = collection(db, 'habits');
    const q = query(habitsCollection, where('userId', '==', user.uid));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const todayStr = getTodayString();
      const habitsData: Habit[] = querySnapshot.docs.map(doc => {
        const data = doc.data();
        const history = data.history?.sort() || [];
        return {
          id: doc.id,
          name: data.name,
          streak: data.streak || 0,
          history: history,
          completion: data.completion || 0,
          completedToday: history.includes(todayStr),
        };
      });

      setHabits(habitsData);
      setIsLoadingHabits(false);
    }, (error: any) => {
      console.error("Error fetching habits:", error);
      toast({ title: "Error fetching habits", description: error.message, variant: "destructive" });
      setIsLoadingHabits(false);
    });

    return () => unsubscribe();
  }, [user]);

  const addHabit = useCallback(async (name: string) => {
    if (!user || !db) {
        toast({ title: "Not logged in", description: "You must be logged in to add habits.", variant: "destructive" });
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
    } catch (error: any) {
      console.error("Error adding habit:", error);
      toast({ title: "Error adding habit", description: error.message, variant: "destructive" });
    }
  }, [user, toast]);

  const trackHabit = useCallback(async (id: string) => {
    if (!user || !db) return;

    const habit = habits.find(h => h.id === id);
    if (!habit || habit.completedToday) return;

    const todayStr = getTodayString();
    const yesterdayStr = (() => {
        const d = new Date();
        d.setDate(d.getDate() - 1);
        return d.toISOString().split('T')[0];
    })();
    
    const lastCompletionDate = habit.history.length > 0 ? habit.history[habit.history.length - 1] : null;
    const completedYesterday = lastCompletionDate === yesterdayStr;
    
    // If the last completion was yesterday, increment streak. Otherwise, start a new streak of 1.
    const newStreak = completedYesterday ? habit.streak + 1 : 1;
    
    try {
      const habitRef = doc(db, 'habits', id);
      await updateDoc(habitRef, {
        history: arrayUnion(todayStr), // Atomically add the new date, prevents duplicates
        streak: newStreak,
        completion: Math.min(100, habit.completion + 10),
      });
    } catch (error: any) {
       console.error("Error tracking habit:", error);
       toast({ title: "Error updating habit", description: error.message, variant: "destructive" });
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
