"use client";

import { useState } from "react";
import { Upload, X, Loader2, Apple } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function NutritionPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;

    setLoading(true);
    setAnalysis(null);

    try {
      // 1. Compression ultra-légère pour Windows
      const resizeImage = (file: File): Promise<string> => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
              const canvas = document.createElement("canvas");
              const MAX_SIZE = 500; // Taille plume pour passer partout sur Windows
              let width = img.width;
              let height = img.height;
              if (width > height) { if (width > MAX_SIZE) { height *= MAX_SIZE / width; width = MAX_SIZE; } }
              else { if (height > MAX_SIZE) { width *= MAX_SIZE / height; height = MAX_SIZE; } }
              canvas.width = width;
              canvas.height = height;
              const ctx = canvas.getContext("2d");
              ctx?.drawImage(img, 0, 0, width, height);
              resolve(canvas.toDataURL("image/jpeg", 0.3));
            };
          };
        });
      };

      const base64Image = await resizeImage(file);
      const token = localStorage.getItem("token");

      // 2. Appel API sur localhost (harmonisé)
      const response = await fetch("http://localhost:8000/api/meals", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          image_data: base64Image, 
          description: description,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setAnalysis(data);
        setPreview(null);
        setFile(null);
        setDescription("");
      } else {
        alert(data.message || "L'IA n'a pas pu répondre.");
      }
    } catch (error) {
      console.error("Erreur:", error);
      alert("Problème de connexion avec le serveur.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-2">
        <Apple className="h-8 w-8 text-orange-500" />
        <h1 className="text-3xl font-bold tracking-tight">Mon Coach Nutrition</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-2">
          <CardHeader>
            <CardTitle>Nouvelle Analyse</CardTitle>
            <CardDescription>Prends ton plat en photo, l'IA calcule tout.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative group flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-xl bg-muted/30 hover:bg-muted/50 transition-all cursor-pointer overflow-hidden">
              {preview ? (
                <>
                  <img src={preview} className="w-full h-full object-cover" />
                  <Button variant="destructive" size="icon" className="absolute top-2 right-2" onClick={() => {setPreview(null); setFile(null);}}>
                    <X className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer">
                  <Upload className="h-12 w-12 text-muted-foreground group-hover:scale-110 transition-transform" />
                  <span className="mt-2 text-sm text-muted-foreground font-medium">Cliquer pour ajouter une photo</span>
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                </label>
              )}
            </div>

            <Textarea
              placeholder="Que mangez-vous ? (Optionnel)"
              className="min-h-[100px]"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <Button className="w-full h-12 text-lg" onClick={handleAnalyze} disabled={!file || loading}>
              {loading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Analyse IA en cours...</> : "Lancer l'analyse"}
            </Button>
          </CardContent>
        </Card>

        <Card className="border-2 bg-orange-50/10">
          <CardHeader>
            <CardTitle>Résultats</CardTitle>
            <CardDescription>Estimations visuelles de l'IA.</CardDescription>
          </CardHeader>
          <CardContent>
            {analysis ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-orange-500 text-white rounded-xl text-center">
                    <p className="text-3xl font-black">{analysis.calories}</p>
                    <p className="text-xs uppercase font-bold opacity-80">Calories (kcal)</p>
                  </div>
                  <div className="p-4 bg-blue-500 text-white rounded-xl text-center">
                    <p className="text-3xl font-black">{analysis.protein}g</p>
                    <p className="text-xs uppercase font-bold opacity-80">Protéines</p>
                  </div>
                  <div className="p-4 bg-green-500 text-white rounded-xl text-center">
                    <p className="text-3xl font-black">{analysis.carbs}g</p>
                    <p className="text-xs uppercase font-bold opacity-80">Glucides</p>
                  </div>
                  <div className="p-4 bg-yellow-500 text-white rounded-xl text-center">
                    <p className="text-3xl font-black">{analysis.fat}g</p>
                    <p className="text-xs uppercase font-bold opacity-80">Lipides</p>
                  </div>
                </div>
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm font-semibold mb-2">Analyse du plat :</p>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">{analysis.ai_analysis}</p>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center py-20 text-muted-foreground italic text-center">
                <Apple className="h-12 w-12 mb-4 opacity-10" />
                <p>Aucune analyse en cours.</p>
                <p className="text-xs">Poste une photo pour voir tes macros !</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
