"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Activity, LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { fetchWithAuth, removeAuthToken } from "@/lib/auth";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const response = await fetchWithAuth("http://127.0.0.1:8000/api/me");
        if (response.ok) {
          const data = await response.json();
          setUser(data);
        } else {
          router.push("/login");
        }
      } catch (error) {
        console.error("Erreur chargement utilisateur:", error);
        router.push("/login");
      }
    };

    loadUser();
  }, [router]);

  const handleLogout = async () => {
    await fetchWithAuth("http://localhost:8000/api/logout", { method: "POST" });
    removeAuthToken();
    router.push("/login");
  };

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground animate-pulse">Chargement de votre profil...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 z-50">
        <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-lg font-semibold md:text-base"
          >
            <Activity className="h-6 w-6 text-primary" />
            <span className="font-bold">Smart Coach</span>
          </Link>
          <Link
            href="/dashboard"
            className="text-foreground transition-colors hover:text-foreground"
          >
            Tableau de Bord
          </Link>
          <Link
            href="/tracker"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Tracker GPS
          </Link>
          <Link
            href="/nutrition"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Nutrition
          </Link>
        </nav>
        <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
          <div className="ml-auto flex items-center gap-4">
             <span className="text-sm font-medium hidden md:inline-block">
               {user.name} ({user.profile?.height}cm)
             </span>
            <Avatar>
              <AvatarImage src="" />
              <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        {children}
      </main>
    </div>
  );
}
