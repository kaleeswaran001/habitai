// src/ai/flows/habit-insights.ts
'use server';
/**
 * @fileOverview A habit insights AI agent.
 *
 * - getHabitInsights - A function that handles the habit insights process.
 * - HabitInsightsInput - The input type for the getHabitInsights function.
 * - HabitInsightsOutput - The return type for the getHabitInsights function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const HabitDataSchema = z.object({
  name: z.string().describe('The name of the habit.'),
  streak: z.number().describe('The current streak for the habit.'),
  completion: z.number().describe('The completion percentage for the habit.'),
});

const HabitInsightsInputSchema = z.object({
  habitData: z.array(HabitDataSchema).describe('An array of habit data objects.'),
});
export type HabitInsightsInput = z.infer<typeof HabitInsightsInputSchema>;

const HabitInsightsOutputSchema = z.object({
  positiveReinforcement: z.string().describe("A short, positive comment about a high-performing habit. Focus on the one with the best streak or completion rate."),
  areasForImprovement: z.string().describe("A short, constructive suggestion for a low-performing habit. Gently nudge the user to focus on it."),
  motivationalQuote: z.string().describe("A short, inspiring quote related to habits, consistency, or self-improvement."),
});
export type HabitInsightsOutput = z.infer<typeof HabitInsightsOutputSchema>;

export async function getHabitInsights(input: HabitInsightsInput): Promise<HabitInsightsOutput> {
  return habitInsightsFlow(input);
}

const PromptInputSchema = z.object({
  habitDataString: z.string(),
});

const habitInsightsPrompt = ai.definePrompt({
  name: 'habitInsightsPrompt',
  input: {schema: PromptInputSchema},
  output: {schema: HabitInsightsOutputSchema},
  prompt: `You are a helpful and motivating habit coach. Analyze the user's habit data provided below.
Your goal is to provide structured, concise, and actionable feedback.

Habit Data:
{{{habitDataString}}}

Based on this data, provide the following:
1.  **Positive Reinforcement:** Find the user's most successful habit (longest streak or highest completion) and give them a brief, encouraging compliment about it.
2.  **Area for Improvement:** Identify a habit the user is struggling with (low streak or completion) and offer a gentle, supportive suggestion to help them get back on track.
3.  **Motivational Quote:** Provide a short, relevant quote to inspire them.`,
});

const habitInsightsFlow = ai.defineFlow(
  {
    name: 'habitInsightsFlow',
    inputSchema: HabitInsightsInputSchema,
    outputSchema: HabitInsightsOutputSchema,
  },
  async input => {
    const {output} = await habitInsightsPrompt({ 
      habitDataString: JSON.stringify(input.habitData, null, 2) 
    });
    return output!;
  }
);
