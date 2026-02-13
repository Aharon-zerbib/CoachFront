"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Activity, LogOut, LayoutDashboard, Utensils } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { fetchWithAuth, removeAuthToken, setAuthToken } from "@/lib/auth";
import { cn } from "@/lib/utils";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const loadUser = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const tokenFromUrl = urlParams.get('token');
      
      if (tokenFromUrl) {
        setAuthToken(tokenFromUrl);
        window.location.href = "/dashboard";
        return;
      }

      try {
        const response = await fetchWithAuth("http://localhost:8000/api/me");
        if (response.ok) {
          const data = await response.json();
          setUser(data);
        } else {
          window.location.href = "/login";
        }
      } catch (error) {
        console.error("Erreur chargement utilisateur:", error);
        window.location.href = "/login";
      }
    };

    loadUser();
  }, []);

  const handleLogout = async () => {
    try {
      await fetchWithAuth("http://localhost:8000/api/logout", { method: "POST" });
    } catch (e) {}
    removeAuthToken();
    window.location.href = "/login";
  };

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-2">
          <Activity className="h-8 w-8 text-primary animate-pulse" />
          <p className="text-sm font-medium text-slate-500">Chargement de votre profil...</p>
        </div>
      </div>
    );
  }

  const navLinks = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/nutrition", label: "Nutrition", icon: Utensils },
  ];

  return (
    <div className="flex min-h-screen w-full flex-col bg-slate-50/50">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center px-8 max-w-7xl mx-auto">
          <div className="mr-8 flex items-center space-x-2">
            <Activity className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold tracking-tight">Smart Coach</span>
          </div>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-2 transition-colors hover:text-primary",
                  pathname === link.href ? "text-foreground font-bold" : "text-muted-foreground font-medium"
                )}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center space-x-4">
            <div className="flex items-center gap-3 pr-2 border-r">
              <div className="flex flex-col items-end">
                <span className="text-sm font-bold leading-none">{user.name}</span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mt-1">Premium Analyst</span>
              </div>
              <Avatar className="h-9 w-9 border-2 border-primary/10">
                <AvatarImage src="" />
                <AvatarFallback className="bg-primary/5 text-primary font-bold">
                  {user.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout} className="text-slate-500 hover:text-destructive hover:bg-destructive/5 transition-all">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1 flex flex-col container max-w-7xl mx-auto py-6 animate-in fade-in duration-500">
        {children}
      </main>
    </div>
  );
}
