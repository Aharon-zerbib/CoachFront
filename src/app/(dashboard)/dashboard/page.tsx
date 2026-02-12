"use client";

import { useEffect, useState } from "react";
import { Activity, Flame, Footprints, Map as MapIcon, Plus, Utensils, Zap, Clock, Calendar } from "lucide-react";
import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { fetchWithAuth } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [meals, setMeals] = useState<any[]>([]);
  const [analysis, setAnalysis] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [statsRes, activitiesRes, mealsRes] = await Promise.all([
          fetchWithAuth("http://127.0.0.1:8000/api/stats"),
          fetchWithAuth("http://127.0.0.1:8000/api/activities"),
          fetchWithAuth("http://127.0.0.1:8000/api/meals")
        ]);

        if (statsRes.ok) setStats(await statsRes.json());
        if (activitiesRes.ok) setActivities(await activitiesRes.json());
        if (mealsRes.ok) setMeals(await mealsRes.json());
        
      } catch (error) {
        console.error("Erreur chargement données:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      const response = await fetchWithAuth("http://127.0.0.1:8000/api/analysis");
      if (response.ok) {
        const data = await response.json();
        setAnalysis(data.analysis);
      }
    } catch (error) {
      console.error("Erreur analyse:", error);
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) return <div className="p-8 text-center animate-pulse text-muted-foreground">Préparation de votre coach...</div>;

  const distanceProgress = stats ? (stats.today.distance / stats.goals.distance) * 100 : 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Tableau de bord</h1>
        <div className="flex items-center gap-2">
          <Button asChild>
            <Link href="/tracker">
               <Plus className="mr-2 h-4 w-4" /> Nouvelle activité
            </Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="activities">Mes Activités</TabsTrigger>
          <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Calories Brûlées</CardTitle>
                <Flame className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.today.calories || 0} kcal</div>
                <p className="text-xs text-muted-foreground">Aujourd'hui</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Distance du jour</CardTitle>
                <MapIcon className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.today.distance.toFixed(2) || "0.00"} km</div>
                <p className="text-xs text-muted-foreground">
                  Objectif : {stats?.goals.distance} km ({distanceProgress.toFixed(0)}%)
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pas du jour</CardTitle>
                <Footprints className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.today.steps || 0}</div>
                <p className="text-xs text-muted-foreground">Objectif : {stats?.goals.steps} pas</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Dernières Activités</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activities.slice(0, 3).length > 0 ? (
                    activities.slice(0, 3).map((act) => (
                      <div key={act.id} className="flex items-center gap-4 border-b pb-2">
                        <div className="bg-primary/10 p-2 rounded-full text-primary">
                          <Activity className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                           <p className="text-sm font-medium capitalize">{act.type}</p>
                           <p className="text-xs text-muted-foreground">{new Date(act.created_at).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                           <p className="text-sm font-bold">{act.distance} km</p>
                           <p className="text-xs text-muted-foreground">{Math.floor(act.duration / 60)} min</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-10 text-muted-foreground italic text-sm">
                       Aucune activité enregistrée.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" /> Analyse IA
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-sm">
                  <p>{analysis || "Cliquez pour une analyse personnalisée."}</p>
                  <Button variant="outline" className="w-full" onClick={handleAnalyze} disabled={analyzing}>
                    {analyzing ? "Réflexion..." : "Analyser ma journée"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activities">
          <Card>
            <CardHeader>
              <CardTitle>Historique Sportif</CardTitle>
            </CardHeader>
            <CardContent>
               <div className="grid gap-4">
                  {activities.map((act) => (
                    <div key={act.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <Badge variant="outline" className="capitalize">{act.type}</Badge>
                        <div>
                          <p className="font-bold">{act.distance} km</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {Math.floor(act.duration / 60)} min
                          </p>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> {new Date(act.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                  {activities.length === 0 && <p className="text-center py-10 text-muted-foreground">Commencez à bouger !</p>}
               </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="nutrition">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Journal Alimentaire</CardTitle>
                <CardDescription>Vos repas analysés par l'IA.</CardDescription>
              </div>
              <Button asChild variant="outline" size="sm">
                 <Link href="/nutrition">Ajouter un repas</Link>
              </Button>
            </CardHeader>
            <CardContent>
               <div className="grid gap-4">
                  {meals.map((meal) => (
                    <div key={meal.id} className="flex gap-4 p-4 border rounded-lg">
                      {meal.image_path && (
                        <img 
                          src={`http://127.0.0.1:8000/storage/${meal.image_path}`} 
                          className="h-16 w-16 object-cover rounded-md"
                          alt="Repas"
                        />
                      )}
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <p className="font-bold text-orange-600">{meal.calories} kcal</p>
                          <span className="text-[10px] text-muted-foreground">{new Date(meal.created_at).toLocaleDateString()}</span>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{meal.ai_analysis}</p>
                        <div className="flex gap-2 mt-2">
                           <Badge className="text-[10px] h-4">P: {meal.protein}g</Badge>
                           <Badge className="text-[10px] h-4">G: {meal.carbs}g</Badge>
                           <Badge className="text-[10px] h-4">L: {meal.fat}g</Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                  {meals.length === 0 && <p className="text-center py-10 text-muted-foreground">Aucun repas enregistré.</p>}
               </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
