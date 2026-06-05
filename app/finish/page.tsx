"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Team } from "@/types/game";
import { Trophy, Medal, RotateCcw } from "lucide-react";

const STORAGE_KEY = "family100-teams";
const SCORES_KEY = "family100-scores";

export default function FinishPage() {
  const router = useRouter();
  const [teams, setTeams] = useState<Team[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const storedNames = localStorage.getItem(STORAGE_KEY);
    const storedScores = localStorage.getItem(SCORES_KEY);
    
    if (storedNames) {
      const teamNames: string[] = JSON.parse(storedNames);
      const savedScores: Record<string, number> = storedScores ? JSON.parse(storedScores) : {};
      
      const initialTeams: Team[] = teamNames.map((name, index) => ({
        id: index,
        name,
        score: savedScores[`team-${index}`] || 0,
        strikes: 0,
      }));
      setTeams(initialTeams);
    }
    setIsInitialized(true);
  }, []);

  const sortedTeams = useMemo(() => {
    return [...teams].sort((a, b) => b.score - a.score);
  }, [teams]);

  const handleRestart = () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(SCORES_KEY);
    router.push("/");
  };

  if (!isInitialized) {
    return null;
  }

  const winner = sortedTeams[0];

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center bg-cover bg-center relative"
      style={{
        backgroundImage: "linear-gradient(to bottom, rgba(30, 58, 138, 0.8), rgba(30, 58, 138, 0.95)), url('/family100-bg.jpg')",
        backgroundColor: "#1E3A8A",
      }}
    >
      <div className="absolute inset-0 bg-blue-900/30" />

      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 text-center mb-8"
      >
        <h1
          className="text-6xl font-bold text-yellow-400 mb-4"
          style={{ fontFamily: "'Impact', 'Arial Black', sans-serif", textShadow: "4px 4px 0 #000" }}
        >
          GAME OVER!
        </h1>
        <p className="text-2xl text-white">Hasil Akhir</p>
      </motion.div>

      {winner && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="relative z-10 mb-8"
        >
          <Card className="bg-gradient-to-r from-yellow-400 to-yellow-500 border-4 border-yellow-300 shadow-2xl">
            <CardContent className="p-8 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Trophy className="w-8 h-8 text-blue-900" />
                <h2 className="text-4xl font-bold text-blue-900">JUARA 1</h2>
                <Trophy className="w-8 h-8 text-blue-900" />
              </div>
              <p className="text-3xl font-bold text-blue-900">{winner.name}</p>
              <p className="text-5xl font-bold text-blue-900 mt-2">{winner.score} Poin</p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="relative z-10 w-full max-w-lg px-4"
      >
        <Card className="bg-white/95 backdrop-blur shadow-2xl border-4 border-blue-400">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-blue-900 text-center">Leaderboard</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {sortedTeams.map((team, index) => {
              const isWinner = index === 0;
              const MedalIcon = index === 0 ? Trophy : index === 1 ? Medal : index === 2 ? Medal : null;
              
              return (
                <motion.div
                  key={team.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className={`flex items-center justify-between p-4 rounded-xl ${
                    isWinner
                      ? "bg-yellow-100 border-2 border-yellow-400"
                      : "bg-gray-50 border-2 border-gray-200"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 flex items-center justify-center">
                      {index === 0 && <Trophy className="w-8 h-8 text-yellow-500" />}
                      {index === 1 && <Medal className="w-7 h-7 text-gray-400" />}
                      {index === 2 && <Medal className="w-7 h-7 text-amber-600" />}
                      {index > 2 && <span className="text-xl font-bold text-blue-900">{index + 1}</span>}
                    </div>
                    <span className={`text-xl font-bold ${isWinner ? "text-yellow-700" : "text-gray-700"}`}>
                      {team.name}
                    </span>
                  </div>
                  <span className={`text-3xl font-bold ${isWinner ? "text-yellow-600" : "text-blue-600"}`}>
                    {team.score}
                  </span>
                </motion.div>
              );
            })}
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="relative z-10 mt-8"
      >
        <Button
          onClick={handleRestart}
          className="px-12 h-14 text-xl font-bold bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-blue-900 rounded-full shadow-lg hover:scale-105 transition-transform"
          style={{ fontFamily: "'Impact', sans-serif" }}
        >
          <RotateCcw className="w-6 h-6 mr-2" />
          MAIN LAGI
        </Button>
      </motion.div>
    </div>
  );
}