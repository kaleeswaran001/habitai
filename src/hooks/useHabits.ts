
"use client";

import { useState, useEffect, useCallback } from 'react';
import type { Habit } from '@/types';
import { getHabitInsights } from '@/ai/flows/habit-insights';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/context/AuthContext';

const HABITS_STORAGE_KEY_PREFIX = 'habits';

export function useHabits() {
  const { user } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isLoadingInsight, setIsLoadingInsight] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const { toast } = useToast();

  const getTodayString = () => new Date().toISOString().split('T')[0];
  
  const getYesterdayString = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
  }

  useEffect(() => {
    if (user) {
      const userHabitsKey = `${HABITS_STORAGE_KEY_PREFIX}_${user.uid}`;
      try {
        const storedHabits = localStorage.getItem(userHabitsKey);
        if (storedHabits) {
          const parsedHabits: Habit[] = JSON.parse(storedHabits);
          
          const todayStr = getTodayString();
          const yesterdayStr = getYesterdayString();

          const updatedHabits = parsedHabits.map(habit => {
            const sortedHistory = habit.history.sort();
            const lastCompletionDate = sortedHistory[sortedHistory.length - 1];
            
            let currentStreak = habit.streak;
            if (lastCompletionDate && lastCompletionDate < yesterdayStr) {
               currentStreak = 0;
            }

            return {
              ...habit,
              completedToday: lastCompletionDate === todayStr,
              streak: currentStreak,
            };
          });
          
          setHabits(updatedHabits);
        } else {
          setHabits([]);
        }
      } catch (error) {
        console.error("Failed to load habits from localStorage", error);
        setHabits([]);
      }
    } else {
      setHabits([]);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      const userHabitsKey = `${HABITS_STORAGE_KEY_PREFIX}_${user.uid}`;
      try {
        // Avoid saving empty array on initial load for a new user
        if (habits.length > 0 || localStorage.getItem(userHabitsKey)) {
          localStorage.setItem(userHabitsKey, JSON.stringify(habits));
        }
      } catch (error) {
        console.error("Failed to save habits to localStorage", error);
      }
    }
  }, [habits, user]);

  const addHabit = useCallback((name: string) => {
    const newHabit: Habit = {
      id: crypto.randomUUID(),
      name,
      streak: 0,
      history: [],
      completion: 0,
      completedToday: false,
    };
    setHabits(prev => [...prev, newHabit]);
  }, []);

  const trackHabit = useCallback((id: string) => {
    setHabits(prev => {
      const todayStr = getTodayString();
      return prev.map(habit => {
        if (habit.id === id && !habit.completedToday) {
          const newHistory = [...habit.history, todayStr].sort();
          
          let newStreak = 1;
          for (let i = newHistory.length - 1; i > 0; i--) {
            const current = new Date(newHistory[i]);
            const prevDate = new Date(newHistory[i-1]);
            const diffDays = Math.round((current.getTime() - prevDate.getTime()) / (1000 * 3600 * 24));
            
            if(diffDays === 1) {
              newStreak++;
            } else if (diffDays > 1) {
              break;
            }
          }

          return {
            ...habit,
            history: newHistory,
            completedToday: true,
            streak: newStreak,
            completion: Math.min(100, habit.completion + 10),
          };
        }
        return habit;
      });
    });
  }, []);

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
      setAiInsight(result.insights);
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

  return { habits, addHabit, trackHabit, getAIInsights, aiInsight, isLoadingInsight, aiError };
}
