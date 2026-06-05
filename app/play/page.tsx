"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { sesiPagiQuestions, sesiSiangQuestions, SessionType } from "@/data/questions";
import { Team, Question } from "@/types/game";
import { X, ChevronRight, Check } from "lucide-react";

const STORAGE_KEY = "family100-teams";
const SCORES_KEY = "family100-scores";

function playAudio(filename: string) {
  try {
    const audio = new Audio(`/${filename}`);
    audio.play().catch(() => {});
  } catch {}
}

export default function GameplayPage() {
  const router = useRouter();
  const [currentRound, setCurrentRound] = useState(0);
  const [teams, setTeams] = useState<Team[]>([]);
  const [currentTeamIndex, setCurrentTeamIndex] = useState(0);
  const [revealedAnswers, setRevealedAnswers] = useState<Set<number>>(new Set());
  const [showRoundOverlay, setShowRoundOverlay] = useState(true);
  const [showStrikePopup, setShowStrikePopup] = useState(false);
  const [strikeCount, setStrikeCount] = useState(0);
  const [showStealDialog, setShowStealDialog] = useState(false);
  const [roundPoints, setRoundPoints] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isStealingPhase, setIsStealingPhase] = useState(false);
  const [stealingTeamIndex, setStealingTeamIndex] = useState<number | null>(null);
  const [stealingTeamFirstAttempt, setStealingTeamFirstAttempt] = useState(false);
  const [showCorrectPopup, setShowCorrectPopup] = useState(false);
  const [correctPoints, setCorrectPoints] = useState(0);
  const [gameQuestions, setGameQuestions] = useState<Question[]>([]);
  const scoreChangeTimeoutRef = useRef<Map<number, NodeJS.Timeout>>(new Map());

  useEffect(() => {
    const storedNames = localStorage.getItem(STORAGE_KEY);
    const storedScores = localStorage.getItem(SCORES_KEY);
    const storedSession = localStorage.getItem("family100-session") as SessionType;
    
    const sessionQuestions = storedSession === "siang" ? sesiSiangQuestions : sesiPagiQuestions;
    setGameQuestions(sessionQuestions);
    
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
      setIsInitialized(true);
    } else {
      router.push("/");
    }
  }, [router]);

  useEffect(() => {
    if (isInitialized && teams.length > 0) {
      const timer = setTimeout(() => {
        setShowRoundOverlay(false);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [isInitialized, teams.length, currentRound]);

  useEffect(() => {
    const savedScores: Record<string, number> = {};
    teams.forEach((team) => {
      savedScores[`team-${team.id}`] = team.score;
    });
    localStorage.setItem(SCORES_KEY, JSON.stringify(savedScores));
  }, [teams]);

  const currentQuestion = gameQuestions[currentRound];

  const handleAnswerClick = useCallback((answerIndex: number) => {
    if (revealedAnswers.has(answerIndex)) return;

    const answer = currentQuestion.answers[answerIndex];
    
    setRevealedAnswers(new Set([...revealedAnswers, answerIndex]));
    setRoundPoints((prev) => prev + answer.points);
    setCorrectPoints(answer.points);
    setShowCorrectPopup(true);

    const isStealingTeam = isStealingPhase && currentTeamIndex === stealingTeamIndex;
    const isFirstAttemptInSteal = isStealingTeam && !stealingTeamFirstAttempt;

    if (isStealingPhase && stealingTeamIndex !== null) {
      if (isFirstAttemptInSteal) {
        setStealingTeamFirstAttempt(true);
        setTeams((prev) =>
          prev.map((team, idx) => {
            if (idx === stealingTeamIndex) {
              return { ...team, score: team.score + roundPoints };
            }
            if (idx === currentTeamIndex) {
              return { ...team, score: 0, strikes: 0 };
            }
            return team;
          })
        );
        playAudio("correct.mp3");
        setTimeout(() => {
          setShowCorrectPopup(false);
          setCorrectPoints(0);
          setIsStealingPhase(false);
          setStealingTeamIndex(null);
          setStealingTeamFirstAttempt(false);
          setRoundPoints(0);
          setRevealedAnswers(new Set());
        }, 1200);
        return;
      }
    }

    setTeams((prev) =>
      prev.map((team, idx) =>
        idx === currentTeamIndex ? { ...team, score: team.score + answer.points } : team
      )
    );

    playAudio("correct.mp3");

    setTimeout(() => {
      setShowCorrectPopup(false);
      setCorrectPoints(0);
    }, 1200);
  }, [revealedAnswers, currentQuestion, currentTeamIndex, isStealingPhase, stealingTeamIndex, stealingTeamFirstAttempt, roundPoints]);

  const handleStrike = useCallback(() => {
    const newStrikeCount = teams[currentTeamIndex].strikes + 1;
    
    setTeams((prev) =>
      prev.map((team, idx) =>
        idx === currentTeamIndex ? { ...team, strikes: newStrikeCount } : team
      )
    );

    setStrikeCount(newStrikeCount);
    setShowStrikePopup(true);
    playAudio("wrong.mp3");

    const isStealingTeam = isStealingPhase && currentTeamIndex === stealingTeamIndex;

    if (isStealingPhase && isStealingTeam && !stealingTeamFirstAttempt) {
      setTimeout(() => {
        setShowStrikePopup(false);
        setStrikeCount(0);
        setIsStealingPhase(false);
        setStealingTeamIndex(null);
        setStealingTeamFirstAttempt(false);
        setRoundPoints(0);
        setRevealedAnswers(new Set());
      }, 1500);
      return;
    }

    setTimeout(() => {
      setShowStrikePopup(false);
      setStrikeCount(0);
    }, 1500);

    if (newStrikeCount >= 3) {
      setTimeout(() => {
        setShowStealDialog(true);
      }, 500);
    }
  }, [currentTeamIndex, teams, isStealingPhase, stealingTeamIndex, stealingTeamFirstAttempt]);

  const handleStealSelect = (stealingTeamIndex: number) => {
    setStealingTeamIndex(stealingTeamIndex);
    setCurrentTeamIndex(stealingTeamIndex);
    setShowStealDialog(false);
    setIsStealingPhase(true);
    setStealingTeamFirstAttempt(false);
  };

  const handleTeamSelect = (teamIndex: number) => {
    if (!isStealingPhase) {
      setCurrentTeamIndex(teamIndex);
    }
  };

  const handleNextRound = () => {
    if (currentRound < gameQuestions.length - 1) {
      setCurrentRound((prev) => prev + 1);
      setRevealedAnswers(new Set());
      setRoundPoints(0);
      setTeams((prev) => prev.map((team) => ({ ...team, strikes: 0 })));
      setIsStealingPhase(false);
      setStealingTeamIndex(null);
      setStealingTeamFirstAttempt(false);
      setShowRoundOverlay(true);
    } else {
      router.push("/finish");
    }
  };

  const handleFinish = () => {
    router.push("/finish");
  };

  if (!isInitialized || teams.length === 0) {
    return null;
  }

  const allRevealed = revealedAnswers.size === currentQuestion.answers.length;

  return (
    <div
      className="min-h-screen bg-cover bg-center relative"
      style={{
        backgroundImage: "url('/family100-bg.jpg')",
        backgroundColor: "#1E3A8A",
      }}
    >
      <div className="absolute inset-0 bg-blue-900/40" />

      <AnimatePresence>
        {showRoundOverlay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/70"
          >
            <motion.h1
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="text-8xl font-bold text-yellow-400"
              style={{ fontFamily: "'Impact', sans-serif", textShadow: "4px 4px 0 #000" }}
            >
              Round {currentRound + 1}
            </motion.h1>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showStrikePopup && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            className="absolute inset-0 z-40 flex items-center justify-center bg-black/50 pointer-events-none"
          >
            <div className="flex gap-4">
              {Array.from({ length: strikeCount }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: i * 0.1, type: "spring" }}
                  className="w-40 h-40 bg-red-600 rounded-full flex items-center justify-center"
                >
                  <X className="w-20 h-20 text-white" />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCorrectPopup && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            className="absolute inset-0 z-40 flex items-center justify-center bg-black/50 pointer-events-none"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="w-40 h-40 bg-green-500 rounded-full flex flex-col items-center justify-center shadow-2xl"
            >
              <Check className="w-20 h-20 text-white" />
              <span className="text-2xl font-bold text-white mt-1">+{correctPoints}</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 p-6 min-h-screen flex flex-col">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <h2 className="text-white text-2xl font-bold mb-4">Teams</h2>
            <div className="flex flex-col gap-2">
              {teams.map((team, index) => (
                <motion.div
                  key={team.id}
                  whileHover={!isStealingPhase ? { scale: 1.05 } : {}}
                  onClick={() => handleTeamSelect(index)}
                  className={`cursor-pointer p-4 rounded-xl transition-all ${
                    currentTeamIndex === index
                      ? "bg-yellow-400 text-blue-900 ring-4 ring-white"
                      : "bg-white/20 text-white hover:bg-white/30"
                  } ${isStealingPhase && index === stealingTeamIndex ? "ring-2 ring-green-400" : ""}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-lg">{team.name}</span>
                      {isStealingPhase && index === stealingTeamIndex && (
                        <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full">Mencuri</span>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-2xl font-bold">{team.score}</span>
                      <div className="flex gap-1">
                        {[0, 1, 2].map((i) => (
                          <span
                            key={i}
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                              i < team.strikes ? "bg-red-600 text-white" : "bg-white/30 text-white/50"
                            }`}
                          >
                            {i < team.strikes ? <X className="w-4 h-4" /> : null}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleFinish}
              variant="outline"
              className="bg-white/20 hover:bg-white/30 text-white border-white/50 font-bold"
            >
              Finish
            </Button>
            <Button
              onClick={handleNextRound}
              className="bg-green-500 hover:bg-green-600 text-white font-bold"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center mt-8">
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-8 shadow-2xl max-w-2xl w-full mb-8"
          >
            <h2 className="text-3xl font-bold text-blue-900 text-center mb-2">
              {currentQuestion.question}
            </h2>
            <div className="text-center text-gray-500 text-sm">
              Round {currentRound + 1} dari {gameQuestions.length}
              {isStealingPhase && <span className="ml-2 text-green-600 font-bold">| Mencuri: {roundPoints} poin</span>}
            </div>
          </motion.div>

          <div className="grid grid-cols-2 gap-4 max-w-4xl w-full">
            {currentQuestion.answers.map((answer, index) => {
              const isRevealed = revealedAnswers.has(index);
              return (
                <motion.button
                  key={index}
                  whileHover={isRevealed ? {} : { scale: 1.05 }}
                  whileTap={isRevealed ? {} : { scale: 0.95 }}
                  onClick={() => handleAnswerClick(index)}
                  disabled={isRevealed}
                  className={`relative p-6 rounded-xl text-left transition-all ${
                    isRevealed
                      ? "bg-gradient-to-r from-green-400 to-green-500 text-white shadow-lg"
                      : "bg-white/90 hover:bg-white cursor-pointer shadow-lg border-4 border-blue-300 hover:border-yellow-400"
                  }`}
                >
                  {isRevealed ? (
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold">{answer.answer}</span>
                      <span className="text-2xl font-bold bg-white/20 px-4 py-2 rounded-full">
                        {answer.points}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-12">
                      <span className="text-4xl font-bold text-blue-300">{index + 1}</span>
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>

          {allRevealed && !isStealingPhase && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-8 bg-yellow-400 text-blue-900 px-8 py-4 rounded-full font-bold text-xl"
            >
              Semua jawaban terbuka! Poin ronde: {roundPoints}
            </motion.div>
          )}
        </div>

        <div className="fixed bottom-8 right-8">
          <Button
            onClick={handleStrike}
            className="w-20 h-20 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-2xl hover:scale-110 transition-transform"
          >
            <X className="w-10 h-10" />
          </Button>
        </div>
      </div>

      <Dialog open={showStealDialog} onOpenChange={setShowStealDialog}>
        <DialogContent className="bg-white max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-blue-900">
              {teams[currentTeamIndex].name} mendapat 3 Strike!
            </DialogTitle>
            <DialogDescription className="text-lg">
              Tim lain boleh mencuri {roundPoints} poin!
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            {teams.map((team, index) => {
              if (index === currentTeamIndex) return null;
              return (
                <Button
                  key={team.id}
                  onClick={() => handleStealSelect(index)}
                  className="w-full h-12 text-lg font-bold bg-blue-600 hover:bg-blue-700"
                >
                  {team.name} mencuri
                </Button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}