"use client";

import { useState, useEffect, useRef } from "react";
import { Play, Square, MapPin, Timer, Zap, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchWithAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { MapContainer, TileLayer, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix pour les icônes Leaflet par défaut dans Next.js
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface Location {
  lat: number;
  lng: number;
  timestamp: number;
}

// Composant pour recentrer la carte sur la position actuelle
function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  map.setView(center);
  return null;
}

export default function ActivityTracker() {
  const [isActive, setIsActive] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [distance, setDistance] = useState(0); // en km
  const [path, setPath] = useState<Location[]>([]);
  const [currentPos, setCurrentPos] = useState<[number, number] | null>(null);
  const [saving, setSaving] = useState(false);
  const watchId = useRef<number | null>(null);
  const router = useRouter();

  // Initialiser la position
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setCurrentPos([pos.coords.latitude, pos.coords.longitude]);
      });
    }
  }, []);

  // Chronomètre
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive) {
      interval = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  // Géolocalisation
  const startTracking = () => {
    if (!navigator.geolocation) {
      alert("La géolocalisation n'est pas supportée.");
      return;
    }

    setIsActive(true);
    setPath([]);
    setDistance(0);
    setSeconds(0);

    watchId.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newLocation = { lat: latitude, lng: longitude, timestamp: Date.now() };
        
        setCurrentPos([latitude, longitude]);
        setPath((prev) => {
          if (prev.length > 0) {
            const last = prev[prev.length - 1];
            const d = calculateDistance(last.lat, last.lng, latitude, longitude);
            // On n'ajoute la distance que si on a bougé de plus de 5 mètres pour éviter les sauts GPS
            if (d > 0.005) {
                setDistance((prevDist) => prevDist + d);
                return [...prev, newLocation];
            }
            return prev;
          }
          return [newLocation];
        });
      },
      (error) => console.error(error),
      { enableHighAccuracy: true }
    );
  };

  const stopTracking = async () => {
    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current);
    }
    setIsActive(false);
    setSaving(true);

    try {
      const response = await fetchWithAuth("http://127.0.0.1:8000/api/activities", {
        method: "POST",
        body: JSON.stringify({
          type: "course",
          distance: parseFloat(distance.toFixed(2)),
          duration: seconds,
          path_data: path,
        }),
      });

      if (response.ok) {
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Erreur sauvegarde activité:", error);
    } finally {
        setSaving(false);
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const deg2rad = (deg: number) => deg * (Math.PI / 180);

  const formatTime = (s: number) => {
    const hrs = Math.floor(s / 3600);
    const mins = Math.floor((s % 3600) / 60);
    const secs = s % 60;
    return `${hrs > 0 ? hrs + ":" : ""}${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Session en direct</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-8 py-10">
          <div className="grid grid-cols-2 w-full gap-4 text-center">
            <div className="space-y-1">
              <div className="text-muted-foreground flex items-center justify-center gap-1 text-sm">
                <Timer className="h-4 w-4" /> Temps
              </div>
              <div className="text-4xl font-black tracking-tighter">{formatTime(seconds)}</div>
            </div>
            <div className="space-y-1">
              <div className="text-muted-foreground flex items-center justify-center gap-1 text-sm">
                <MapPin className="h-4 w-4" /> Distance
              </div>
              <div className="text-4xl font-black tracking-tighter">
                {distance.toFixed(2)} <span className="text-xl">km</span>
              </div>
            </div>
          </div>

          {!isActive ? (
            <Button size="lg" className="h-28 w-28 rounded-full shadow-lg" onClick={startTracking} disabled={saving}>
              {saving ? <Loader2 className="h-10 w-10 animate-spin" /> : <Play className="h-12 w-12 fill-current ml-1" />}
            </Button>
          ) : (
            <Button size="lg" variant="destructive" className="h-28 w-28 rounded-full shadow-lg animate-pulse" onClick={stopTracking}>
              <Square className="h-12 w-12 fill-current" />
            </Button>
          )}

          <div className="text-sm font-medium text-muted-foreground">
            {isActive ? "Enregistrement en cours..." : "Prêt à dépasser vos limites ?"}
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden min-h-[400px]">
        <div className="h-full w-full bg-muted flex items-center justify-center">
          {currentPos ? (
            <MapContainer 
              center={currentPos} 
              zoom={15} 
              style={{ height: "100%", width: "100%" }}
              zoomControl={false}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {currentPos && <ChangeView center={currentPos} />}
              {path.length > 1 && (
                <Polyline 
                  positions={path.map(p => [p.lat, p.lng])} 
                  color="hsl(var(--primary))" 
                  weight={5} 
                />
              )}
            </MapContainer>
          ) : (
            <div className="text-center p-6 space-y-2">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              <p className="text-sm text-muted-foreground">Recherche du signal GPS...</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
