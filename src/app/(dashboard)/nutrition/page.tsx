"use client";

import { useEffect, useState, useRef } from "react";
import { 
  Utensils, Plus, Camera, Loader2, Calendar as CalendarIcon, 
  ChevronRight, ArrowUpRight, ArrowDownRight, PieChart as PieChartIcon,
  Trash2, Info, Sparkles, Filter
} from "lucide-react";
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip
} from 'recharts';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { fetchWithAuth } from "@/lib/auth";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Meal {
  id: number;
  description: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  ai_analysis?: string;
  created_at: string;
}

export default function NutritionPage() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showAddForm, setShowAddForm] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [description, setDescription] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const [mealsRes, statsRes] = await Promise.all([
        fetchWithAuth(`http://localhost:8000/api/meals?date=${selectedDate}`),
        fetchWithAuth(`http://localhost:8000/api/stats?date=${selectedDate}`)
      ]);
      
      if (mealsRes.ok) setMeals(await mealsRes.json());
      if (statsRes.ok) setStats(await statsRes.json());
    } catch (error) {
      console.error("Erreur nutrition:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedDate]);

  const handleDeleteMeal = async (id: number) => {
    if (!confirm("Supprimer ce repas du journal ?")) return;
    try {
      const res = await fetchWithAuth(`http://localhost:8000/api/meals/${id}`, {
        method: "DELETE"
      });
      if (res.ok) loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAnalyzing(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Data = reader.result as string;
      
      try {
        const res = await fetchWithAuth("http://localhost:8000/api/meals", {
          method: "POST",
          body: JSON.stringify({
            image_data: base64Data,
            description: description || "Repas analysé par IA"
          })
        });

        if (res.ok) {
          setShowAddForm(false);
          setDescription("");
          loadData();
        } else {
          const errData = await res.json();
          alert(`Erreur: ${errData.message || "Analyse impossible"}`);
        }
      } catch (err) {
        console.error(err);
        alert("Problème de connexion ou image trop volumineuse. Essayez une photo plus légère.");
      } finally {
        setAnalyzing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const nutrition = stats?.health?.nutrition || { calories: 0, protein: 0, carbs: 0, fat: 0 };
  const goal = 2200;
  
  const macroData = [
    { name: 'Protéines', value: (nutrition.protein || 0) * 4, color: 'hsl(var(--primary))' },
    { name: 'Glucides', value: (nutrition.carbs || 0) * 4, color: '#10b981' },
    { name: 'Lipides', value: (nutrition.fat || 0) * 9, color: '#f59e0b' },
  ].filter(d => d.value > 0);

  if (loading && !stats) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm font-medium text-slate-500">Chargement de votre journal...</p>
    </div>
  );

  return (
    <div className="flex-1 space-y-8 p-8 pt-6 max-w-7xl mx-auto w-full">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Journal Nutritionnel</h2>
          <p className="text-muted-foreground text-sm font-medium">Analysez vos repas et équilibrez vos macros.</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="date" 
              className="flex h-10 w-[180px] rounded-xl border border-slate-200 bg-white pl-10 pr-3 py-2 text-sm shadow-sm transition-all focus:ring-2 focus:ring-primary/20 outline-none font-bold text-slate-700"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
          <Button onClick={() => setShowAddForm(!showAddForm)} className="rounded-xl shadow-lg shadow-primary/20 px-6 font-bold">
            {showAddForm ? "Annuler" : <><Plus className="mr-2 h-4 w-4" /> Ajouter un repas</>}
          </Button>
        </div>
      </div>

      {showAddForm && (
        <Card className="border-primary/20 bg-primary/5 shadow-2xl shadow-primary/5 rounded-[24px] animate-in slide-in-from-top-4 duration-300">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" /> Analyse Instantanée par IA
            </CardTitle>
            <CardDescription className="text-slate-500 font-medium">Prenez une photo de votre assiette pour extraire les données nutritionnelles.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-3">
              <Label htmlFor="desc" className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Contextualisation (facultatif)</Label>
              <Input 
                id="desc" 
                placeholder="Ex: Salade au poulet grillé et avocat..." 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="h-12 rounded-xl border-slate-200 shadow-sm"
              />
            </div>
            <div className="flex items-center gap-4">
              <Button 
                onClick={() => fileInputRef.current?.click()} 
                disabled={analyzing}
                className="w-full h-32 border-2 border-dashed border-primary/30 bg-white hover:bg-slate-50 text-primary flex flex-col gap-3 rounded-2xl transition-all group"
                variant="outline"
              >
                {analyzing ? (
                  <Loader2 className="h-10 w-10 animate-spin" />
                ) : (
                  <div className="p-4 rounded-full bg-primary/5 group-hover:scale-110 transition-transform">
                    <Camera className="h-10 w-10" />
                  </div>
                )}
                <span className="font-bold tracking-tight">{analyzing ? "L'IA analyse votre plat..." : "Cliquer pour prendre en photo ou choisir un fichier"}</span>
              </Button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                className="hidden" 
                accept="image/*"
              />
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-slate-200/60 shadow-sm overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-slate-50/30 px-6 pt-6">
            <CardTitle className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Apport Calorique</CardTitle>
            <Utensils className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent className="p-6 pt-4">
            <div className="text-3xl font-black">{nutrition.calories} <span className="text-sm font-bold text-slate-400">/ {goal}</span></div>
            <Progress value={(nutrition.calories / goal) * 100} className="mt-4 h-1.5 bg-slate-100" />
            <p className="text-[10px] font-bold uppercase mt-3 text-slate-400 tracking-tighter">
              {nutrition.calories > goal ? "⚠️ Seuil de maintenance dépassé" : `${goal - nutrition.calories} kcal restantes pour la journée`}
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-slate-200/60 shadow-sm">
          <CardHeader className="pb-2 px-6 pt-6">
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <CardTitle className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Protéines</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="text-3xl font-black text-slate-900">{Math.round(nutrition.protein)}g</div>
            <div className="mt-2 text-[10px] font-medium text-slate-400 uppercase tracking-widest italic">
                {(nutrition.protein * 4 / (nutrition.calories || 1) * 100).toFixed(0)}% du volume total
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/60 shadow-sm">
          <CardHeader className="pb-2 px-6 pt-6">
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <CardTitle className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Glucides</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="text-3xl font-black text-slate-900">{Math.round(nutrition.carbs)}g</div>
            <div className="mt-2 text-[10px] font-medium text-slate-400 uppercase tracking-widest italic">
                {(nutrition.carbs * 4 / (nutrition.calories || 1) * 100).toFixed(0)}% du volume total
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/60 shadow-sm">
          <CardHeader className="pb-2 px-6 pt-6">
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <CardTitle className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Lipides</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="text-3xl font-black text-slate-900">{Math.round(nutrition.fat)}g</div>
            <div className="mt-2 text-[10px] font-medium text-slate-400 uppercase tracking-widest italic">
                {(nutrition.fat * 9 / (nutrition.calories || 1) * 100).toFixed(0)}% du volume total
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 border-slate-200/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 px-8 py-6">
            <div>
              <CardTitle className="text-lg font-bold tracking-tight">Historique Alimentaire</CardTitle>
              <CardDescription className="text-xs">Timeline détaillée de vos consommations.</CardDescription>
            </div>
            <Button variant="outline" size="sm" className="rounded-lg h-8 text-[10px] font-black uppercase border-slate-200 shadow-none hover:bg-slate-50">
                <Filter className="h-3 w-3 mr-1.5" /> Filtrer
            </Button>
          </CardHeader>
          <CardContent className="p-8">
            <div className="space-y-6">
              {meals.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-slate-100 rounded-[32px] bg-slate-50/20">
                  <div className="p-4 rounded-full bg-white shadow-sm mb-4">
                    <Utensils className="h-10 w-10 text-slate-200" />
                  </div>
                  <p className="text-base font-bold text-slate-400 uppercase tracking-tight">Aucun repas enregistré aujourd&apos;hui.</p>
                  <p className="text-xs text-slate-300 mt-1">Utilisez le bouton en haut pour commencer l&apos;analyse.</p>
                </div>
              ) : (
                meals.map((meal) => (
                  <div key={meal.id} className="flex flex-col gap-4 rounded-[24px] border border-slate-100 bg-white p-6 shadow-sm hover:shadow-md hover:border-primary/10 transition-all group">
                    <div className="flex items-start gap-5">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 group-hover:bg-primary/5 group-hover:text-primary transition-colors shrink-0 border border-slate-50">
                        <Utensils className="h-7 w-7" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="text-lg font-bold text-slate-900 leading-none tracking-tight">{meal.description || "Repas sans nom"}</p>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <span className="text-2xl font-black text-slate-900">{meal.calories}</span>
                              <span className="text-[10px] font-bold text-slate-400 uppercase ml-1">kcal</span>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteMeal(meal.id)} className="h-9 w-9 rounded-xl text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all opacity-0 group-hover:opacity-100">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest bg-slate-50/50 text-slate-400 border-slate-100 px-2">
                                {new Date(meal.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                            </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 pl-[76px]">
                      <Badge variant="secondary" className="rounded-lg bg-slate-50 text-slate-600 border-none font-bold text-[10px] px-3">P: {Math.round(meal.protein)}g</Badge>
                      <Badge variant="secondary" className="rounded-lg bg-slate-50 text-slate-600 border-none font-bold text-[10px] px-3">G: {Math.round(meal.carbs)}g</Badge>
                      <Badge variant="secondary" className="rounded-lg bg-slate-50 text-slate-600 border-none font-bold text-[10px] px-3">L: {Math.round(meal.fat)}g</Badge>
                    </div>

                    {meal.ai_analysis && (
                      <div className="mt-2 ml-[76px] rounded-2xl bg-indigo-50/30 p-4 text-xs font-medium text-slate-600 border-l-4 border-indigo-400 italic leading-relaxed">
                        <div className="flex items-center gap-1.5 mb-2 not-italic font-black text-[10px] uppercase tracking-[0.2em] text-indigo-600">
                          <Sparkles className="h-3 w-3" /> Analyse IA_Engine
                        </div>
                        {meal.ai_analysis}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <div className="col-span-3 space-y-8">
          <Card className="border-slate-200/60 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50/30 border-b border-slate-100 px-8 py-6">
              <CardTitle className="text-base font-bold">Répartition Énergétique</CardTitle>
              <CardDescription className="text-[10px] font-bold uppercase tracking-widest">Équilibre des macros</CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-10">
              <div className="h-[220px] w-full relative">
                {macroData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={macroData}
                        innerRadius={65}
                        outerRadius={85}
                        paddingAngle={8}
                        dataKey="value"
                        stroke="none"
                      >
                        {macroData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-300 italic text-sm gap-2">
                    <PieChartIcon className="h-8 w-8 opacity-20" />
                    <span>En attente de données</span>
                  </div>
                )}
                {macroData.length > 0 && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-2xl font-black text-slate-900 tracking-tighter">{nutrition.calories}</span>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">total kcal</span>
                    </div>
                )}
              </div>
              <div className="mt-8 space-y-3">
                  <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                          <span className="text-xs font-bold text-slate-600">Protéines</span>
                      </div>
                      <span className="text-xs font-black text-slate-900">{Math.round(nutrition.protein)}g</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-50 pt-3">
                      <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                          <span className="text-xs font-bold text-slate-600">Glucides</span>
                      </div>
                      <span className="text-xs font-black text-slate-900">{Math.round(nutrition.carbs)}g</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-50 pt-3">
                      <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                          <span className="text-xs font-bold text-slate-600">Lipides</span>
                      </div>
                      <span className="text-xs font-black text-slate-900">{Math.round(nutrition.fat)}g</span>
                  </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 text-white border-none shadow-2xl overflow-hidden relative">
            <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl"></div>
            <CardHeader className="relative z-10">
              <CardTitle className="text-white flex items-center gap-2 text-sm font-black italic uppercase tracking-widest">
                <Info className="h-4 w-4 text-indigo-400" /> Recommandation IA
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10 pt-0">
              <p className="text-xs text-slate-300 leading-relaxed italic font-medium">
                {meals.length > 0 
                  ? "Votre répartition est équilibrée. Continuez à privilégier les protéines pour atteindre vos objectifs de gain musculaire. Une légère augmentation des glucides complexes avant votre séance de demain serait optimale."
                  : "Enregistrez votre premier repas pour recevoir une analyse personnalisée et des conseils nutritionnels adaptés à votre profil."}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
