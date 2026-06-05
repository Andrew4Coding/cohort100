import { Question } from "@/types/game";

export const questions: Question[] = [
  {
    id: 1,
    question: "Apa yang biasa orang lakukan saat sedang bosan?",
    answers: [
      { answer: "Menonton TV", points: 32, isRevealed: false },
      { answer: "Main HP", points: 28, isRevealed: false },
      { answer: "Baca buku", points: 15, isRevealed: false },
      { answer: "Tidur", points: 12, isRevealed: false },
      { answer: "Jalan-jalan", points: 8, isRevealed: false },
      { answer: "Makan", points: 5, isRevealed: false },
    ],
  },
  {
    id: 2,
    question: "Apa yang kamu lakukan pertama kali saat bangun tidur?",
    answers: [
      { answer: "Lihat HP", points: 35, isRevealed: false },
      { answer: "Sikat gigi", points: 25, isRevealed: false },
      { answer: "Mandi", points: 20, isRevealed: false },
      { answer: "Minum air", points: 12, isRevealed: false },
      { answer: "Sarapan", points: 5, isRevealed: false },
      { answer: "Stretching", points: 3, isRevealed: false },
    ],
  },
  {
    id: 3,
    question: "Makanan apa yang paling populer di Indonesia?",
    answers: [
      { answer: "Nasi goreng", points: 30, isRevealed: false },
      { answer: "Rendang", points: 22, isRevealed: false },
      { answer: "Sate", points: 18, isRevealed: false },
      { answer: "Gado-gado", points: 12, isRevealed: false },
      { answer: "Soto", points: 10, isRevealed: false },
      { answer: "Rawon", points: 8, isRevealed: false },
    ],
  },
  {
    id: 4,
    question: "Apa yang membuat seseorang bahagia?",
    answers: [
      { answer: "Uang", points: 28, isRevealed: false },
      { answer: "Keluarga", points: 25, isRevealed: false },
      { answer: "Kesehatan", points: 20, isRevealed: false },
      { answer: "Cinta", points: 15, isRevealed: false },
      { answer: "Teman", points: 8, isRevealed: false },
      { answer: "Hobi", points: 4, isRevealed: false },
    ],
  },
  {
    id: 5,
    question: "Apa kegiatan favorit saat weekend?",
    answers: [
      { answer: "Tidur", points: 30, isRevealed: false },
      { answer: "Hangout", points: 25, isRevealed: false },
      { answer: "Main game", points: 18, isRevealed: false },
      { answer: "Olahraga", points: 12, isRevealed: false },
      { answer: "Shopping", points: 10, isRevealed: false },
      { answer: "Masak", points: 5, isRevealed: false },
    ],
  },
];