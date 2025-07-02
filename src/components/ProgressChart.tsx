
'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Habit } from '@/types';
import { subDays, format, eachDayOfInterval } from 'date-fns';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';

interface ProgressChartProps {
  habits: Habit[];
}

export default function ProgressChart({ habits }: ProgressChartProps) {
  const chartData = (() => {
    const today = new Date();
    const last7Days = eachDayOfInterval({
      start: subDays(today, 6),
      end: today,
    });

    return last7Days.map(date => {
      const dateString = date.toISOString().split('T')[0];
      const dayName = format(date, 'EEE');
      
      const completedCount = habits.reduce((count, habit) => {
        if (habit.history.includes(dateString)) {
          return count + 1;
        }
        return count;
      }, 0);

      return {
        date: dayName,
        completed: completedCount,
      };
    });
  })();

  const chartConfig = {
    completed: {
      label: 'Completed Habits',
      color: 'hsl(var(--primary))',
    },
  } satisfies ChartConfig;

  const yAxisDomain = [0, Math.max(5, Math.max(...chartData.map(d => d.completed)) + 1)];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Progress</CardTitle>
        <CardDescription>Habits completed in the last 7 days.</CardDescription>
      </CardHeader>
      <CardContent className="pl-2">
        {habits.length > 0 ? (
           <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
            <BarChart
              accessibilityLayer
              data={chartData}
              margin={{
                left: 12,
                right: 12,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                domain={yAxisDomain}
                allowDecimals={false}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideIndicator />}
              />
              <Bar dataKey="completed" fill="var(--color-completed)" radius={4} />
            </BarChart>
          </ChartContainer>
        ) : (
          <div className="flex h-[200px] items-center justify-center">
            <p className="text-muted-foreground">No habit data to display. Start tracking!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
