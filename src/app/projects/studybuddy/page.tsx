"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  BrainCircuit,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Home,
  Layers3,
  Loader2,
  RefreshCcw,
  Sparkles,
  Trophy,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type PageId = "home" | "generate" | "flashcards" | "quiz" | "schedule";

type Flashcard = {
  q: string;
  a: string;
};

type QuizQuestion = {
  q: string;
  options: string[];
  correct: number;
};

type ScheduleItem = {
  time: string;
  topic: string;
  duration: string;
};

type StudyKit = {
  summary: string;
  flashcards: Flashcard[];
  quiz: QuizQuestion[];
  schedule: ScheduleItem[];
  tip: string;
};

const pages: { id: PageId; label: string; icon: LucideIcon }[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "generate", label: "Generate", icon: Sparkles },
  { id: "flashcards", label: "Flashcards", icon: Layers3 },
  { id: "quiz", label: "Quiz", icon: BrainCircuit },
  { id: "schedule", label: "Schedule", icon: CalendarDays },
];

const subjects = [
  "general",
  "biology",
  "history",
  "maths",
  "physics",
  "chemistry",
  "cs",
  "literature",
  "economics",
  "geography",
];

function formatSubject(subject: string) {
  if (subject === "cs") return "Computer Science";
  if (subject === "maths") return "Mathematics";
  return subject.charAt(0).toUpperCase() + subject.slice(1);
}

function StudyCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "min-w-0 overflow-hidden rounded-lg border border-[#2a2a3a] bg-[#111118] p-4 sm:p-5",
        className
      )}
    >
      {children}
    </div>
  );
}

function CardTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-3 font-display text-[11px] font-bold uppercase tracking-[0.08em] text-[#888899]">
      {children}
    </div>
  );
}

function PrimaryButton({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "inline-flex min-h-11 max-w-full items-center justify-center gap-2 rounded-lg bg-[#00e5ff] px-4 py-3 text-center font-display text-sm font-bold text-black transition hover:-translate-y-0.5 hover:bg-[#33eaff] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 sm:px-5",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

function GhostButton({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "inline-flex min-h-11 max-w-full items-center justify-center gap-2 rounded-lg border border-[#2a2a3a] px-3.5 py-2.5 text-center text-sm text-[#f0f0ff] transition hover:border-[#00e5ff] hover:text-[#00e5ff] disabled:cursor-not-allowed disabled:opacity-50 sm:px-4",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

function EmptyState({
  icon: Icon,
  title,
  subtitle,
  onGenerate,
}: {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  onGenerate: () => void;
}) {
  return (
    <StudyCard className="px-4 py-10 text-center sm:px-6 sm:py-14">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg border border-[#2a2a3a] bg-[#1a1a24] text-[#00e5ff]">
        <Icon size={24} />
      </div>
      <h2 className="font-display text-lg font-bold">{title}</h2>
      <p className="mt-2 text-sm text-[#888899]">{subtitle}</p>
      <PrimaryButton className="mt-6" onClick={onGenerate}>
        <Sparkles size={16} />
        Generate
      </PrimaryButton>
    </StudyCard>
  );
}

export default function StudyBuddyPage() {
  const [activePage, setActivePage] = useState<PageId>("home");
  const [notes, setNotes] = useState("");
  const [subject, setSubject] = useState("general");
  const [kit, setKit] = useState<StudyKit | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [learnedFlashcards, setLearnedFlashcards] = useState<Set<number>>(
    () => new Set()
  );
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [quizComplete, setQuizComplete] = useState(false);
  const [stats, setStats] = useState({ flashcards: 0, quizzes: 0 });
  const [progressBySubject, setProgressBySubject] = useState<Record<string, number>>({});
  const [completedSchedule, setCompletedSchedule] = useState<Set<number>>(
    () => new Set([0])
  );

  const currentFlashcard = kit?.flashcards[flashcardIndex];
  const currentQuiz = kit?.quiz[quizIndex];
  const selectedSubjectLabel = useMemo(() => formatSubject(subject), [subject]);
  const quizAnswered = selectedAnswer !== null;

  function showPage(page: PageId) {
    setActivePage(page);
  }

  async function generateAll() {
    const trimmedNotes = notes.trim();

    if (!trimmedNotes) {
      setError("Paste your notes first.");
      setActivePage("generate");
      return;
    }

    setIsGenerating(true);
    setError("");

    try {
      const response = await fetch("/api/studybuddy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: trimmedNotes, subject }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Could not generate study content.");
      }

      const nextKit = payload as StudyKit;
      setKit(nextKit);
      setFlashcardIndex(0);
      setLearnedFlashcards(new Set());
      setQuizIndex(0);
      setQuizScore(0);
      setSelectedAnswer(null);
      setQuizComplete(false);
      setCompletedSchedule(new Set([0]));
      setStats((current) => ({
        ...current,
        flashcards: current.flashcards + nextKit.flashcards.length,
      }));
      setProgressBySubject((current) => ({
        ...current,
        [subject]: Math.min(100, (current[subject] ?? 0) + 30),
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsGenerating(false);
    }
  }

  function previousCard() {
    if (!kit?.flashcards.length) return;
    setFlashcardIndex((current) =>
      (current - 1 + kit.flashcards.length) % kit.flashcards.length
    );
  }

  function nextCard() {
    if (!kit?.flashcards.length) return;
    setFlashcardIndex((current) => (current + 1) % kit.flashcards.length);
  }

  function markLearned() {
    setLearnedFlashcards((current) => new Set(current).add(flashcardIndex));
    nextCard();
  }

  function answerQuestion(answerIndex: number) {
    if (!currentQuiz || quizAnswered) return;

    setSelectedAnswer(answerIndex);

    if (answerIndex === currentQuiz.correct) {
      setQuizScore((current) => current + 1);
    }
  }

  function nextQuestion() {
    if (!kit?.quiz.length) return;

    if (quizIndex + 1 >= kit.quiz.length) {
      setQuizComplete(true);
      setStats((current) => ({ ...current, quizzes: current.quizzes + 1 }));
      return;
    }

    setQuizIndex((current) => current + 1);
    setSelectedAnswer(null);
  }

  function restartQuiz() {
    setQuizIndex(0);
    setQuizScore(0);
    setSelectedAnswer(null);
    setQuizComplete(false);
  }

  function toggleScheduleItem(index: number) {
    setCompletedSchedule((current) => {
      const next = new Set(current);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  function renderHome() {
    return (
      <div className="animate-fade-in-up">
        <section className="mb-6 border-b border-[#2a2a3a] py-7 sm:mb-8 sm:py-9">
          <h1 className="font-display text-3xl font-extrabold leading-tight tracking-normal text-[#f0f0ff] sm:text-5xl">
            Study smarter,
            <br />
            not harder<span className="text-[#00e5ff]">.</span>
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-[#888899] sm:text-[15px]">
            Paste notes and turn them into flashcards, quizzes, and a focused study plan.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#2a2a3a] px-3 py-1 text-xs text-[#888899]">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#00e5ff]" />
              In Progress · 2025
            </span>
            {["Flutter", "OpenAI API", "Firebase", "Dart"].map((tag) => (
              <span
                key={tag}
                className="rounded-md border border-[#00e5ff]/20 bg-[#00e5ff]/10 px-2.5 py-1 text-xs font-medium text-[#00e5ff]"
              >
                {tag}
              </span>
            ))}
          </div>
        </section>

        <div className="mb-5 grid gap-4 sm:grid-cols-2">
          <StudyCard>
            <CardTitle>Flashcards generated</CardTitle>
            <div className="font-display text-4xl font-extrabold text-[#00e5ff]">
              {stats.flashcards}
            </div>
            <p className="mt-1 text-sm text-[#888899]">Across all sessions</p>
          </StudyCard>
          <StudyCard>
            <CardTitle>Quizzes completed</CardTitle>
            <div className="font-display text-4xl font-extrabold text-[#00e5ff]">
              {stats.quizzes}
            </div>
            <p className="mt-1 text-sm text-[#888899]">This session</p>
          </StudyCard>
        </div>

        <StudyCard className="mb-5">
          <CardTitle>Progress by subject</CardTitle>
          {Object.keys(progressBySubject).length === 0 ? (
            <p className="py-2 text-sm text-[#888899]">
              No subjects yet. Generate content to track progress.
            </p>
          ) : (
            <div className="space-y-4">
              {Object.entries(progressBySubject).map(([name, percent]) => (
                <div key={name}>
                  <div className="mb-2 flex justify-between text-sm">
                    <span>{formatSubject(name)}</span>
                    <span className="text-[#00e5ff]">{percent}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-[#22222f]">
                    <div
                      className="h-1.5 rounded-full bg-gradient-to-r from-[#00e5ff] to-[#0099ff] transition-all duration-700"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </StudyCard>

        <StudyCard>
          <CardTitle>Overview</CardTitle>
          <p className="text-sm leading-7 text-[#888899]">
            StudyBuddy helps learners plan smarter, stay on track, and turn study goals into
            daily routines.
          </p>
          <PrimaryButton className="mt-5" onClick={() => showPage("generate")}>
            <Sparkles size={16} />
            Get Started
          </PrimaryButton>
        </StudyCard>
      </div>
    );
  }

  function renderGenerate() {
    return (
      <div className="animate-fade-in-up">
        <StudyCard className="mb-5">
          <CardTitle>Your notes</CardTitle>
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Paste your lecture notes, textbook excerpts, or study material here..."
            className="min-h-40 w-full resize-y rounded-lg border border-[#2a2a3a] bg-[#1a1a24] p-4 text-sm leading-7 text-[#f0f0ff] outline-none transition placeholder:text-[#888899] focus:border-[#00e5ff]"
          />
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <select
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              className="min-w-0 flex-1 cursor-pointer rounded-lg border border-[#2a2a3a] bg-[#1a1a24] px-4 py-3 text-sm text-[#f0f0ff] outline-none focus:border-[#00e5ff]"
            >
              {subjects.map((item) => (
                <option key={item} value={item}>
                  {formatSubject(item)}
                </option>
              ))}
            </select>
            <PrimaryButton className="w-full sm:w-auto" onClick={generateAll} disabled={isGenerating}>
              {isGenerating ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
              Generate
            </PrimaryButton>
          </div>
          {error && (
            <div className="mt-4 rounded-lg border border-[#ff4466]/30 bg-[#ff4466]/10 px-4 py-3 text-sm text-[#ff8aa0]">
              {error}
            </div>
          )}
        </StudyCard>

        {isGenerating && (
          <div className="mb-5 flex items-center gap-3 py-4 text-sm text-[#888899]">
            <Loader2 className="animate-spin text-[#00e5ff]" size={20} />
            AI is reading your notes...
          </div>
        )}

        {kit && (
          <div>
            <StudyCard className="mb-5">
              <CardTitle>AI Summary</CardTitle>
              <div className="rounded-lg border border-[#2a2a3a] bg-[#1a1a24] p-4 text-sm leading-7 text-[#f0f0ff]">
                {kit.summary}
              </div>
            </StudyCard>
            <div className="grid gap-3 sm:grid-cols-3">
              <GhostButton onClick={() => showPage("flashcards")} className="w-full">
                <Layers3 size={16} />
                Flashcards
              </GhostButton>
              <GhostButton onClick={() => showPage("quiz")} className="w-full">
                <BrainCircuit size={16} />
                Quiz
              </GhostButton>
              <GhostButton onClick={() => showPage("schedule")} className="w-full">
                <CalendarDays size={16} />
                Schedule
              </GhostButton>
            </div>
          </div>
        )}
      </div>
    );
  }

  function renderFlashcards() {
    if (!kit?.flashcards.length || !currentFlashcard) {
      return (
        <EmptyState
          icon={Layers3}
          title="No flashcards yet"
          subtitle="Generate content from your notes first."
          onGenerate={() => showPage("generate")}
        />
      );
    }

    const isLearned = learnedFlashcards.has(flashcardIndex);

    return (
      <div className="animate-fade-in-up">
        <div className="mb-3 font-display text-[11px] font-bold uppercase tracking-[0.08em] text-[#888899]">
          Flashcard {flashcardIndex + 1} of {kit.flashcards.length}
        </div>

        <div className="group [perspective:1000px]">
          <button className="relative min-h-52 w-full rounded-lg border border-[#2a2a3a] bg-[#111118] p-5 text-center transition duration-500 [transform-style:preserve-3d] group-focus-within:[transform:rotateY(180deg)] group-hover:[transform:rotateY(180deg)] sm:p-8">
            <span className="absolute inset-0 flex items-center justify-center p-5 [backface-visibility:hidden] sm:p-8">
              <span className="font-display text-base font-bold leading-7 sm:text-lg sm:leading-8">
                {currentFlashcard.q}
              </span>
            </span>
            <span className="absolute inset-0 flex items-center justify-center rounded-lg border border-[#00e5ff]/20 bg-[#00e5ff]/5 p-5 [backface-visibility:hidden] [transform:rotateY(180deg)] sm:p-8">
              <span className="font-display text-base font-bold leading-7 text-[#00e5ff] sm:text-lg sm:leading-8">
                {currentFlashcard.a}
              </span>
            </span>
          </button>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <GhostButton onClick={previousCard}>
            <ChevronLeft size={16} />
            Prev
          </GhostButton>
          <span className="text-sm text-[#888899]">{learnedFlashcards.size} learned</span>
          <GhostButton onClick={nextCard}>
            Next
            <ChevronRight size={16} />
          </GhostButton>
        </div>

        <div className="mt-5 text-center">
          <PrimaryButton onClick={markLearned} disabled={isLearned}>
            <Check size={16} />
            {isLearned ? "Learned" : "Mark Learned"}
          </PrimaryButton>
        </div>
      </div>
    );
  }

  function renderQuiz() {
    if (!kit?.quiz.length || !currentQuiz) {
      return (
        <EmptyState
          icon={BrainCircuit}
          title="No quiz available"
          subtitle="Generate content from your notes first."
          onGenerate={() => showPage("generate")}
        />
      );
    }

    if (quizComplete) {
      const percent = Math.round((quizScore / kit.quiz.length) * 100);
      const resultText =
        percent >= 80
          ? "Excellent work. You know this material well."
          : percent >= 60
            ? "Good effort. Review the questions you missed."
            : "Keep going. Every revision helps.";

      return (
        <div className="animate-fade-in-up py-10 text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-lg border border-[#00e5ff]/20 bg-[#00e5ff]/10 text-[#00e5ff]">
            <Trophy size={28} />
          </div>
          <div className="font-display text-6xl font-extrabold text-[#00e5ff]">
            {percent}%
          </div>
          <h2 className="mt-3 font-display text-xl font-bold">Quiz complete</h2>
          <p className="mx-auto mt-3 max-w-sm text-sm text-[#888899]">
            {quizScore} / {kit.quiz.length} correct. {resultText}
          </p>
          <PrimaryButton className="mt-7" onClick={restartQuiz}>
            <RefreshCcw size={16} />
            Retake Quiz
          </PrimaryButton>
        </div>
      );
    }

    return (
      <div className="animate-fade-in-up">
        <div className="mb-5 flex gap-1">
          {kit.quiz.map((question, index) => (
            <span
              key={`${question.q}-${index}`}
              className={cn(
                "h-1 flex-1 rounded-full bg-[#22222f]",
                index <= quizIndex && "bg-[#00e5ff]"
              )}
            />
          ))}
        </div>

        <StudyCard>
          <h2 className="mb-5 font-display text-lg font-bold leading-7 sm:text-xl sm:leading-8">
            {currentQuiz.q}
          </h2>
          <div className="grid gap-3">
            {currentQuiz.options.map((option, index) => {
              const isCorrect = index === currentQuiz.correct;
              const isWrong = quizAnswered && selectedAnswer === index && !isCorrect;

              return (
                <button
                  key={option}
                  disabled={quizAnswered}
                  onClick={() => answerQuestion(index)}
                  className={cn(
                    "rounded-lg border border-[#2a2a3a] bg-[#1a1a24] px-4 py-3 text-left text-sm text-[#f0f0ff] transition hover:border-[#00e5ff] hover:text-[#00e5ff] disabled:cursor-default",
                    quizAnswered && isCorrect && "border-[#00ff88] bg-[#00ff88]/10 text-[#00ff88]",
                    isWrong && "border-[#ff4466] bg-[#ff4466]/10 text-[#ff4466]"
                  )}
                >
                  {option}
                </button>
              );
            })}
          </div>

          <div className="mt-4 min-h-5 text-sm">
            {quizAnswered && selectedAnswer === currentQuiz.correct && (
              <span className="text-[#00ff88]">Correct.</span>
            )}
            {quizAnswered && selectedAnswer !== currentQuiz.correct && (
              <span className="text-[#ff4466]">Incorrect. The answer is highlighted.</span>
            )}
          </div>
        </StudyCard>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <span className="text-sm text-[#888899]">
            Score: <strong className="text-[#00e5ff]">{quizScore}</strong>
          </span>
          {quizAnswered && (
            <GhostButton onClick={nextQuestion}>
              {quizIndex + 1 === kit.quiz.length ? "Finish" : "Next Question"}
              <ChevronRight size={16} />
            </GhostButton>
          )}
        </div>
      </div>
    );
  }

  function renderSchedule() {
    if (!kit?.schedule.length) {
      return (
        <EmptyState
          icon={CalendarDays}
          title="No schedule yet"
          subtitle="Generate content from your notes first."
          onGenerate={() => showPage("generate")}
        />
      );
    }

    return (
      <div className="animate-fade-in-up">
        <StudyCard className="mb-5">
          <CardTitle>Today&apos;s study plan</CardTitle>
          <div className="space-y-3">
            {kit.schedule.map((item, index) => {
              const done = completedSchedule.has(index);

              return (
                <button
                  key={`${item.time}-${item.topic}`}
                  onClick={() => toggleScheduleItem(index)}
                  className={cn(
                    "grid w-full grid-cols-[10px_minmax(3.5rem,auto)_minmax(0,1fr)] items-center gap-3 rounded-lg border border-[#2a2a3a] bg-[#1a1a24] p-3 text-left transition hover:border-[#00e5ff]/60 sm:gap-4",
                    done && "opacity-70"
                  )}
                >
                  <span
                    className={cn(
                      "h-2.5 w-2.5 rounded-full bg-[#00e5ff]",
                      done && "bg-[#888899]"
                    )}
                  />
                  <span className="font-display text-xs font-bold text-[#00e5ff]">
                    {item.time}
                  </span>
                  <span className="min-w-0">
                    <span
                      className={cn(
                        "block break-words text-sm font-medium text-[#f0f0ff]",
                        done && "text-[#888899] line-through"
                      )}
                    >
                      {item.topic}
                    </span>
                    <span className="mt-1 block text-xs text-[#888899]">
                      {item.duration} · Pomodoro block
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </StudyCard>

        <StudyCard>
          <CardTitle>AI recommendation</CardTitle>
          <div className="rounded-lg border border-[#2a2a3a] bg-[#1a1a24] p-4 text-sm leading-7 text-[#f0f0ff]">
            {kit.tip || `Use short recall sessions for ${selectedSubjectLabel}.`}
          </div>
        </StudyCard>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#0a0a0f] px-4 py-0 text-[#f0f0ff] sm:px-5 lg:px-6">
      <div className="mx-auto flex min-h-screen max-w-[900px] flex-col">
        <header className="mb-7 border-b border-[#2a2a3a] py-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 sm:gap-4">
            <Link
              href="/#projects"
              className="inline-flex items-center gap-2 text-sm text-[#888899] transition hover:text-[#00e5ff]"
            >
              <ArrowLeft size={16} />
              Portfolio
            </Link>
            <div className="font-display text-xl font-extrabold">
              Study<span className="text-[#00e5ff]">Buddy</span>
            </div>
          </div>

          <nav className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
            {pages.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => showPage(id)}
                className={cn(
                  "inline-flex w-full items-center justify-center gap-2 rounded-lg px-3.5 py-2.5 text-sm text-[#888899] transition hover:bg-[#1a1a24] hover:text-[#f0f0ff] sm:w-auto sm:justify-start sm:py-2",
                  activePage === id && "bg-[#00e5ff]/10 font-medium text-[#00e5ff]"
                )}
              >
                <Icon size={15} />
                {label}
              </button>
            ))}
          </nav>
        </header>

        <div className="pb-12">
          {activePage === "home" && renderHome()}
          {activePage === "generate" && renderGenerate()}
          {activePage === "flashcards" && renderFlashcards()}
          {activePage === "quiz" && renderQuiz()}
          {activePage === "schedule" && renderSchedule()}
        </div>
      </div>
    </main>
  );
}
