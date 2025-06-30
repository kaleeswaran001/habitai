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
  insights: z.string().describe('AI-generated insights and suggestions for improving habits.'),
});
export type HabitInsightsOutput = z.infer<typeof HabitInsightsOutputSchema>;

export async function getHabitInsights(input: HabitInsightsInput): Promise<HabitInsightsOutput> {
  return habitInsightsFlow(input);
}

const habitInsightsPrompt = ai.definePrompt({
  name: 'habitInsightsPrompt',
  input: {schema: HabitInsightsInputSchema},
  output: {schema: HabitInsightsOutputSchema},
  prompt: `You are a helpful habit coach. Analyze the user's habit data and provide 2-3 actionable insights. Keep it motivational and concise.

Here is my habit data: {{{JSON.stringify habitData}}}.
What insights can you give me to improve my habits?`,
});

const habitInsightsFlow = ai.defineFlow(
  {
    name: 'habitInsightsFlow',
    inputSchema: HabitInsightsInputSchema,
    outputSchema: HabitInsightsOutputSchema,
  },
  async input => {
    const {output} = await habitInsightsPrompt(input);
    return output!;
  }
);
