"use client";

import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Activity, Dumbbell, Footprints, Bike, Trophy } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { fetchWithAuth } from "@/lib/auth";

const activities = [
  { id: "running", label: "Course à pied", icon: Footprints },
  { id: "walking", label: "Marche", icon: Footprints },
  { id: "cycling", label: "Cyclisme", icon: Bike },
  { id: "fitness", label: "Musculation / Fitness", icon: Dumbbell },
] as const;

const profileSchema = z.object({
  birth_date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Date invalide",
  }),
  gender: z.enum(["male", "female", "other"], {
    required_error: "Veuillez sélectionner un genre.",
  }),
  height: z.coerce.number().min(50).max(250),
  initial_weight: z.coerce.number().min(20).max(300),
  activity_level: z.enum(
    [
      "sedentary",
      "lightly_active",
      "moderately_active",
      "very_active",
      "extra_active",
    ],
    {
      required_error: "Veuillez sélectionner votre niveau d'activité.",
    }
  ),
  goal: z.enum(["lose_weight", "maintain_weight", "gain_muscle"], {
    required_error: "Veuillez sélectionner un objectif.",
  }),
  daily_distance_goal: z.coerce.number().min(0).max(100),
  preferred_activities: z.array(z.string()).min(1, {
    message: "Sélectionnez au moins une activité.",
  }),
});

export default function OnboardingPage() {
  const router = useRouter();

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      birth_date: "",
      height: 170,
      initial_weight: 70,
      activity_level: "moderately_active",
      goal: "maintain_weight",
      daily_distance_goal: 5,
      preferred_activities: ["running"],
    },
  });

  async function onSubmit(values: z.infer<typeof profileSchema>) {
    try {
      const response = await fetchWithAuth("http://127.0.0.1:8000/api/profile", {
        method: "POST",
        body: JSON.stringify(values),
      });

      if (response.ok) {
        router.push("/dashboard");
      } else {
        const errors = await response.json();
        console.error("Erreur:", errors);
      }
    } catch (error) {
      console.error("Erreur réseau:", error);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4 py-10">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center items-center gap-2 mb-2">
            <Activity className="h-8 w-8 text-primary" />
            <span className="font-bold text-2xl">Smart Coach</span>
          </div>
          <CardTitle className="text-2xl">Parlez-moi de vous, Ronron</CardTitle>
          <CardDescription>
            Ces détails permettront à l'IA de devenir votre coach personnel idéal.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              
              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="birth_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date de naissance</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Genre</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex space-x-4"
                        >
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl><RadioGroupItem value="male" /></FormControl>
                            <FormLabel className="font-normal">Homme</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl><RadioGroupItem value="female" /></FormControl>
                            <FormLabel className="font-normal">Femme</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="height"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Taille (cm)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="initial_weight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Poids actuel (kg)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" /> Vos Objectifs
                </h3>
                
                <div className="grid gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="daily_distance_goal"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Objectif de distance quotidien (km)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.5" {...field} />
                        </FormControl>
                        <FormDescription>Combien de km par jour ?</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="goal"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Objectif Santé</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionnez" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="lose_weight">Perdre du poids</SelectItem>
                            <SelectItem value="maintain_weight">Maintenir le poids</SelectItem>
                            <SelectItem value="gain_muscle">Prendre du muscle</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <FormField
                control={form.control}
                name="preferred_activities"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel className="text-base">Activités préférées</FormLabel>
                      <FormDescription>
                        Quelles activités souhaitez-vous pratiquer ?
                      </FormDescription>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {activities.map((item) => (
                        <FormField
                          key={item.id}
                          control={form.control}
                          name="preferred_activities"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={item.id}
                                className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(item.id)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, item.id])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== item.id
                                            )
                                          );
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal flex items-center gap-2 cursor-pointer">
                                  <item.icon className="h-4 w-4" />
                                  {item.label}
                                </FormLabel>
                              </FormItem>
                            );
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="activity_level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Niveau d'activité actuel</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="sedentary">Sédentaire</SelectItem>
                        <SelectItem value="lightly_active">Légèrement actif</SelectItem>
                        <SelectItem value="moderately_active">Modérément actif</SelectItem>
                        <SelectItem value="very_active">Très actif</SelectItem>
                        <SelectItem value="extra_active">Extra actif</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full size-lg text-lg h-12">
                Commencer mon programme Smart Coach
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
