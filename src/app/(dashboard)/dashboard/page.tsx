"use client";

import { useEffect, useState } from "react";
import { 
  Footprints, Zap, Moon, Scale, Heart, 
  Thermometer, TrendingUp, Calendar as CalendarIcon, Sparkles, ChevronRight, ArrowUpRight, Loader2, Utensils
} from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { fetchWithAuth } from "@/lib/auth";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface HealthStats {
  date: string;
  label: string;
  steps: number;
  calories: number;
  weight: number | null;
}

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [weekly, setWeekly] = useState<HealthStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [statsRes, weeklyRes] = await Promise.all([
          fetchWithAuth(`http://localhost:8000/api/stats`),
          fetchWithAuth(`http://localhost:8000/api/stats/weekly`)
        ]);
        
        if (statsRes.ok) setData(await statsRes.json());
        if (weeklyRes.ok) setWeekly(await weeklyRes.json());
      } catch (error) {
        console.error("Erreur:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading && !data) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm font-medium text-slate-500">Initialisation du moteur d&apos;analyse...</p>
    </div>
  );

  const h = data?.health;
  const currentSteps = h?.activity?.steps || 0;
  const stepGoal = data?.goals?.steps || 10000;
  const stepProgress = Math.min((currentSteps / stepGoal) * 100, 100);

  const pieData = [
    { name: 'P', value: h?.nutrition?.protein || 0, color: 'hsl(var(--primary))' },
    { name: 'G', value: h?.nutrition?.carbs || 0, color: '#10b981' },
    { name: 'L', value: h?.nutrition?.fat || 0, color: '#f59e0b' }
  ].filter(d => d.value > 0);

  return (
    <div className="flex-1 space-y-8 p-8 pt-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Vue d&apos;ensemble</h2>
          <p className="text-muted-foreground text-sm font-medium">Analyse en temps réel de vos constantes vitales.</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="hidden md:flex items-center px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-bold uppercase tracking-wider border border-emerald-100 mr-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mr-2"></div>
            Flux Google Fit Actif
          </div>
          <Button variant="outline" size="sm" className="h-9 shadow-sm border-slate-200">
            <CalendarIcon className="mr-2 h-4 w-4 text-slate-400" /> Février 2026
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm border-slate-200/60 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-slate-50/30">
            <CardTitle className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Pas du jour</CardTitle>
            <Footprints className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-3xl font-black">{currentSteps.toLocaleString()}</div>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-100 font-bold px-1.5">
                <ArrowUpRight className="h-3 w-3 mr-0.5" /> 12.5%
              </Badge>
              <span className="text-[10px] text-slate-400 font-medium italic">vs moyenne</span>
            </div>
            <Progress value={stepProgress} className="h-1 mt-4 bg-slate-100" indicatorClassName="bg-primary" />
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200/60 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-slate-50/30">
            <CardTitle className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Dépense Énergétique</CardTitle>
            <Zap className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-3xl font-black">{h?.activity?.calories || 0} <span className="text-sm font-bold text-slate-400">kcal</span></div>
            <div className="text-[10px] text-slate-400 font-medium mt-2 flex items-center gap-1 uppercase tracking-tighter italic">
              Métabolisme basal inclus
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200/60 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-slate-50/30">
            <CardTitle className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Bio-masse actuelle</CardTitle>
            <Scale className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-3xl font-black">{h?.body?.weight || "--"} <span className="text-sm font-bold text-slate-400">kg</span></div>
            <div className="text-[10px] text-indigo-600 font-bold mt-2 uppercase tracking-tighter">
              IMC: {(h?.body?.weight && h?.body?.height) ? (h.body.weight / Math.pow(h.body.height/100, 2)).toFixed(1) : "--"}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200/60 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-slate-50/30">
            <CardTitle className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Repos Nocturne</CardTitle>
            <Moon className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-3xl font-black">{h?.sleep?.total_hours || 0} <span className="text-sm font-bold text-slate-400">h</span></div>
            <Badge className="mt-2 bg-purple-50 text-purple-700 hover:bg-purple-100 border-none font-bold text-[9px] uppercase tracking-widest px-2 py-0">
              Optimal
            </Badge>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 border-slate-200/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold">Analyse de Performance</CardTitle>
              <CardDescription className="text-xs">Évolution du volume de pas sur 7 jours.</CardDescription>
            </div>
            <TrendingUp className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weekly} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSteps" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="label" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 11, fill: '#94a3b8', fontWeight: 600}} 
                    dy={15}
                  />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#94a3b8'}} />
                  <Tooltip 
                    contentStyle={{borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '8px 12px'}}
                    labelStyle={{fontWeight: 800, color: '#1e293b', marginBottom: '4px'}}
                  />
                  <Area type="monotone" dataKey="steps" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorSteps)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3 border-slate-200/60 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Signes Vitaux</CardTitle>
            <CardDescription className="text-xs">Mesures physiologiques récentes.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-2">
            <div className="flex items-center justify-between group cursor-pointer hover:bg-slate-50 p-2 rounded-xl transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-rose-50 text-rose-500 border border-rose-100 shadow-sm">
                  <Heart className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-700 uppercase tracking-tight">Rythme Cardiaque</p>
                  <p className="text-[10px] text-slate-400 italic">Repos: 62 bpm moy.</p>
                </div>
              </div>
              <p className="text-xl font-black text-slate-900">{h?.vitals?.heart_rate || "--"}</p>
            </div>
            
            <div className="flex items-center justify-between group cursor-pointer hover:bg-slate-50 p-2 rounded-xl transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-50 text-blue-500 border border-blue-100 shadow-sm">
                  <TrendingUp className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-700 uppercase tracking-tight">Tension Artérielle</p>
                  <p className="text-[10px] text-slate-400 italic">Systolique / Diastolique</p>
                </div>
              </div>
              <p className="text-xl font-black text-slate-900">{h?.vitals?.blood_pressure || "12/8"}</p>
            </div>

            <div className="flex items-center justify-between group cursor-pointer hover:bg-slate-50 p-2 rounded-xl transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-50 text-amber-500 border border-amber-100 shadow-sm">
                  <Thermometer className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-700 uppercase tracking-tight">Température</p>
                  <p className="text-[10px] text-slate-400 italic">Basale quotidienne</p>
                </div>
              </div>
              <p className="text-xl font-black text-slate-900">{h?.vitals?.temp || "36.6"}°C</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 bg-slate-950 text-white border-none shadow-2xl relative overflow-hidden">
          <div className="absolute right-0 top-0 w-32 h-32 bg-primary/10 rounded-full blur-[60px]"></div>
          <CardHeader className="relative z-10">
            <CardTitle className="text-white flex items-center gap-2 text-base font-black italic uppercase tracking-wider">
              <Sparkles className="h-5 w-5 text-primary" /> Synthèse Intelligence Artificielle
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <p className="text-slate-300 leading-relaxed italic text-sm font-medium pr-10">
              \"Votre volume de pas est stable cette semaine. Pour optimiser votre perte de masse grasse, essayez d&apos;ajouter 15 minutes de marche rapide en fin de journée. Votre hydratation semble correcte d&apos;après vos derniers repas.\"
            </p>
            <div className="mt-6 flex gap-3">
                <Button size="sm" className="bg-white text-slate-900 hover:bg-slate-200 font-bold px-6 rounded-lg h-9">
                    Rapport Complet
                </Button>
                <Button variant="outline" size="sm" className="border-slate-800 bg-slate-900 text-slate-400 hover:bg-slate-800 rounded-lg h-9">
                    Historique
                </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-3 border-slate-200/60 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold">Nutrition du jour</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <div className="h-20 w-20 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData.length > 0 ? pieData : [{name: 'Empty', value: 1, color: '#f1f5f9'}]}
                      innerRadius={28}
                      outerRadius={38}
                      dataKey="value"
                      stroke="none"
                      paddingAngle={5}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                      {pieData.length === 0 && <Cell fill="#f1f5f9" />}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <Utensils className="h-4 w-4 text-slate-300" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-baseline gap-1">
                    <div className="text-3xl font-black text-slate-900">{h?.nutrition?.calories || 0}</div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">kcal</span>
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  <Badge variant="secondary" className="text-[9px] bg-slate-100 border-none font-bold px-1.5 h-5">P: {Math.round(h?.nutrition?.protein || 0)}g</Badge>
                  <Badge variant="secondary" className="text-[9px] bg-slate-100 border-none font-bold px-1.5 h-5">G: {Math.round(h?.nutrition?.carbs || 0)}g</Badge>
                  <Badge variant="secondary" className="text-[9px] bg-slate-100 border-none font-bold px-1.5 h-5">L: {Math.round(h?.nutrition?.fat || 0)}g</Badge>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="w-full mt-6 text-xs font-bold text-primary hover:bg-primary/5 rounded-xl h-10 border border-primary/5" asChild>
              <a href="/nutrition">Accéder au journal détaillé <ChevronRight className="ml-1 h-3 w-3" /></a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
