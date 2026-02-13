"use client";

import { useEffect, useState } from "react";
import { 
  Activity, Footprints, Map as MapIcon, Utensils, Zap, Clock, 
  Moon, Scale, Heart, Droplets, Thermometer, ChevronRight, Info
} from "lucide-react";
import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { fetchWithAuth } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface HealthData {
  activity: {
    steps: number;
    calories: number;
    distance: number | string;
    active_minutes: number;
  };
  body: {
    weight: number | string | null;
    height: number | string | null;
    fat_percentage: number | string | null;
  };
  vitals: {
    heart_rate: number | null;
    blood_pressure: string;
    temp: number;
  };
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  sleep: {
    total_hours: number | null;
  };
}

interface StatsResponse {
  google_sync: boolean;
  health: HealthData;
  goals: {
    steps: number;
    calories: number;
    distance: number;
  };
}

export default function DashboardPage() {
  const [data, setData] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const res = await fetchWithAuth(`http://localhost:8000/api/stats?date=${selectedDate}`);
        if (res.ok) setData(await res.json());
      } catch (error) {
        console.error("Erreur chargement:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [selectedDate]);

  if (loading && !data) return <div className="p-8 text-center animate-pulse text-muted-foreground">Synchronisation de vos données de santé...</div>;

  const h = data?.health;

  const handleDisconnectGoogle = async () => {
    if (confirm("Voulez-vous vraiment déconnecter votre compte Google ? Cela vous déconnectera également de l'application.")) {
      await fetchWithAuth("http://localhost:8000/api/google/disconnect", { method: "POST" });
      await fetchWithAuth("http://localhost:8000/api/logout", { method: "POST" });
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Santé & Fitness</h1>
          <p className="text-muted-foreground text-sm">Suivi de vos performances et constantes.</p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-muted rounded-lg p-1">
            <Button 
              variant={selectedDate === new Date().toISOString().split('T')[0] ? "secondary" : "ghost"} 
              size="sm"
              onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
            >
              Aujourd&apos;hui
            </Button>
            <Button 
              variant={selectedDate === new Date(Date.now() - 86400000).toISOString().split('T')[0] ? "secondary" : "ghost"} 
              size="sm"
              onClick={() => setSelectedDate(new Date(Date.now() - 86400000).toISOString().split('T')[0])}
            >
              Hier
            </Button>
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-sm font-medium px-2 outline-none"
            />
          </div>
        </div>
      </div>

      {data?.google_sync ? (
        <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center gap-2 text-blue-700 text-sm font-medium">
            <Info className="h-4 w-4" /> Synchronisé avec Google Fit
          </div>
          <Button variant="ghost" size="sm" onClick={handleDisconnectGoogle} className="text-blue-600 hover:text-blue-800 hover:bg-blue-100 h-8">
            Changer de compte
          </Button>
        </div>
      ) : (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 flex justify-between items-center">
           <div className="text-orange-700 text-sm font-medium flex items-center gap-2">
             <Info className="h-4 w-4" /> Google Fit non connecté
           </div>
           <Button size="sm" variant="outline" className="h-8 border-orange-300 text-orange-700 hover:bg-orange-100" asChild>
              <Link href="http://localhost:8000/google/redirect">Connecter</Link>
           </Button>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        
        {/* SECTION 1: ACTIVITÉ */}
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4 text-green-500" /> Activité physique
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-2xl font-bold">{h?.activity?.steps ?? 0}</p>
                <p className="text-xs text-muted-foreground">Pas le {new Date(selectedDate).toLocaleDateString('fr-FR', {day: 'numeric', month: 'short'})}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">{h?.activity?.calories ?? 0} kcal</p>
                <p className="text-xs text-muted-foreground">Brûlées</p>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Objectif : 10 000 pas</span>
                <span>{Math.round(((h?.activity?.steps || 0) / 10000) * 100)}%</span>
              </div>
              <Progress value={((h?.activity?.steps || 0) / 10000) * 100} className="h-1" />
            </div>
            <div className="flex gap-4 pt-2 border-t text-xs">
              <span className="flex items-center gap-1"><MapIcon className="h-3 w-3" /> {h?.activity?.distance ?? 0} km</span>
              <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {h?.activity?.active_minutes ?? 0} min</span>
            </div>
          </CardContent>
        </Card>

        {/* SECTION 2: DONNÉES CORPORELLES */}
        <Card className="border-l-4 border-l-pink-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Scale className="h-4 w-4 text-pink-500" /> Données corporelles
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-2xl font-bold">{h?.body?.weight || "--"} kg</p>
                <p className="text-xs text-muted-foreground">Poids actuel</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">{h?.body?.height || "--"} cm</p>
                <p className="text-xs text-muted-foreground">Taille</p>
              </div>
            </div>
            <div className="bg-muted/50 p-2 rounded-lg text-center text-xs">
              IMC : {h?.body?.weight && h?.body?.height ? (h.body.weight / Math.pow(h.body.height/100, 2)).toFixed(1) : "--"}
            </div>
          </CardContent>
        </Card>

        {/* SECTION 3: CONSTANTES (VITALS) */}
        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Heart className="h-4 w-4 text-red-500" /> Constantes vitales
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-50 rounded-full animate-pulse">
                  <Heart className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{h?.vitals?.heart_rate || "--"}</p>
                  <p className="text-xs text-muted-foreground">BPM (Repos)</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">{h?.vitals?.blood_pressure || "12/8"}</p>
                <p className="text-xs text-muted-foreground">Tension (SYS/DIA)</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
               <Thermometer className="h-3 w-3" /> Température : {h?.vitals?.temp || "36.6"}°C
            </div>
          </CardContent>
        </Card>

        {/* SECTION 4: NUTRITION */}
        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Utensils className="h-4 w-4 text-orange-500" /> Nutrition
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-2xl font-bold text-orange-600">{h?.nutrition?.calories || 0} kcal</p>
              <p className="text-xs text-muted-foreground">Consommées le {new Date(selectedDate).toLocaleDateString('fr-FR', {day: 'numeric', month: 'short'})}</p>
            </div>
            <div className="grid grid-cols-3 gap-2 pt-2 border-t">
               <div className="text-center">
                  <p className="text-xs font-bold">{Math.round(h?.nutrition?.protein || 0)}g</p>
                  <p className="text-[10px] text-muted-foreground">Prot.</p>
               </div>
               <div className="text-center border-x">
                  <p className="text-xs font-bold">{Math.round(h?.nutrition?.carbs || 0)}g</p>
                  <p className="text-[10px] text-muted-foreground">Gluc.</p>
               </div>
               <div className="text-center">
                  <p className="text-xs font-bold">{Math.round(h?.nutrition?.fat || 0)}g</p>
                  <p className="text-[10px] text-muted-foreground">Lip.</p>
               </div>
            </div>
          </CardContent>
        </Card>

        {/* SECTION 5: SOMMEIL */}
        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Moon className="h-4 w-4 text-purple-500" /> Sommeil
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="flex items-center gap-4">
                <div className="text-3xl font-bold">{h?.sleep?.total_hours || 0}h</div>
                <div className="text-xs text-muted-foreground">
                   Nuit dernière<br/>Qualité : {h?.sleep?.total_hours > 7 ? 'Excellente' : 'Moyenne'}
                </div>
             </div>
             <div className="flex gap-2 h-2 w-full bg-muted rounded-full overflow-hidden">
                <div className="bg-purple-800 w-1/3 h-full"></div>
                <div className="bg-purple-500 w-1/2 h-full"></div>
                <div className="bg-purple-300 w-1/6 h-full"></div>
             </div>
             <p className="text-[10px] text-muted-foreground">Profond / Léger / Paradoxal</p>
          </CardContent>
        </Card>

        {/* SECTION 6: SUIVI DE CYCLE */}
        <Card className="border-l-4 border-l-indigo-400">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Droplets className="h-4 w-4 text-indigo-400" /> Suivi de cycle
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="flex justify-between items-center">
                <div className="text-xs font-medium">Jour du cycle : --</div>
                <Badge variant="secondary" className="text-[10px]">Phase Folliculaire</Badge>
             </div>
             <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span>Dernières règles : Janvier 2026</span>
                <ChevronRight className="h-4 w-4" />
             </div>
          </CardContent>
        </Card>

      </div>

      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
          <TabsTrigger value="details">Détails du jour</TabsTrigger>
          <TabsTrigger value="weekly">Résumé de la semaine</TabsTrigger>
        </TabsList>
        <TabsContent value="details" className="mt-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Repas du jour</CardTitle>
              </CardHeader>
              <CardContent>
                <DayMeals date={selectedDate} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Activités enregistrées</CardTitle>
              </CardHeader>
              <CardContent>
                <DayActivities date={selectedDate} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="weekly" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Historique Hebdomadaire</CardTitle>
              <CardDescription>Vos performances sur les 7 derniers jours.</CardDescription>
            </CardHeader>
            <CardContent>
              <WeeklyTable />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function DayMeals({ date }: { date: string }) {
  const [meals, setMeals] = useState<{
    id: number;
    description: string;
    created_at: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMeals = async () => {
      setLoading(true);
      try {
        const res = await fetchWithAuth(`http://localhost:8000/api/meals?date=${date}`);
        if (res.ok) setMeals(await res.json());
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    loadMeals();
  }, [date]);

  if (loading) return <p className="text-xs text-muted-foreground">Chargement...</p>;
  if (meals.length === 0) return <p className="text-xs text-muted-foreground italic">Aucun repas enregistré ce jour.</p>;

  return (
    <div className="space-y-3">
      {meals.map((meal) => (
        <div key={meal.id} className="flex justify-between items-center text-sm border-b pb-2 last:border-0">
          <div>
            <p className="font-medium">{meal.description || "Repas sans nom"}</p>
            <p className="text-[10px] text-muted-foreground">{new Date(meal.created_at).toLocaleTimeString([], {hour: '2h', minute:'2h'})}</p>
          </div>
          <div className="text-right">
            <p className="font-bold">{meal.calories} kcal</p>
            <p className="text-[10px] text-muted-foreground">{meal.protein}P / {meal.carbs}G / {meal.fat}L</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function DayActivities({ date }: { date: string }) {
  const [activities, setActivities] = useState<{
    id: number;
    type: string;
    duration: number;
    distance: number | string;
    steps?: number;
  }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadActivities = async () => {
      setLoading(true);
      try {
        const res = await fetchWithAuth(`http://localhost:8000/api/activities?date=${date}`);
        if (res.ok) setActivities(await res.json());
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    loadActivities();
  }, [date]);

  if (loading) return <p className="text-xs text-muted-foreground">Chargement...</p>;
  if (activities.length === 0) return <p className="text-xs text-muted-foreground italic">Aucune activité enregistrée ce jour.</p>;

  return (
    <div className="space-y-3">
      {activities.map((activity) => (
        <div key={activity.id} className="flex justify-between items-center text-sm border-b pb-2 last:border-0">
          <div className="flex items-center gap-2">
            {activity.type === 'course' ? <Zap className="h-4 w-4 text-orange-500" /> : <Footprints className="h-4 w-4 text-blue-500" />}
            <div>
              <p className="font-medium capitalize">{activity.type}</p>
              <p className="text-[10px] text-muted-foreground">{Math.floor(activity.duration / 60)} min</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-bold">{activity.distance} km</p>
            {activity.steps && <p className="text-[10px] text-muted-foreground">{activity.steps} pas</p>}
          </div>
        </div>
      ))}
    </div>
  );
}

function WeeklyTable() {
  const [days, setDays] = useState<string[]>([]);

  useEffect(() => {
    const loadWeekly = async () => {
      const last7Days = [];
      for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        last7Days.push(d.toISOString().split('T')[0]);
      }
      
      setDays(last7Days);
    };
    loadWeekly();
  }, []);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-muted-foreground">
            <th className="text-left py-2 font-medium">Date</th>
            <th className="text-center py-2 font-medium">Pas</th>
            <th className="text-center py-2 font-medium">Kcal</th>
            <th className="text-center py-2 font-medium">Sommeil</th>
            <th className="text-right py-2 font-medium">Poids</th>
          </tr>
        </thead>
        <tbody>
          {days.map(date => (
            <WeeklyRow key={date} date={date} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function WeeklyRow({ date }: { date: string }) {
  const [data, setData] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetchWithAuth(`http://localhost:8000/api/stats?date=${date}`);
        if (res.ok) setData(await res.json());
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [date]);

  const h = data?.health;
  const d = new Date(date);
  const label = d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' });

  if (loading) return (
    <tr className="border-b animate-pulse">
      <td className="py-3 text-muted-foreground capitalize">{label}</td>
      <td colSpan={4} className="text-center text-xs italic text-muted-foreground">Chargement des données...</td>
    </tr>
  );

  return (
    <tr className="border-b hover:bg-muted/50 transition-colors">
      <td className="py-3 font-medium capitalize">{label}</td>
      <td className="text-center">{h?.activity?.steps?.toLocaleString() || "0"}</td>
      <td className="text-center">{h?.activity?.calories || "0"}</td>
      <td className="text-center">{h?.sleep?.total_hours || "0"}h</td>
      <td className="text-right font-bold">{h?.body?.weight || "--"} kg</td>
    </tr>
  );
}
