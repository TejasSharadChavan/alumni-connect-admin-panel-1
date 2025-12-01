"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import { useEffect, useRef } from "react";

interface UserDistributionMapProps {
  locations: Array<{ city: string; count: number; lat: number; lng: number }>;
}

export function UserDistributionMap({ locations }: UserDistributionMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Simple visualization using CSS - no external map library needed initially
    // Can be upgraded to use Leaflet or Mapbox later
  }, [locations]);

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          Geographic Distribution
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div ref={mapRef} className="h-96 bg-muted rounded-lg relative overflow-hidden">
          {/* Simple city-based visualization */}
          <div className="absolute inset-0 flex flex-wrap items-center justify-center p-8">
            {locations.map((location, index) => {
              const size = Math.max(60, Math.min(location.count * 3, 150));
              const colors = [
                'bg-blue-500/30',
                'bg-green-500/30',
                'bg-purple-500/30',
                'bg-orange-500/30',
                'bg-pink-500/30',
              ];
              return (
                <div
                  key={location.city}
                  className={`rounded-full ${colors[index % colors.length]} backdrop-blur-sm border-2 border-white/50 flex flex-col items-center justify-center m-2 hover:scale-110 transition-transform cursor-pointer`}
                  style={{ width: size, height: size }}
                  title={`${location.city}: ${location.count} users`}
                >
                  <span className="font-bold text-sm">{location.count}</span>
                  <span className="text-xs">{location.city}</span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-2">
          {locations.map((location, index) => (
            <div key={location.city} className="flex items-center gap-2 text-sm">
              <div className={`w-3 h-3 rounded-full ${['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500'][index % 5]}`} />
              <span className="font-medium">{location.city}:</span>
              <span className="text-muted-foreground">{location.count}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
