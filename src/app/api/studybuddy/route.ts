import { NextResponse } from "next/server";
import JSZip from "jszip";

export const runtime = "nodejs";

type Flashcard = {
  q: string;
  a: string;
};

type QuizDifficulty = "easy" | "medium" | "hard";

type QuizQuestion = {
  q: string;
  options: string[];
  correct: number;
  explanation: string;
  difficulty: QuizDifficulty;
  topic: string;
};

type GeneratedQuizQuestion = {
  question?: unknown;
  q?: unknown;
  options?: unknown;
  correctAnswer?: unknown;
  correct?: unknown;
  explanation?: unknown;
  difficulty?: unknown;
  topic?: unknown;
  sourceReference?: unknown;
  sourceChunk?: unknown;
};

type SourceChunk = {
  id: string;
  topic: string;
  text: string;
};

type SourceProfile = {
  cleanText: string;
  chunks: SourceChunk[];
  promptText: string;
  sourceTerms: Set<string>;
  blockedLabels: Set<string>;
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
const maxSourceChunks = 12;
const minChunkCharacters = 280;
const maxChunkCharacters = 1400;
const minQuizQuestions = 1;
const maxQuizQuestions = 20;
const fallbackFlashcardCount = 5;
const genericQuizPattern =
  /\b(which source detail|which statement best matches|what should you remember|source material|uploaded material|file name|filename|upload id|random guid|generic study advice|document heading|source title|raw source)\b/i;
const weakOptionPattern =
  /\b(unrelated to|only be memorised|replaces the need|all of the above|none of the above|not enough information|cannot be determined from the source)\b/i;
const metadataLinePattern =
  /^(page\s*\d+(\s*of\s*\d+)?|slide\s*\d+|\d+|source\s*:.*|file(name)?\s*:.*|uploaded\s+file\s*:.*|copyright.*|references|bibliography|table\s+of\s+contents)$/i;
const fileNamePattern = /\b[\w -]+\.(pdf|docx|pptx|xlsx|txt|md|csv|json|rtf|log|html|css|js|jsx|ts|tsx|xml|yaml|yml)\b/i;
const programmingPattern =
  /\b(c\+\+|java|sql|database|pointer|function pointer|class|object|inheritance|polymorphism|query|select|join|where|primary key|foreign key|array|loop|method|constructor|debug|compile|runtime|output)\b|#include|public\s+static\s+void|int\s+main|console\.log|System\.out|SELECT\s+.+\s+FROM/i;

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

function cleanGeneratedText(value: string, limit = 900) {
  const clean = value
    .replace(/\r/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  if (clean.length <= limit) return clean;
  return `${clean.slice(0, limit - 3).trim()}...`;
}

function normalizeForComparison(value: string) {
  return value
    .toLowerCase()
    .replace(/```[\s\S]*?```/g, " code block ")
    .replace(/[^a-z0-9+#]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function stripOptionLabel(value: string) {
  return value.replace(/^\s*(?:[A-D][.)]|[1-4][.)])\s+/i, "").trim();
}

function countSentences(value: string) {
  return (value.match(/[.!?](\s|$)/g) ?? []).length;
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

function isLikelyHeading(line: string) {
  const clean = line.trim();
  const words = clean.split(/\s+/).filter(Boolean);

  return (
    clean.length >= 3 &&
    clean.length <= 80 &&
    words.length <= 9 &&
    !/[.!?:;]$/.test(clean) &&
    !/[{}=<>()[\];]/.test(clean) &&
    !/^(select|insert|update|delete|create|alter|drop)\b/i.test(clean)
  );
}

function splitLongParagraph(paragraph: string) {
  if (paragraph.length <= maxChunkCharacters) return [paragraph];

  const sentences = paragraph
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);

  if (sentences.length <= 1) {
    const words = paragraph.split(/\s+/);
    const chunks: string[] = [];
    let current = "";

    words.forEach((word) => {
      const next = current ? `${current} ${word}` : word;
      if (next.length > maxChunkCharacters && current) {
        chunks.push(current);
        current = word;
      } else {
        current = next;
      }
    });

    if (current) chunks.push(current);
    return chunks;
  }

  const chunks: string[] = [];
  let current = "";

  sentences.forEach((sentence) => {
    const next = current ? `${current} ${sentence}` : sentence;
    if (next.length > maxChunkCharacters && current) {
      chunks.push(current);
      current = sentence;
    } else {
      current = next;
    }
  });

  if (current) chunks.push(current);
  return chunks;
}

function cleanStudyText(text: string) {
  const rawLines = decodeXmlEntities(text)
    .replace(/\u0000/g, " ")
    .replace(/\r/g, "\n")
    .replace(/\t/g, " ")
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trim());

  const shortLineCounts = rawLines.reduce((counts, line) => {
    const key = normalizeForComparison(line);
    if (key && line.length <= 80) counts.set(key, (counts.get(key) ?? 0) + 1);
    return counts;
  }, new Map<string, number>());

  const filteredLines = rawLines.filter((line) => {
    if (!line) return true;

    const normalized = normalizeForComparison(line);
    const repeatedShortLine = line.length <= 80 && (shortLineCounts.get(normalized) ?? 0) > 2;

    return (
      !repeatedShortLine &&
      !metadataLinePattern.test(line) &&
      !/^https?:\/\//i.test(line) &&
      !/^doi\s*:/i.test(line)
    );
  });

  return filteredLines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

function inferTopicFromText(text: string, fallback: string) {
  const terms = Array.from(new Set(getImportantTerms(text))).slice(0, 3);
  if (!terms.length) return fallback;
  return terms
    .map((term) => (term.length <= 4 ? term.toUpperCase() : term.charAt(0).toUpperCase() + term.slice(1)))
    .join(", ");
}

function createSemanticChunks(text: string, subject: string): SourceChunk[] {
  const fallbackTopic = formatSubject(subject);
  const lines = text
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
  const chunks: SourceChunk[] = [];
  let topic = fallbackTopic;
  let buffer: string[] = [];

  function flush(force = false) {
    const chunkText = buffer.join("\n").trim();
    if (!chunkText) return;

    if (!force && chunkText.length < minChunkCharacters && chunks.length > 0) {
      const lastChunk = chunks[chunks.length - 1];
      lastChunk.text = `${lastChunk.text}\n${chunkText}`.slice(0, maxChunkCharacters);
      buffer = [];
      return;
    }

    chunks.push({
      id: `chunk-${chunks.length + 1}`,
      topic: topic || inferTopicFromText(chunkText, fallbackTopic),
      text: chunkText,
    });
    buffer = [];
  }

  lines.forEach((line) => {
    if (isLikelyHeading(line)) {
      flush();
      topic = line;
      return;
    }

    splitLongParagraph(line).forEach((unit) => {
      const nextLength = buffer.join("\n").length + unit.length + 1;
      if (nextLength > maxChunkCharacters) flush();
      buffer.push(unit);
    });
  });

  flush(true);

  if (!chunks.length && text.trim()) {
    chunks.push({
      id: "chunk-1",
      topic: inferTopicFromText(text, fallbackTopic),
      text: cleanGeneratedText(text, maxChunkCharacters),
    });
  }

  return chunks.slice(0, maxSourceChunks).map((chunk, index) => ({
    ...chunk,
    id: `chunk-${index + 1}`,
    topic: cleanSnippet(chunk.topic, 60),
    text: cleanGeneratedText(chunk.text, maxChunkCharacters),
  }));
}

function buildBlockedLabels(attachments: StudyAttachment[]) {
  const labels = new Set([
    "attached material",
    "document",
    "file",
    "filename",
    "source",
    "source material",
    "study notes",
    "uploaded material",
  ]);

  attachments.forEach((attachment) => {
    const withoutExtension = attachment.name.replace(/\.[^.]+$/, "");
    [attachment.name, withoutExtension].forEach((label) => {
      const normalized = normalizeForComparison(label);
      if (normalized.length >= 4) labels.add(normalized);
    });
  });

  return labels;
}

function formatSourceChunksForPrompt(chunks: SourceChunk[]) {
  return chunks
    .map((chunk) => `[${chunk.id}] Topic: ${chunk.topic}\n${chunk.text}`)
    .join("\n\n")
    .slice(0, sourceMaterialLimit);
}

function buildSourceProfile(source: string, subject: string, attachments: StudyAttachment[]): SourceProfile {
  const cleanText = cleanStudyText(source).slice(0, sourceMaterialLimit);
  const chunks = createSemanticChunks(cleanText, subject);

  return {
    cleanText,
    chunks,
    promptText: formatSourceChunksForPrompt(chunks),
    sourceTerms: buildSourceTerms(cleanText),
    blockedLabels: buildBlockedLabels(attachments),
  };
}

function isProgrammingSource(source: string, subject: string) {
  return subject === "cs" || programmingPattern.test(source);
}

function getDifficultyTargets(count: number) {
  if (count <= 1) return { easy: count, medium: 0, hard: 0 };
  if (count === 2) return { easy: 1, medium: 1, hard: 0 };

  const easy = Math.max(1, Math.round(count * 0.3));
  const hard = Math.max(1, Math.round(count * 0.3));
  const medium = Math.max(1, count - easy - hard);

  return { easy, medium, hard };
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
          (attachment, index) =>
            `- Attachment ${index + 1}: ${attachment.kind}, ${formatFileSize(attachment.size)}`
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

function buildFallbackQuestionText(sentence: string, keyword: string, difficulty: QuizDifficulty) {
  const lowerSentence = sentence.toLowerCase();

  if (difficulty === "hard" && programmingPattern.test(sentence)) {
    return `Which option best applies the ${keyword} idea from these notes?`;
  }

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

  return `What is the main idea about ${keyword} in these notes?`;
}

function buildFallbackAnswer(sentence: string) {
  return cleanSnippet(sentence.replace(/^[-*]\s*/, ""), 120);
}

function buildFallbackDistractors(keyword: string, relatedTerms: string[], subjectLabel: string) {
  const [first = "another concept", second = "a later step", third = subjectLabel] = relatedTerms;

  return [
    `${keyword} mainly refers to ${first}, not the role described in the notes.`,
    `${keyword} is only used after ${second} has already solved the problem.`,
    `${keyword} has the same meaning as ${third} in every context.`,
  ].map((option) => cleanSnippet(option, 120));
}

function fallbackStudyKit(notes: string, subject: string, questionCount: number): StudyKit {
  const subjectLabel = formatSubject(subject);
  const sourceProfile = buildSourceProfile(notes, subject, []);
  const cleanNotes = sourceProfile.cleanText || notes;
  const sentences = getSentences(cleanNotes).filter((sentence) => getImportantTerms(sentence).length > 0);
  const keywords = shuffleArray(getKeywords(cleanNotes, subject));
  const difficultyCycle: QuizDifficulty[] = ["easy", "medium", "hard"];
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
    const difficulty = difficultyCycle[index % difficultyCycle.length];
    const sentence =
      sourceSentences.find((item) => item.toLowerCase().includes(keyword.toLowerCase())) ??
      sourceSentences[index % sourceSentences.length] ??
      summary;
    const otherTerms = keywords.filter((item) => item !== keyword);
    const correct = buildFallbackAnswer(sentence);
    const options = [correct, ...buildFallbackDistractors(keyword, otherTerms, subjectLabel)];

    return shuffleQuizQuestion({
      q: buildFallbackQuestionText(sentence, keyword, difficulty),
      options,
      correct: 0,
      explanation: `The notes support this answer because they connect ${keyword} with the stated idea.`,
      difficulty,
      topic: cleanSnippet(keyword, 50),
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

function parseJsonValue(raw: string) {
  const clean = raw.replace(/```(?:json)?|```/gi, "").trim();

  try {
    return JSON.parse(clean);
  } catch {
    const objectStart = clean.indexOf("{");
    const objectEnd = clean.lastIndexOf("}");
    const arrayStart = clean.indexOf("[");
    const arrayEnd = clean.lastIndexOf("]");
    const candidates = [
      objectStart >= 0 && objectEnd > objectStart ? clean.slice(objectStart, objectEnd + 1) : "",
      arrayStart >= 0 && arrayEnd > arrayStart ? clean.slice(arrayStart, arrayEnd + 1) : "",
    ].filter(Boolean);

    for (const candidate of candidates) {
      try {
        return JSON.parse(candidate);
      } catch {
        // Try the next possible JSON envelope.
      }
    }
  }

  throw new Error("Could not parse AI response");
}

function parseStudyKit(raw: string) {
  const parsed = parseJsonValue(raw);

  if (Array.isArray(parsed)) {
    return { quiz: parsed as unknown as QuizQuestion[] } as Partial<StudyKit>;
  }

  return parsed as Partial<StudyKit>;
}

type QuizValidationState = {
  questionKeys: Set<string>;
  correctAnswerKeys: Set<string>;
  optionKeys: Set<string>;
};

function createQuizValidationState(existingQuestions: QuizQuestion[] = []): QuizValidationState {
  const state: QuizValidationState = {
    questionKeys: new Set(),
    correctAnswerKeys: new Set(),
    optionKeys: new Set(),
  };

  existingQuestions.forEach((question) => registerValidatedQuestion(question, state));
  return state;
}

function registerValidatedQuestion(question: QuizQuestion, state: QuizValidationState) {
  state.questionKeys.add(normalizeForComparison(question.q));
  state.correctAnswerKeys.add(normalizeForComparison(question.options[question.correct] ?? ""));
  question.options.forEach((option) => state.optionKeys.add(normalizeForComparison(option)));
}

function normalizeDifficulty(value: unknown, fallback: QuizDifficulty): QuizDifficulty {
  const normalized = String(value ?? "").toLowerCase();
  if (normalized === "easy" || normalized === "medium" || normalized === "hard") return normalized;
  return fallback;
}

function parseCorrectIndex(question: GeneratedQuizQuestion, options: string[]) {
  const rawCorrect = question.correctAnswer ?? question.correct;

  if (typeof rawCorrect === "number" && Number.isInteger(rawCorrect)) {
    return rawCorrect >= 0 && rawCorrect < options.length ? rawCorrect : -1;
  }

  const answer = String(rawCorrect ?? "").trim();
  const letterMatch = answer.match(/^(?:option\s*)?([A-D])$/i);
  if (letterMatch) return letterMatch[1].toUpperCase().charCodeAt(0) - 65;

  const numberedMatch = answer.match(/^([1-4])$/);
  if (numberedMatch) return Number(numberedMatch[1]) - 1;

  const strippedAnswer = normalizeForComparison(stripOptionLabel(answer));
  return options.findIndex((option) => normalizeForComparison(option) === strippedAnswer);
}

function hasBlockedLabel(value: string, blockedLabels: Set<string>) {
  const normalized = normalizeForComparison(value);

  if (
    fileNamePattern.test(value) ||
    /\b(source material|uploaded material|attached material|file name|filename|source title)\b/i.test(
      value
    )
  ) {
    return true;
  }

  for (const label of Array.from(blockedLabels)) {
    if (label.length > 8 && normalized.includes(label)) return true;
  }

  return false;
}

function looksLikeRawSourceOption(option: string) {
  return (
    option.length > 180 ||
    metadataLinePattern.test(option) ||
    /^\[?chunk-\d+\]?/i.test(option) ||
    (countSentences(option) > 1 && !programmingPattern.test(option))
  );
}

function textSimilarity(left: string, right: string) {
  const leftTerms = new Set(getImportantTerms(left));
  const rightTerms = new Set(getImportantTerms(right));
  const union = new Set(Array.from(leftTerms).concat(Array.from(rightTerms)));
  if (!union.size) return normalizeForComparison(left) === normalizeForComparison(right) ? 1 : 0;

  const overlap = Array.from(leftTerms).filter((term) => rightTerms.has(term)).length;
  return overlap / union.size;
}

function optionsAreDistinct(options: string[]) {
  for (let leftIndex = 0; leftIndex < options.length; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < options.length; rightIndex += 1) {
      if (textSimilarity(options[leftIndex], options[rightIndex]) > 0.82) return false;
    }
  }

  return true;
}

function correctAnswerLengthLooksFair(question: QuizQuestion) {
  const correctLength = question.options[question.correct]?.length ?? 0;
  const wrongLengths = question.options
    .filter((_, index) => index !== question.correct)
    .map((option) => option.length);
  const wrongAverage =
    wrongLengths.reduce((total, length) => total + length, 0) / Math.max(1, wrongLengths.length);

  return correctLength <= Math.max(70, wrongAverage * 1.65);
}

function isAnswerableFromSource(question: QuizQuestion, sourceProfile: SourceProfile) {
  if (sourceProfile.sourceTerms.size <= 3) return true;

  const combined = [
    question.q,
    question.topic,
    question.options[question.correct],
    question.explanation,
  ].join(" ");

  return countSourceTermOverlap(combined, sourceProfile.sourceTerms) >= 2;
}

function isStrongQuestion(
  question: QuizQuestion,
  sourceProfile: SourceProfile,
  state: QuizValidationState
) {
  const questionKey = normalizeForComparison(question.q);
  const correctKey = normalizeForComparison(question.options[question.correct] ?? "");
  const optionKeys = question.options.map(normalizeForComparison);
  const uniqueOptions = new Set(optionKeys);

  return (
    question.q.trim().length >= 18 &&
    question.options.length === 4 &&
    uniqueOptions.size === 4 &&
    question.correct >= 0 &&
    question.correct < 4 &&
    question.explanation.trim().length >= 18 &&
    question.topic.trim().length >= 2 &&
    !state.questionKeys.has(questionKey) &&
    !state.correctAnswerKeys.has(correctKey) &&
    !question.options.some((option) => state.optionKeys.has(normalizeForComparison(option))) &&
    !genericQuizPattern.test(question.q) &&
    !question.options.some((option) => weakOptionPattern.test(option)) &&
    !question.options.some((option) => hasBlockedLabel(option, sourceProfile.blockedLabels)) &&
    !question.options.some(looksLikeRawSourceOption) &&
    optionsAreDistinct(question.options) &&
    correctAnswerLengthLooksFair(question) &&
    isAnswerableFromSource(question, sourceProfile)
  );
}

function normalizeGeneratedQuestion(
  rawQuestion: unknown,
  sourceProfile: SourceProfile,
  state: QuizValidationState,
  fallbackDifficulty: QuizDifficulty
): QuizQuestion | null {
  const question = rawQuestion as GeneratedQuizQuestion;
  const rawOptions = Array.isArray(question.options) ? question.options : [];

  if (rawOptions.length !== 4) return null;

  const rawOptionStrings = rawOptions.map((option) => stripOptionLabel(String(option)));
  if (rawOptionStrings.some((option) => option.length > 180)) return null;

  const options = rawOptionStrings
    .map((option) => cleanSnippet(option, 160))
    .filter(Boolean);

  if (options.length !== 4) return null;

  const correct = parseCorrectIndex(question, options);
  const q = cleanGeneratedText(String(question.question ?? question.q ?? ""), 900);
  const topic = cleanSnippet(
    String(question.topic ?? inferTopicFromText(q, "Core concept")),
    50
  );
  const explanation = cleanGeneratedText(
    String(question.explanation ?? `The answer follows from the notes on ${topic}.`),
    360
  );
  const normalized: QuizQuestion = {
    q,
    options,
    correct,
    explanation,
    difficulty: normalizeDifficulty(question.difficulty, fallbackDifficulty),
    topic,
  };

  if (!isStrongQuestion(normalized, sourceProfile, state)) return null;

  registerValidatedQuestion(normalized, state);
  return shuffleQuizQuestion(normalized);
}

function getGeneratedQuizItems(generated: Partial<StudyKit>) {
  const quiz = (generated as { quiz?: unknown }).quiz;
  return Array.isArray(quiz) ? quiz : [];
}

function normalizeGeneratedQuiz(
  generated: Partial<StudyKit>,
  sourceProfile: SourceProfile,
  questionCount: number,
  existingQuestions: QuizQuestion[] = []
) {
  const state = createQuizValidationState(existingQuestions);
  const difficultyCycle: QuizDifficulty[] = ["easy", "medium", "hard"];
  const quiz: QuizQuestion[] = [];

  getGeneratedQuizItems(generated).forEach((question, index) => {
    if (quiz.length >= questionCount) return;

    const normalized = normalizeGeneratedQuestion(
      question,
      sourceProfile,
      state,
      difficultyCycle[index % difficultyCycle.length]
    );

    if (normalized) quiz.push(normalized);
  });

  return [...existingQuestions, ...quiz].slice(0, questionCount);
}

function normalizeFlashcards(generated: Partial<StudyKit>, fallback: StudyKit) {
  if (!Array.isArray(generated.flashcards) || !generated.flashcards.length) {
    return fallback.flashcards;
  }

  return generated.flashcards
    .filter((card) => {
      const candidate = card as Partial<Flashcard>;
      return typeof candidate.q === "string" && typeof candidate.a === "string";
    })
    .slice(0, 5)
    .map((card) => ({
      q: cleanSnippet(String((card as Flashcard).q), 140),
      a: cleanSnippet(String((card as Flashcard).a), 220),
    }));
}

function normalizeSchedule(generated: Partial<StudyKit>, fallback: StudyKit) {
  if (!Array.isArray(generated.schedule) || !generated.schedule.length) {
    return fallback.schedule;
  }

  return generated.schedule
    .filter((item) => {
      const candidate = item as Partial<ScheduleItem>;
      return (
        typeof candidate.time === "string" &&
        typeof candidate.topic === "string" &&
        typeof candidate.duration === "string"
      );
    })
    .slice(0, 4)
    .map((item) => ({
      time: cleanSnippet(String((item as ScheduleItem).time), 20),
      topic: cleanSnippet(String((item as ScheduleItem).topic), 80),
      duration: cleanSnippet(String((item as ScheduleItem).duration), 20),
    }));
}

function normalizeStudyKit(
  generated: Partial<StudyKit>,
  sourceProfile: SourceProfile,
  subject: string,
  questionCount: number,
  quiz: QuizQuestion[]
): StudyKit {
  const fallback = fallbackStudyKit(sourceProfile.cleanText, subject, questionCount);
  const finalQuiz =
    quiz.length >= questionCount
      ? quiz.slice(0, questionCount)
      : [...quiz, ...fallback.quiz].slice(0, questionCount);

  return {
    summary:
      typeof generated.summary === "string" && generated.summary.trim()
        ? cleanGeneratedText(generated.summary, 420)
        : fallback.summary,
    flashcards: normalizeFlashcards(generated, fallback),
    quiz: shuffleArray(finalQuiz).map(shuffleQuizQuestion),
    schedule: normalizeSchedule(generated, fallback),
    tip:
      typeof generated.tip === "string" && generated.tip.trim()
        ? cleanSnippet(generated.tip, 180)
        : fallback.tip,
  };
}

function formatDifficultyTargets(count: number) {
  const targets = getDifficultyTargets(count);
  const parts = [
    targets.easy ? `${targets.easy} easy` : "",
    targets.medium ? `${targets.medium} medium` : "",
    targets.hard ? `${targets.hard} hard` : "",
  ].filter(Boolean);

  return parts.join(", ");
}

function countDifficulties(questions: QuizQuestion[]) {
  return questions.reduce(
    (counts, question) => {
      counts[question.difficulty] += 1;
      return counts;
    },
    { easy: 0, medium: 0, hard: 0 } as Record<QuizDifficulty, number>
  );
}

function formatMissingDifficultyTargets(questionCount: number, existingQuestions: QuizQuestion[]) {
  const targets = getDifficultyTargets(questionCount);
  const current = countDifficulties(existingQuestions);
  const missing = {
    easy: Math.max(0, targets.easy - current.easy),
    medium: Math.max(0, targets.medium - current.medium),
    hard: Math.max(0, targets.hard - current.hard),
  };

  return Object.entries(missing)
    .filter(([, count]) => count > 0)
    .map(([difficulty, count]) => `${count} ${difficulty}`)
    .join(", ");
}

function buildQuizSchemaExample() {
  return `[
  {
    "question": "...",
    "options": ["A", "B", "C", "D"],
    "correctAnswer": "A",
    "explanation": "...",
    "difficulty": "easy | medium | hard",
    "topic": "...",
    "sourceReference": "chunk-1"
  }
]`;
}

function buildStudyKitPrompt({
  subject,
  questionCount,
  attachmentSummary,
  sourceProfile,
  hasReadableMedia,
}: {
  subject: string;
  questionCount: number;
  attachmentSummary: string;
  sourceProfile: SourceProfile;
  hasReadableMedia: boolean;
}) {
  const programmingSource = isProgrammingSource(sourceProfile.cleanText, subject);

  return `You are an expert exam question generator and study assistant. Create high-quality study material from the provided study notes. Use the source content only. Do not use headings, titles, file names, source labels, citations, page numbers, or raw extracted chunks as answer options.

Return ONLY valid JSON with this exact object shape:

{
  "summary": "2-3 sentence plain-English summary of the key concepts",
  "flashcards": [
    {"q": "Question text?", "a": "Answer text"},
    {"q": "Question text?", "a": "Answer text"},
    {"q": "Question text?", "a": "Answer text"},
    {"q": "Question text?", "a": "Answer text"},
    {"q": "Question text?", "a": "Answer text"}
  ],
  "quiz": ${buildQuizSchemaExample()},
  "schedule": [
    {"time": "09:00", "topic": "Topic description", "duration": "25 min"},
    {"time": "09:30", "topic": "Topic description", "duration": "25 min"},
    {"time": "10:00", "topic": "Topic description", "duration": "15 min"},
    {"time": "10:20", "topic": "Topic description", "duration": "20 min"}
  ],
  "tip": "One concrete, personalised study tip for this topic"
}

Quiz rules:
- Generate exactly ${questionCount} quiz questions.
- Difficulty mix: ${formatDifficultyTargets(questionCount)}.
- Each question must test understanding of the source content, not recall of a heading.
- Across the quiz, include a mix of definitions, examples, non-examples, comparisons, process/steps, correct usage, and application questions.
- If the notes include examples, code snippets, scenarios, tables, formulas, or queries, turn them into example-based questions such as "Which example best shows...", "Which definition fits...", "What happens in this case?", or "Which option correctly applies...".
- Easy questions test definitions and basic facts.
- Medium questions test explanation, comparison, or correct usage.
- Hard questions test application, debugging, code/output reasoning, or "what happens if" reasoning.
- Each question must have exactly 4 options and exactly 1 correct option.
- "correctAnswer" must be the letter A, B, C, or D for the correct option in the current options array.
- Wrong options must be believable, related to the same topic, and clearly incorrect.
- Keep the correct answer similar in length and style to the wrong options.
- Do not repeat a question, correct answer, or answer option.
- Do not use "all of the above", "none of the above", "not enough information", file names, document titles, source labels, or raw source text.
- Include a short explanation in simple student language.
- Include a topic and a sourceReference chunk id for internal validation.
${programmingSource ? "- This is programming/database material. Include code/output/debugging/application questions where possible, and calculate the correct answer carefully before writing it." : ""}

Subject: ${formatSubject(subject)}
${attachmentSummary}

${hasReadableMedia ? "If an attached image or PDF is included, read the visible text and study content first." : ""}

Source chunks:
${sourceProfile.promptText || "Use the attached image or PDF content as the source material."}`;
}

function buildQuizTopUpPrompt({
  subject,
  sourceProfile,
  missingCount,
  questionCount,
  existingQuestions,
}: {
  subject: string;
  sourceProfile: SourceProfile;
  missingCount: number;
  questionCount: number;
  existingQuestions: QuizQuestion[];
}) {
  const existingSummary = existingQuestions
    .map(
      (question, index) =>
        `${index + 1}. ${question.q} | correct: ${question.options[question.correct]}`
    )
    .join("\n");

  return `You are an expert exam question generator. The previous response did not contain enough valid quiz questions.

Create exactly ${missingCount} additional multiple-choice quiz questions from the study notes. Return ONLY valid JSON in this array format:
${buildQuizSchemaExample()}

Rules:
- Do not repeat any existing question, correct answer, or answer option.
- Needed difficulty balance if possible: ${formatMissingDifficultyTargets(questionCount, existingQuestions) || "any missing mix"}.
- Include a varied mix of definitions, examples, non-examples, comparisons, correct usage, process/steps, and application questions.
- When the source contains examples, code snippets, scenarios, formulas, tables, or queries, generate at least one question that asks the learner to apply or identify the example.
- Each question must have exactly 4 options and exactly one correct option.
- "correctAnswer" must be A, B, C, or D.
- Wrong options must be realistic and related to the same topic.
- Do not copy headings, titles, file names, source labels, or raw source text as options.
- For programming/database content, include code/output/debugging/application questions where possible and compute the correct answer carefully.
- Include explanation, difficulty, topic, and sourceReference.

Subject: ${formatSubject(subject)}

Existing accepted questions:
${existingSummary || "None yet."}

Source chunks:
${sourceProfile.promptText || "Use the attached image or PDF content as the source material."}`;
}

function buildRepairPrompt(raw: string) {
  return `Repair the following AI response into valid JSON only. Preserve the intended study content. The JSON must be either the full StudyKit object with summary, flashcards, quiz, schedule, and tip, or a quiz array matching this schema:
${buildQuizSchemaExample()}

Return only parseable JSON. No markdown, no commentary.

Broken response:
${raw.slice(0, 6000)}`;
}

async function callClaude({
  apiKey,
  prompt,
  mediaBlocks = [],
  maxTokens,
}: {
  apiKey: string;
  prompt: string;
  mediaBlocks?: Array<Record<string, unknown>>;
  maxTokens: number;
}) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-20250514",
      max_tokens: maxTokens,
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

    throw new Error(errorPayload?.error?.message ?? `Anthropic API returned ${response.status}.`);
  }

  const payload = await response.json();
  return parseClaudeText(payload);
}

async function parseStudyKitWithRepair(apiKey: string, raw: string) {
  try {
    return parseStudyKit(raw);
  } catch {
    const repaired = await callClaude({
      apiKey,
      prompt: buildRepairPrompt(raw),
      maxTokens: 5000,
    });

    return parseStudyKit(repaired);
  }
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
    const sourceProfile = buildSourceProfile(studySource, subject, attachments);

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

      return NextResponse.json(
        fallbackStudyKit(sourceProfile.cleanText || studySource, subject, questionCount)
      );
    }

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
            title: "Study document",
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

    const prompt = buildStudyKitPrompt({
      subject,
      questionCount,
      attachmentSummary,
      sourceProfile,
      hasReadableMedia,
    });
    const text = await callClaude({
      apiKey,
      prompt,
      mediaBlocks,
      maxTokens: Math.min(8000, 2200 + questionCount * 300),
    });
    let generated: Partial<StudyKit> = {};

    try {
      generated = await parseStudyKitWithRepair(apiKey, text);
    } catch {
      generated = {};
    }

    let quiz = normalizeGeneratedQuiz(generated, sourceProfile, questionCount);

    // The model can obey the schema but still produce weak items. Top up with fresh questions
    // using the already-accepted set as an explicit do-not-repeat list.
    for (let attempt = 0; attempt < 2 && quiz.length < questionCount; attempt += 1) {
      const missingCount = questionCount - quiz.length;
      const topUpPrompt = buildQuizTopUpPrompt({
        subject,
        sourceProfile,
        missingCount,
        questionCount,
        existingQuestions: quiz,
      });

      try {
        const topUpText = await callClaude({
          apiKey,
          prompt: topUpPrompt,
          mediaBlocks,
          maxTokens: Math.min(5000, 1200 + missingCount * 320),
        });
        const topUpGenerated = await parseStudyKitWithRepair(apiKey, topUpText);
        const beforeCount = quiz.length;
        quiz = normalizeGeneratedQuiz(topUpGenerated, sourceProfile, questionCount, quiz);

        if (quiz.length === beforeCount) break;
      } catch {
        break;
      }
    }

    return NextResponse.json(
      normalizeStudyKit(generated, sourceProfile, subject, questionCount, quiz)
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not generate study content." },
      { status: 500 }
    );
  }
}
