import { NextResponse } from "next/server";

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

const commonWords = new Set([
  "about",
  "after",
  "again",
  "because",
  "before",
  "between",
  "could",
  "during",
  "every",
  "first",
  "important",
  "notes",
  "other",
  "should",
  "study",
  "their",
  "there",
  "these",
  "thing",
  "through",
  "under",
  "where",
  "which",
  "while",
  "would",
]);

function formatSubject(subject: string) {
  if (subject === "cs") return "computer science";
  if (subject === "maths") return "mathematics";
  return subject;
}

function getSentences(notes: string) {
  return notes
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

function getKeywords(notes: string, subject: string) {
  const words = notes
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .map((word) => word.trim())
    .filter((word) => word.length > 4 && !commonWords.has(word));

  const unique = Array.from(new Set(words));
  const fallback = [
    formatSubject(subject),
    "key concepts",
    "definitions",
    "examples",
    "practice questions",
  ];

  return [...unique, ...fallback].slice(0, 8);
}

function fallbackStudyKit(notes: string, subject: string): StudyKit {
  const subjectLabel = formatSubject(subject);
  const sentences = getSentences(notes);
  const keywords = getKeywords(notes, subject);
  const summarySource = sentences.slice(0, 2).join(" ");
  const summary =
    summarySource.length > 40
      ? summarySource
      : `These notes cover core ${subjectLabel} ideas and the relationships between the main concepts. Focus on definitions, examples, and recall practice before testing yourself.`;

  const flashcards = keywords.slice(0, 5).map((keyword) => ({
    q: `What should you remember about ${keyword}?`,
    a: `${keyword} is a key idea from your notes. Re-read the section where it appears and connect it to one example or definition.`,
  }));

  const quiz = keywords.slice(0, 5).map((keyword, index) => {
    const options = [
      `${keyword} is one of the key ideas in the notes`,
      "It is unrelated to the study material",
      "It should only be memorised without context",
      "It replaces the need for practice questions",
    ];

    return {
      q: `Which statement best matches ${keyword}?`,
      options,
      correct: 0,
    };
  });

  return {
    summary,
    flashcards,
    quiz,
    schedule: [
      { time: "09:00", topic: `Review ${keywords[0]}`, duration: "25 min" },
      { time: "09:30", topic: `Make recall notes for ${keywords[1]}`, duration: "25 min" },
      { time: "10:00", topic: `Quiz yourself on ${keywords[2]}`, duration: "15 min" },
      { time: "10:20", topic: `Summarise ${subjectLabel} weak spots`, duration: "20 min" },
    ],
    tip: `After each ${subjectLabel} block, close the notes and explain the idea out loud in one minute.`,
  };
}

function parseClaudeText(payload: unknown) {
  const content = (payload as { content?: Array<{ text?: string }> }).content;
  if (!Array.isArray(content)) return "";
  return content.map((block) => block.text ?? "").join("");
}

function parseStudyKit(raw: string) {
  const clean = raw.replace(/```json|```/g, "").trim();

  try {
    return JSON.parse(clean) as Partial<StudyKit>;
  } catch {
    const match = clean.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("Could not parse AI response");
    return JSON.parse(match[0]) as Partial<StudyKit>;
  }
}

function normalizeStudyKit(
  generated: Partial<StudyKit>,
  notes: string,
  subject: string
): StudyKit {
  const fallback = fallbackStudyKit(notes, subject);

  return {
    summary: generated.summary || fallback.summary,
    flashcards: Array.isArray(generated.flashcards) && generated.flashcards.length
      ? generated.flashcards.slice(0, 5)
      : fallback.flashcards,
    quiz: Array.isArray(generated.quiz) && generated.quiz.length
      ? generated.quiz
          .filter((question) => Array.isArray(question.options) && question.options.length >= 4)
          .slice(0, 5)
      : fallback.quiz,
    schedule: Array.isArray(generated.schedule) && generated.schedule.length
      ? generated.schedule.slice(0, 4)
      : fallback.schedule,
    tip: generated.tip || fallback.tip,
  };
}

export async function POST(request: Request) {
  try {
    const { notes, subject = "general" } = (await request.json()) as {
      notes?: string;
      subject?: string;
    };

    if (!notes?.trim()) {
      return NextResponse.json({ error: "Notes are required." }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      return NextResponse.json(fallbackStudyKit(notes, subject));
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-20250514",
        max_tokens: 1000,
        messages: [
          {
            role: "user",
            content: `You are an expert study assistant. Given the notes below, output ONLY valid JSON with this exact shape:

{
  "summary": "2-3 sentence plain-English summary of the key concepts",
  "flashcards": [
    {"q": "Question text?", "a": "Answer text"},
    {"q": "Question text?", "a": "Answer text"},
    {"q": "Question text?", "a": "Answer text"},
    {"q": "Question text?", "a": "Answer text"},
    {"q": "Question text?", "a": "Answer text"}
  ],
  "quiz": [
    {"q": "Question?", "options": ["Option A", "Option B", "Option C", "Option D"], "correct": 0},
    {"q": "Question?", "options": ["Option A", "Option B", "Option C", "Option D"], "correct": 1},
    {"q": "Question?", "options": ["Option A", "Option B", "Option C", "Option D"], "correct": 2},
    {"q": "Question?", "options": ["Option A", "Option B", "Option C", "Option D"], "correct": 3},
    {"q": "Question?", "options": ["Option A", "Option B", "Option C", "Option D"], "correct": 0}
  ],
  "schedule": [
    {"time": "09:00", "topic": "Topic description", "duration": "25 min"},
    {"time": "09:30", "topic": "Topic description", "duration": "25 min"},
    {"time": "10:00", "topic": "Topic description", "duration": "15 min"},
    {"time": "10:20", "topic": "Topic description", "duration": "20 min"}
  ],
  "tip": "One concrete, personalised study tip for this topic"
}

Subject: ${subject}
Notes:
${notes.slice(0, 3000)}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorPayload = (await response.json().catch(() => null)) as {
        error?: { message?: string };
      } | null;

      return NextResponse.json(
        { error: errorPayload?.error?.message ?? `Anthropic API returned ${response.status}.` },
        { status: response.status }
      );
    }

    const payload = await response.json();
    const text = parseClaudeText(payload);
    const generated = parseStudyKit(text);

    return NextResponse.json(normalizeStudyKit(generated, notes, subject));
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not generate study content." },
      { status: 500 }
    );
  }
}
