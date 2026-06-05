export interface SurveyAnswer {
  answer: string;
  points: number;
  isRevealed: boolean;
}

export interface Question {
  id: number;
  question: string;
  answers: SurveyAnswer[];
}

export interface Team {
  id: number;
  name: string;
  score: number;
  strikes: number;
}

export interface ScoreChange {
  teamId: number;
  amount: number;
  timestamp: number;
}

export interface GameState {
  teams: Team[];
  currentTeamIndex: number;
  currentRound: number;
  questions: Question[];
  roundPoints: number;
  isStealingPhase: boolean;
  stealingFromTeamIndex: number | null;
}

export type TeamSetup = {
  count: number;
  names: string[];
};