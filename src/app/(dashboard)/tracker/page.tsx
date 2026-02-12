"use client";

import dynamic from "next/dynamic";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// On importe le tracker en dynamique pour éviter les erreurs SSR avec Leaflet
const ActivityTracker = dynamic(
  () => import("@/components/tracker/ActivityTracker"),
  { 
    ssr: false,
    loading: () => <div className="h-[400px] flex items-center justify-center bg-muted animate-pulse rounded-lg">Chargement du tracker GPS...</div>
  }
);

export default function TrackerPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Tracker d'activité</h1>
      </div>

      <ActivityTracker />
    </div>
  );
}
