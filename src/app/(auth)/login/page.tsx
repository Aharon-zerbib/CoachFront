"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Chrome } from "lucide-react";
import { fetchWithAuth } from "@/lib/auth";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    // On vérifie si on est déjà connecté en appelant le profil
    fetchWithAuth("http://localhost:8000/api/me").then(res => {
      if (res.ok) {
        router.push("/dashboard");
      }
    });
  }, []);

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:8000/auth/google";
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50 p-4">
      <Card className="w-full max-w-md shadow-lg border-t-4 border-t-blue-500">
        <CardHeader className="text-center space-y-1">
          <div className="flex justify-center mb-2">
            <div className="bg-blue-500 p-2 rounded-xl text-white">
               <Chrome className="h-8 w-8" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Coach Sportif</CardTitle>
          <CardDescription>
            Connectez-vous pour synchroniser vos données Google Fit
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 py-8">
          <Button 
            size="lg" 
            className="w-full bg-white text-black border hover:bg-gray-50 font-medium py-6"
            onClick={handleGoogleLogin}
          >
            <img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" className="h-5 w-5 mr-3" alt="Google" />
            Continuer avec Google
          </Button>
          <p className="text-[10px] text-center text-muted-foreground mt-4">
            En continuant, vous autorisez l'application à lire vos données de santé <br/> (Pas, Sommeil, Nutrition, Poids)
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
