import { NextResponse } from "next/server";
import JSZip from "jszip";

export const runtime = "nodejs";

type Flashcard = {
  q: string;
  a: string;
};

type QuizQuestion = {
  q: string;
  options: string[];
  correct: number;
  explanation?: string;
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

type AttachmentKind = "image" | "pdf" | "text" | "document" | "file";

type StudyAttachment = {
  name: string;
  size: number;
  type: string;
  kind: AttachmentKind;
  text?: string;
  data?: string;
  error?: string;
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
  "material",
  "notes",
  "other",
  "opened",
  "program",
  "programs",
  "question",
  "questions",
  "read",
  "reading",
  "reads",
  "should",
  "source",
  "study",
  "uploaded",
  "using",
  "their",
  "there",
  "these",
  "thing",
  "through",
  "under",
  "write",
  "writes",
  "writing",
  "where",
  "which",
  "while",
  "would",
]);

const textFileExtensions = new Set([
  "txt",
  "md",
  "csv",
  "json",
  "rtf",
  "log",
  "html",
  "css",
  "js",
  "jsx",
  "ts",
  "tsx",
  "xml",
  "yaml",
  "yml",
]);

const documentFileExtensions = new Set(["docx", "pptx", "xlsx"]);

const maxTextBytes = 512 * 1024;
const maxBinaryBytes = 10 * 1024 * 1024;
const sourceMaterialLimit = 12000;
const minQuizQuestions = 1;
const maxQuizQuestions = 20;
const fallbackFlashcardCount = 5;
const genericQuizPattern =
  /\b(which statement best matches|what should you remember|source material|uploaded material|file name|filename|upload id|random guid|generic study advice)\b/i;
const weakOptionPattern =
  /\b(unrelated to|only be memorised|replaces the need|all of the above|none of the above|not enough information)\b/i;

function formatSubject(subject: string) {
  if (subject === "cs") return "computer science";
  if (subject === "maths") return "mathematics";
  return subject;
}

function formatFileSize(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${Math.round(size / 102.4) / 10} KB`;
  return `${Math.round(size / 1024 / 102.4) / 10} MB`;
}

function clampQuestionCount(value: unknown) {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) return 10;

  return Math.min(maxQuizQuestions, Math.max(minQuizQuestions, Math.round(parsed)));
}

function shuffleArray<T>(items: T[]) {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled;
}

function shuffleQuizQuestion(question: QuizQuestion) {
  const options = question.options.map((option, index) => ({
    option,
    wasCorrect: index === question.correct,
  }));
  const shuffledOptions = shuffleArray(options);

  return {
    ...question,
    options: shuffledOptions.map(({ option }) => option),
    correct: Math.max(0, shuffledOptions.findIndex(({ wasCorrect }) => wasCorrect)),
  };
}

function cleanSnippet(value: string, limit = 180) {
  const clean = value.replace(/\s+/g, " ").trim();
  if (clean.length <= limit) return clean;
  return `${clean.slice(0, limit - 1).trim()}...`;
}

function getImportantTerms(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9+#\s-]/g, " ")
    .split(/\s+/)
    .map((word) => word.trim())
    .filter((word) => {
      const letters = word.match(/[a-z]/g)?.length ?? 0;
      const digits = word.match(/\d/g)?.length ?? 0;

      return (
        word.length > 3 &&
        letters >= 2 &&
        digits <= letters + 1 &&
        !/^[a-f0-9-]{8,}$/i.test(word) &&
        !commonWords.has(word)
      );
    });
}

function buildSourceTerms(source: string) {
  return new Set(getImportantTerms(source));
}

function countSourceTermOverlap(value: string, sourceTerms: Set<string>) {
  return getImportantTerms(value).filter((term) => sourceTerms.has(term)).length;
}

function hasEnoughSourceOverlap(question: QuizQuestion, sourceTerms: Set<string>) {
  if (sourceTerms.size <= 2) return true;

  const combined = [question.q, ...question.options, question.explanation ?? ""].join(" ");
  return countSourceTermOverlap(combined, sourceTerms) >= 2;
}

function isConvincingQuestion(question: QuizQuestion, sourceTerms: Set<string>) {
  const uniqueOptions = new Set(question.options.map((option) => option.toLowerCase().trim()));

  return (
    question.q.trim().length >= 18 &&
    question.options.length === 4 &&
    uniqueOptions.size === 4 &&
    question.correct >= 0 &&
    question.correct < 4 &&
    !genericQuizPattern.test(question.q) &&
    !question.options.some((option) => weakOptionPattern.test(option)) &&
    hasEnoughSourceOverlap(question, sourceTerms)
  );
}

function getFileExtension(name: string) {
  return name.split(".").pop()?.toLowerCase() ?? "";
}

function getAttachmentKind(file: File): AttachmentKind {
  const extension = getFileExtension(file.name);

  if (file.type.startsWith("image/")) return "image";
  if (file.type === "application/pdf" || extension === "pdf") return "pdf";
  if (file.type.startsWith("text/") || textFileExtensions.has(extension)) return "text";
  if (documentFileExtensions.has(extension)) return "document";

  return "file";
}

function arrayBufferToBase64(buffer: ArrayBuffer) {
  return Buffer.from(buffer).toString("base64");
}

function decodeXmlEntities(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCharCode(parseInt(code, 16)));
}

function normalizeExtractedText(text: string) {
  return decodeXmlEntities(text)
    .replace(/\u0000/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractXmlText(xml: string) {
  return normalizeExtractedText(xml.replace(/<[^>]+>/g, " "));
}

function sortOfficePath(a: string, b: string) {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
}

async function extractOfficeText(file: File) {
  const extension = getFileExtension(file.name);
  const zip = await JSZip.loadAsync(await file.arrayBuffer());
  const paths = Object.keys(zip.files).filter((path) => {
    const normalizedPath = path.replace(/\\/g, "/");

    if (zip.files[path].dir) return false;

    if (extension === "docx") {
      return /^word\/(document|footnotes|endnotes|comments|header\d+|footer\d+)\.xml$/i.test(
        normalizedPath
      );
    }

    if (extension === "pptx") {
      return /^ppt\/slides\/slide\d+\.xml$/i.test(normalizedPath);
    }

    if (extension === "xlsx") {
      return /^xl\/(sharedStrings|worksheets\/sheet\d+)\.xml$/i.test(normalizedPath);
    }

    return false;
  });

  const chunks = await Promise.all(
    paths.sort(sortOfficePath).map(async (path) => {
      const fileEntry = zip.file(path);
      if (!fileEntry) return "";
      return extractXmlText(await fileEntry.async("text"));
    })
  );

  return normalizeExtractedText(chunks.filter(Boolean).join("\n"));
}

async function fileToAttachment(file: File): Promise<StudyAttachment> {
  const kind = getAttachmentKind(file);
  const attachment: StudyAttachment = {
    name: file.name,
    size: file.size,
    type: file.type || "application/octet-stream",
    kind,
  };

  if (kind === "text") {
    const slice = file.slice(0, maxTextBytes);
    const text = await slice.text();
    attachment.text =
      file.size > maxTextBytes
        ? `${text}\n\n[${file.name} was trimmed after ${formatFileSize(maxTextBytes)}.]`
        : text;
  }

  if (kind === "document") {
    try {
      const text = await extractOfficeText(file);
      attachment.text = text.slice(0, sourceMaterialLimit);

      if (!attachment.text) {
        attachment.error = `${file.name} did not contain readable text.`;
      }
    } catch {
      attachment.error = `${file.name} could not be read. Try saving it as PDF, DOCX, PPTX, XLSX, TXT, or MD.`;
    }
  }

  if ((kind === "image" || kind === "pdf") && file.size <= maxBinaryBytes) {
    attachment.data = arrayBufferToBase64(await file.arrayBuffer());
  }

  if ((kind === "image" || kind === "pdf") && file.size > maxBinaryBytes) {
    attachment.error = `${file.name} is too large. Keep image and PDF attachments under ${formatFileSize(maxBinaryBytes)}.`;
  }

  if (kind === "file") {
    attachment.error = `${file.name} is not a readable study file. Use PDF, DOCX, PPTX, XLSX, TXT, MD, CSV, JSON, or an image.`;
  }

  return attachment;
}

async function readStudyRequest(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    const notes = String(formData.get("notes") ?? "");
    const subject = String(formData.get("subject") ?? "general");
    const questionCount = clampQuestionCount(formData.get("questionCount"));
    const files = formData
      .getAll("attachments")
      .filter((value): value is File => value instanceof File)
      .slice(0, 8);
    const attachments = await Promise.all(files.map(fileToAttachment));

    return { notes, subject, questionCount, attachments };
  }

  const { notes = "", subject = "general", questionCount = 10 } = (await request.json()) as {
    notes?: string;
    subject?: string;
    questionCount?: number;
  };

  return {
    notes,
    subject,
    questionCount: clampQuestionCount(questionCount),
    attachments: [] as StudyAttachment[],
  };
}

function buildStudySource(notes: string, attachments: StudyAttachment[]) {
  const attachmentText = attachments
    .filter((attachment) => attachment.text?.trim())
    .map((attachment) => attachment.text)
    .join("\n\n");

  return [notes.trim(), attachmentText].filter(Boolean).join("\n\n");
}

function buildAttachmentSummary(attachments: StudyAttachment[]) {
  const attachmentList = attachments.length
    ? `Attached material:\n${attachments
        .map(
          (attachment) =>
            `- ${attachment.name} (${attachment.kind}, ${formatFileSize(attachment.size)})`
        )
        .join("\n")}`
    : "";

  return attachmentList;
}

function getSentences(notes: string) {
  return notes
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

function getKeywords(notes: string, subject: string) {
  const words = getImportantTerms(notes).filter((word) => word.length > 4);

  const unique = Array.from(new Set(words));
  const fallback = [
    formatSubject(subject),
    "key concepts",
    "definitions",
    "examples",
    "practice questions",
  ];

  return unique.length ? unique : fallback;
}

function buildFallbackQuestionText(sentence: string, keyword: string) {
  const lowerSentence = sentence.toLowerCase();

  if (/\b(must|need|requires|required|before|after)\b/.test(lowerSentence)) {
    return `What requirement does the material give about ${keyword}?`;
  }

  if (/\b(refers to|means|is|are|defined as|known as)\b/.test(lowerSentence)) {
    return `How does the material explain ${keyword}?`;
  }

  if (/\b(read|reads|write|writes|store|stores|retrieve|retrieves|move|moves|open|opens)\b/.test(
    lowerSentence
  )) {
    return `What does the material say about ${keyword}?`;
  }

  return `Which source detail is correct about ${keyword}?`;
}

function fallbackStudyKit(notes: string, subject: string, questionCount: number): StudyKit {
  const subjectLabel = formatSubject(subject);
  const sentences = getSentences(notes).filter((sentence) => getImportantTerms(sentence).length > 0);
  const keywords = shuffleArray(getKeywords(notes, subject));
  const summarySource = sentences.slice(0, 2).join(" ");
  const summary =
    summarySource.length > 40
      ? summarySource
      : `These notes cover core ${subjectLabel} ideas and the relationships between the main concepts. Focus on definitions, examples, and recall practice before testing yourself.`;

  const flashcards = keywords.slice(0, fallbackFlashcardCount).map((keyword) => ({
    q: `What should you remember about ${keyword}?`,
    a: `${keyword} is a key idea from your notes. Re-read the section where it appears and connect it to one example or definition.`,
  }));

  const sourceSentences = sentences.length ? sentences : [summary];
  const quiz = Array.from({ length: questionCount }, (_, index) => {
    const keyword = keywords[index % keywords.length] ?? subjectLabel;
    const sentence =
      sourceSentences.find((item) => item.toLowerCase().includes(keyword.toLowerCase())) ??
      sourceSentences[index % sourceSentences.length] ??
      summary;
    const otherSentences = sourceSentences
      .filter((item) => item !== sentence)
      .map((item) => cleanSnippet(item, 140));
    const otherTerms = keywords.filter((item) => item !== keyword);
    const correct = cleanSnippet(sentence, 150);
    const options = [
      correct,
      otherSentences[0] ?? `${keyword} is mainly described as ${otherTerms[0] ?? "a separate topic"}.`,
      otherSentences[1] ?? `${keyword} is linked to ${otherTerms[1] ?? "another process"} instead of the stated role.`,
      otherSentences[2] ?? `${keyword} is treated as the same concept as ${otherTerms[2] ?? subjectLabel}.`,
    ];

    return shuffleQuizQuestion({
      q: buildFallbackQuestionText(sentence, keyword),
      options,
      correct: 0,
      explanation: `The material supports this with: "${correct}"`,
    });
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

function normalizeGeneratedQuestion(
  question: QuizQuestion,
  sourceTerms: Set<string>
): QuizQuestion | null {
  const options = question.options
    .slice(0, 4)
    .map((option) => cleanSnippet(String(option), 180))
    .filter(Boolean);
  const normalized: QuizQuestion = {
    q: cleanSnippet(String(question.q), 220),
    options,
    correct: question.correct >= 0 && question.correct < options.length ? question.correct : 0,
    explanation: question.explanation
      ? cleanSnippet(String(question.explanation), 220)
      : undefined,
  };

  return isConvincingQuestion(normalized, sourceTerms)
    ? shuffleQuizQuestion(normalized)
    : null;
}

function normalizeStudyKit(
  generated: Partial<StudyKit>,
  notes: string,
  subject: string,
  questionCount: number
): StudyKit {
  const fallback = fallbackStudyKit(notes, subject, questionCount);
  const sourceTerms = buildSourceTerms(notes);
  const generatedQuiz = Array.isArray(generated.quiz)
    ? generated.quiz
        .filter(
          (question) =>
            typeof question.q === "string" &&
            Array.isArray(question.options) &&
            question.options.length >= 4 &&
            Number.isInteger(question.correct)
        )
        .map((question) => normalizeGeneratedQuestion(question, sourceTerms))
        .filter((question): question is QuizQuestion => Boolean(question))
    : [];
  const quiz =
    generatedQuiz.length >= questionCount
      ? shuffleArray(generatedQuiz).slice(0, questionCount)
      : shuffleArray([...generatedQuiz, ...fallback.quiz]).slice(0, questionCount);

  return {
    summary: generated.summary || fallback.summary,
    flashcards: Array.isArray(generated.flashcards) && generated.flashcards.length
      ? generated.flashcards.slice(0, 5)
      : fallback.flashcards,
    quiz,
    schedule: Array.isArray(generated.schedule) && generated.schedule.length
      ? generated.schedule.slice(0, 4)
      : fallback.schedule,
    tip: generated.tip || fallback.tip,
  };
}

export async function POST(request: Request) {
  try {
    const { notes, subject = "general", questionCount, attachments } = await readStudyRequest(request);

    if (!notes.trim() && attachments.length === 0) {
      return NextResponse.json({ error: "Notes or attachments are required." }, { status: 400 });
    }

    const studySource = buildStudySource(notes, attachments);
    const attachmentSummary = buildAttachmentSummary(attachments);
    const unreadableAttachment = attachments.find((attachment) => attachment.error);
    const hasReadableMedia = attachments.some(
      (attachment) => attachment.data && (attachment.kind === "image" || attachment.kind === "pdf")
    );

    if (unreadableAttachment) {
      return NextResponse.json({ error: unreadableAttachment.error }, { status: 400 });
    }

    if (!studySource.trim() && !hasReadableMedia) {
      return NextResponse.json(
        { error: "I could not find readable study content in that upload." },
        { status: 400 }
      );
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      if (!studySource.trim()) {
        return NextResponse.json(
          {
            error:
              "Reading photos and PDFs needs the AI key. Attach a text, DOCX, PPTX, or XLSX file, or add notes in the text box.",
          },
          { status: 400 }
        );
      }

      return NextResponse.json(fallbackStudyKit(studySource, subject, questionCount));
    }

    const prompt = `You are an expert examiner and study assistant. First identify the real facts, definitions, relationships, examples, and procedures in the user's notes and attachments. Then generate the summary, flashcards, quiz, schedule, and tip strictly from those source details. If image or PDF attachments are included, read their visible text and study content first. Output ONLY valid JSON with this exact shape:

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
    {"q": "Question?", "options": ["Option A", "Option B", "Option C", "Option D"], "correct": 0, "explanation": "One sentence that cites the source fact behind the answer"}
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
Quiz question count: ${questionCount}
${attachmentSummary}

Source material:
${studySource.trim() ? studySource.slice(0, sourceMaterialLimit) : "Use the attached image or PDF content as the source material."}

Rules:
- Generate exactly ${questionCount} quiz questions.
- Every quiz question must test a specific fact, definition, code concept, method, relationship, comparison, or process found in the source material.
- Write convincing questions a lecturer would ask: specific, clear, and anchored to the document's actual wording or meaning.
- Each question must include at least one concrete term from the source material.
- Each option must be plausible and document-specific. Avoid throwaway distractors.
- Do not ask about filenames, upload IDs, random GUIDs, or generic study advice.
- Do not use generic stems like "Which statement best matches..." unless the rest of the question names an exact source concept.
- Make the quiz questions varied each time, with shuffled answer choices.
- Set "correct" to the zero-based index of the correct option after shuffling.`;

    const mediaBlocks = attachments
      .filter((attachment) => attachment.data && (attachment.kind === "image" || attachment.kind === "pdf"))
      .map((attachment) => {
        if (attachment.kind === "pdf") {
          return {
            type: "document",
            source: {
              type: "base64",
              media_type: "application/pdf",
              data: attachment.data,
            },
            title: attachment.name,
          };
        }

        return {
          type: "image",
          source: {
            type: "base64",
            media_type: attachment.type,
            data: attachment.data,
          },
        };
      });

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-20250514",
        max_tokens: Math.min(4000, 1200 + questionCount * 160),
        messages: [
          {
            role: "user",
            content: [...mediaBlocks, { type: "text", text: prompt }],
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

    return NextResponse.json(normalizeStudyKit(generated, studySource, subject, questionCount));
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not generate study content." },
      { status: 500 }
    );
  }
}
