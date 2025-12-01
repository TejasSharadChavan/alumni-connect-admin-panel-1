"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "lucide-react";

interface ActivityHeatmapProps {
  data: Record<string, number>;
}

export function ActivityHeatmap({ data }: ActivityHeatmapProps) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const getIntensity = (day: string, hour: number) => {
    const key = `${day}-${hour}`;
    const value = data[key] || 0;
    const maxValue = Math.max(...Object.values(data), 1);
    return Math.round((value / maxValue) * 100);
  };

  const getColor = (intensity: number) => {
    if (intensity === 0) return 'bg-muted';
    if (intensity < 25) return 'bg-green-200 dark:bg-green-900';
    if (intensity < 50) return 'bg-green-300 dark:bg-green-800';
    if (intensity < 75) return 'bg-green-400 dark:bg-green-700';
    return 'bg-green-500 dark:bg-green-600';
  };

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Activity Heatmap
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex gap-1">
            <div className="w-12" />
            {hours.filter((h) => h % 3 === 0).map((hour) => (
              <div key={hour} className="flex-1 text-center text-xs text-muted-foreground">
                {hour}
              </div>
            ))}
          </div>
          {days.map((day) => (
            <div key={day} className="flex gap-1 items-center">
              <div className="w-12 text-xs text-muted-foreground">{day}</div>
              {hours.map((hour) => {
                const intensity = getIntensity(day, hour);
                return (
                  <div
                    key={hour}
                    className={`flex-1 aspect-square rounded ${getColor(intensity)} cursor-pointer hover:scale-110 transition-transform`}
                    title={`${day} ${hour}:00 - ${intensity}% active`}
                  />
                );
              })}
            </div>
          ))}
        </div>
        <div className="flex items-center justify-center gap-2 mt-4 text-xs text-muted-foreground">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="w-4 h-4 bg-muted rounded" />
            <div className="w-4 h-4 bg-green-200 dark:bg-green-900 rounded" />
            <div className="w-4 h-4 bg-green-300 dark:bg-green-800 rounded" />
            <div className="w-4 h-4 bg-green-400 dark:bg-green-700 rounded" />
            <div className="w-4 h-4 bg-green-500 dark:bg-green-600 rounded" />
          </div>
          <span>More</span>
        </div>
      </CardContent>
    </Card>
  );
}
