import Link from "next/link";
import { Activity, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-16 items-center px-4 md:px-6 border-b">
        <div className="flex items-center gap-2 font-bold text-xl">
          <Activity className="h-6 w-6 text-primary" />
          <span>Smart Coach</span>
        </div>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-3xl space-y-6">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl">
            Votre coach sportif personnel, propulsé par l'IA.
          </h1>
          <p className="text-xl text-muted-foreground">
            Suivez vos courses en temps réel, analysez vos repas avec Gemini et obtenez des conseils personnalisés basés sur votre profil de 1m70.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/login">
                Démarrer maintenant <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg">
              En savoir plus
            </Button>
          </div>
        </div>
      </main>
      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        © 2026 Smart Coach - Développé pour Ronron.
      </footer>
    </div>
  );
}
