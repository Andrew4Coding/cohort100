"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Play, Sun, Moon } from "lucide-react";
import { SessionType } from "@/data/questions";

const STORAGE_KEY = "family100-teams";
const SESSION_KEY = "family100-session";

export default function HomePage() {
  const router = useRouter();
  const [session, setSession] = useState<SessionType>("pagi");
  const [teamCount, setTeamCount] = useState<number>(2);
  const [teamNames, setTeamNames] = useState<string[]>(["", ""]);

  const handleTeamCountChange = (count: number) => {
    setTeamCount(count);
    const newNames = [...teamNames];
    while (newNames.length < count) {
      newNames.push("");
    }
    while (newNames.length > count) {
      newNames.pop();
    }
    setTeamNames(newNames);
  };

  const handleNameChange = (index: number, name: string) => {
    const newNames = [...teamNames];
    newNames[index] = name;
    setTeamNames(newNames);
  };

  const handleStartGame = () => {
    const validNames = teamNames.map((name) => name.trim() || `Tim ${teamNames.indexOf(name) + 1}`);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(validNames));
    localStorage.setItem(SESSION_KEY, session);
    router.push("/play");
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center bg-cover bg-center"
      style={{
        backgroundImage: "linear-gradient(to bottom, rgba(30, 58, 138, 0.8), rgba(30, 58, 138, 0.95)), url('/theatre.jpg')",
        backgroundColor: "#1E3A8A",
      }}
    >
      <div className="absolute inset-0 bg-blue-900/30" />
      
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 text-center mb-12"
      >
        <h1 className="text-6xl md:text-8xl font-bold text-white tracking-tight mb-4 drop-shadow-lg"
          style={{ fontFamily: "'Impact', 'Arial Black', sans-serif", textShadow: "4px 4px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000" }}>
          FAMILY 100
        </h1>
        <p className="text-xl text-blue-200 font-semibold tracking-wide">Tebak Jawaban, Kumpulkan Poin!</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="relative z-10 w-full max-w-md px-4"
      >
        <Card className="bg-white/95 backdrop-blur shadow-2xl border-4 border-yellow-400">
          <CardContent className="p-8 space-y-6">
            <div className="space-y-3">
              <Label className="text-xl font-bold text-blue-900">Pilih Sesi</Label>
              <div className="flex gap-3 justify-center">
                <Button
                  onClick={() => setSession("pagi")}
                  size="lg"
                  className={`w-36 h-14 text-lg font-bold transition-all ${
                    session === "pagi"
                      ? "bg-gradient-to-r from-orange-400 to-yellow-400 text-blue-900 scale-110"
                      : "border-2 border-blue-300 hover:border-orange-400 bg-white"
                  }`}
                >
                  <Moon className="w-5 h-5 mr-2" />
                  Sesi Pagi
                </Button>
                <Button
                  onClick={() => setSession("siang")}
                  size="lg"
                  className={`w-36 h-14 text-lg font-bold transition-all ${
                    session === "siang"
                      ? "bg-gradient-to-r from-orange-400 to-yellow-400 text-blue-900 scale-110"
                      : "border-2 border-blue-300 hover:border-orange-400 bg-white"
                  }`}
                >
                  <Sun className="w-5 h-5 mr-2" />
                  Sesi Siang
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-xl font-bold text-blue-900">Jumlah Tim</Label>
              <div className="flex gap-3 justify-center">
                {[2, 3, 4, 5].map((num) => (
                  <Button
                    key={num}
                    variant={teamCount === num ? "default" : "outline"}
                    size="lg"
                    onClick={() => handleTeamCountChange(num)}
                    className={`w-14 h-14 text-xl font-bold transition-all ${
                      teamCount === num 
                        ? "bg-blue-600 hover:bg-blue-700 text-white scale-110" 
                        : "border-2 border-blue-300 hover:border-blue-500"
                    }`}
                  >
                    {num}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-xl font-bold text-blue-900">Nama Tim</Label>
              <div className="grid grid-cols-1 gap-3">
                {teamNames.map((name, index) => (
                  <div key={index} className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 font-bold text-lg">
                      {index + 1}.
                    </span>
                    <Input
                      value={name}
                      onChange={(e) => handleNameChange(index, e.target.value)}
                      placeholder={`Nama Tim ${index + 1}`}
                      className="pl-10 h-12 text-lg border-2 border-blue-200 focus:border-blue-500 rounded-lg"
                    />
                  </div>
                ))}
              </div>
            </div>

            <Button
              onClick={handleStartGame}
              className="w-full h-14 text-xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-blue-900 rounded-full shadow-lg hover:scale-105 transition-transform"
              style={{ fontFamily: "'Impact', sans-serif" }}
            >
              <Play className="w-6 h-6 mr-2" />
              LET&apos;S GO!
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}