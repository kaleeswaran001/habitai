
"use client";

import { useState, useEffect } from 'react';
import { useHabits } from '@/hooks/useHabits';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Flame, Check, Sparkles, Loader2, LogOut, ThumbsUp, TrendingDown, Quote } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/AuthContext';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';

export default function HabitTracker() {
  const [hasMounted, setHasMounted] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  
  const { 
    habits, 
    addHabit, 
    trackHabit, 
    getAIInsights, 
    aiInsight, 
    isLoadingInsight, 
    aiError
  } = useHabits();
  const [newHabitName, setNewHabitName] = useState('');

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const handleAddHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newHabitName.trim()) {
      addHabit(newHabitName.trim());
      setNewHabitName('');
    }
  };

  const handleGetInsights = async () => {
    await getAIInsights();
  };
  
  const handleLogout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
    } catch (error) {
       toast({
        title: "Logout Failed",
        description: "There was a problem logging out.",
        variant: "destructive"
      });
    }
  };
  
  if (!hasMounted) {
    return (
      <div className="container mx-auto max-w-3xl p-4 sm:p-6 md:p-8">
        <header className="text-center mb-8">
          <Skeleton className="h-10 w-3/4 mx-auto mb-2" />
          <Skeleton className="h-4 w-1/2 mx-auto" />
        </header>
        <main className="flex flex-col gap-6">
          <Card>
            <CardHeader><Skeleton className="h-6 w-1/3" /></CardHeader>
            <CardContent><Skeleton className="h-10 w-full" /></CardContent>
          </Card>
          <Card>
            <CardHeader><Skeleton className="h-6 w-1/4" /></CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader><Skeleton className="h-6 w-1/3" /></CardHeader>
            <CardContent><Skeleton className="h-10 w-1/2" /></CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-3xl p-4 sm:p-6 md:p-8">
      <header className="mb-8">
          <div className="flex justify-between items-center mb-2">
              <div className="w-24 sm:w-48"></div>
              <div className="text-center">
                  <h1 className="text-2xl sm:text-4xl font-bold tracking-tight flex items-center justify-center gap-3">
                      <Sparkles className="text-primary" /> HabitAI
                  </h1>
              </div>
              <div className="w-24 sm:w-48 flex items-center justify-end gap-2">
              {user && (
                  <>
                    <span className="text-sm text-muted-foreground hidden sm:inline">{user.email}</span>
                    <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Log out">
                        <LogOut className="h-5 w-5" />
                    </Button>
                  </>
              )}
              </div>
          </div>
          <p className="text-muted-foreground text-center">Track your habits and get AI-powered insights.</p>
      </header>
      <main className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Add New Habit</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddHabit} className="flex flex-col sm:flex-row gap-2">
              <Input
                id="habit-input"
                type="text"
                placeholder="e.g. Drink 8 glasses of water"
                value={newHabitName}
                onChange={(e) => setNewHabitName(e.target.value)}
                className="flex-grow"
              />
              <Button type="submit">Add Habit</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>My Habits</CardTitle>
          </CardHeader>
          <CardContent>
            {habits.length > 0 ? (
              <div className="space-y-4">
                {habits.map((habit) => (
                  <div key={habit.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 border rounded-lg">
                    <div className="flex-grow w-full">
                      <p className="font-medium text-lg">{habit.name}</p>
                      <div className="flex items-center gap-2 text-muted-foreground mt-1 text-sm">
                        <Flame className="text-orange-500"/>
                        <span>{habit.streak} day streak</span>
                      </div>
                      <Progress value={habit.completion} className="mt-2 h-2" />
                    </div>
                    <Button
                      onClick={() => trackHabit(habit.id)}
                      disabled={habit.completedToday}
                      variant={habit.completedToday ? 'secondary' : 'default'}
                      className="w-full sm:w-auto shrink-0"
                    >
                      {habit.completedToday ? (
                        <>
                          <Check className="mr-2" /> Done
                        </>
                      ) : (
                        'Mark Done'
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">You haven't added any habits yet. Add one to get started!</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI Insights</CardTitle>
            <CardDescription>Get personalized advice on your habits.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleGetInsights} disabled={isLoadingInsight || habits.length === 0} className="w-full sm:w-auto">
              {isLoadingInsight && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Get Habit Insights
            </Button>
            <div className="mt-4 rounded-lg bg-secondary min-h-[100px] flex items-center justify-center p-4">
              {isLoadingInsight ? (
                 <p className="text-muted-foreground">Analyzing with AI...</p>
              ) : aiError ? (
                <p className="text-destructive">{aiError}</p>
              ) : aiInsight ? (
                <div className="space-y-4 text-secondary-foreground w-full">
                  <div className="flex items-start gap-4">
                    <ThumbsUp className="h-6 w-6 text-green-500 mt-1 shrink-0" />
                    <div>
                      <h4 className="font-semibold text-base">You're doing great!</h4>
                      <p className="text-sm text-muted-foreground">{aiInsight.positiveReinforcement}</p>
                    </div>
                  </div>
                   <div className="flex items-start gap-4">
                    <TrendingDown className="h-6 w-6 text-orange-500 mt-1 shrink-0" />
                    <div>
                      <h4 className="font-semibold text-base">A little nudge</h4>
                      <p className="text-sm text-muted-foreground">{aiInsight.areasForImprovement}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Quote className="h-6 w-6 text-blue-500 mt-1 shrink-0" />
                     <div>
                      <h4 className="font-semibold text-base">Food for thought</h4>
                      <p className="text-sm text-muted-foreground italic">"{aiInsight.motivationalQuote}"</p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground text-center">Your insights will appear here.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
