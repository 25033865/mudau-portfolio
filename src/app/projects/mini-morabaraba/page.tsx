"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, BrainCircuit, RotateCcw, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

type Player = "you" | "ofs";
type Cell = Player | null;
type Move =
  | { kind: "place"; to: number }
  | { kind: "slide"; from: number; to: number };

const YOU: Player = "you";
const OFS: Player = "ofs";

const winLines = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
] as const;

const adjacent: Record<number, number[]> = {
  0: [1, 3, 4],
  1: [0, 2, 4],
  2: [1, 4, 5],
  3: [0, 4, 6],
  4: [0, 1, 2, 3, 5, 6, 7, 8],
  5: [2, 4, 8],
  6: [3, 4, 7],
  7: [4, 6, 8],
  8: [4, 5, 7],
};

const emptyBoard = (): Cell[] => Array<Cell>(9).fill(null);

function countPieces(board: Cell[], player: Player) {
  return board.filter((cell) => cell === player).length;
}

function getWinner(board: Cell[]) {
  for (const [a, b, c] of winLines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }

  return null;
}

function getLegalMoves(board: Cell[], player: Player): Move[] {
  if (countPieces(board, player) < 3) {
    return board
      .map((cell, index) => (cell === null ? ({ kind: "place", to: index } as Move) : null))
      .filter((move): move is Move => move !== null);
  }

  return board.flatMap((cell, index) => {
    if (cell !== player) return [];

    return adjacent[index]
      .filter((to) => board[to] === null)
      .map((to) => ({ kind: "slide", from: index, to } as Move));
  });
}

function applyMove(board: Cell[], player: Player, move: Move) {
  const next = [...board];

  if (move.kind === "slide") {
    next[move.from] = null;
  }

  next[move.to] = player;
  return next;
}

function pickBotMove(board: Cell[]) {
  const legal = getLegalMoves(board, OFS);
  if (legal.length === 0) return null;

  const winningMove = legal.find((move) => getWinner(applyMove(board, OFS, move)) === OFS);
  if (winningMove) return winningMove;

  const playerThreat = getLegalMoves(board, YOU).find(
    (move) => getWinner(applyMove(board, YOU, move)) === YOU
  );
  if (playerThreat) {
    const block = legal.find((move) => move.to === playerThreat.to);
    if (block) return block;
  }

  const safeMove = legal.find((move) => {
    const next = applyMove(board, OFS, move);
    return !getLegalMoves(next, YOU).some(
      (playerMove) => getWinner(applyMove(next, YOU, playerMove)) === YOU
    );
  });
  if (safeMove) return safeMove;

  return [...legal].sort((a, b) => scoreTarget(b.to) - scoreTarget(a.to))[0];
}

function scoreTarget(index: number) {
  if (index === 4) return 3;
  if ([0, 2, 6, 8].includes(index)) return 2;
  return 1;
}

export default function MiniMorabarabaPage() {
  const [board, setBoard] = useState<Cell[]>(emptyBoard);
  const [turn, setTurn] = useState<Player>(YOU);
  const [selected, setSelected] = useState<number | null>(null);
  const winner = useMemo(() => getWinner(board), [board]);
  const youPieces = countPieces(board, YOU);
  const ofsPieces = countPieces(board, OFS);
  const phase = youPieces < 3 || ofsPieces < 3 ? "placing" : "moving";

  const status = useMemo(() => {
    if (winner === YOU) return "You won. Sharp thinking.";
    if (winner === OFS) return "OFS won this round.";
    if (turn === OFS) return "OFS is thinking...";
    if (phase === "placing") return "Place your next piece.";
    if (selected !== null) return "Choose an open connected spot.";
    return "Select one of your pieces to move.";
  }, [phase, selected, turn, winner]);

  useEffect(() => {
    if (turn !== OFS || winner) return;

    const timeout = window.setTimeout(() => {
      const move = pickBotMove(board);
      if (!move) {
        setTurn(YOU);
        return;
      }

      setBoard((current) => applyMove(current, OFS, move));
      setTurn(YOU);
    }, 520);

    return () => window.clearTimeout(timeout);
  }, [board, turn, winner]);

  const finishPlayerMove = (next: Cell[]) => {
    setBoard(next);
    setSelected(null);
    setTurn(OFS);
  };

  const handleCellClick = (index: number) => {
    if (winner || turn !== YOU) return;

    if (youPieces < 3) {
      if (board[index] !== null) return;
      finishPlayerMove(applyMove(board, YOU, { kind: "place", to: index }));
      return;
    }

    if (board[index] === YOU) {
      setSelected(index);
      return;
    }

    if (selected === null || board[index] !== null || !adjacent[selected].includes(index)) {
      return;
    }

    finishPlayerMove(applyMove(board, YOU, { kind: "slide", from: selected, to: index }));
  };

  const resetGame = () => {
    setBoard(emptyBoard());
    setTurn(YOU);
    setSelected(null);
  };

  return (
    <main className="min-h-screen bg-bg grid-bg px-4 py-6 text-text sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/#show-ofs"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface/80 px-4 py-2 font-body text-sm text-muted transition-colors hover:border-accent/40 hover:text-accent"
          >
            <ArrowLeft size={16} />
            Back to Show OFS
          </Link>

          <button
            type="button"
            onClick={resetGame}
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 font-body text-sm font-semibold text-bg transition-colors hover:bg-accent/90"
          >
            <RotateCcw size={16} />
            Restart
          </button>
        </header>

        <section className="grid gap-5 lg:grid-cols-[1fr_340px]">
          <div className="glass rounded-2xl p-5 sm:p-8">
            <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="mb-2 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-3 py-1 font-mono text-xs uppercase tracking-[0.18em] text-accent">
                  <BrainCircuit size={14} />
                  Mini Morabaraba
                </p>
                <h1 className="font-display text-3xl font-bold leading-tight text-text sm:text-5xl">
                  Test your brain against OFS
                </h1>
              </div>
              <div className="rounded-xl border border-border bg-bg/70 px-4 py-3 font-body text-sm text-muted">
                {phase === "placing" ? "Place 3 pieces" : "Slide to make a line"}
              </div>
            </div>

            <div className="mx-auto grid aspect-square w-full max-w-[520px] grid-cols-3 gap-3">
              {board.map((cell, index) => {
                const isSelected = selected === index;
                const isMoveTarget =
                  selected !== null && board[index] === null && adjacent[selected].includes(index);

                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleCellClick(index)}
                    className={cn(
                      "relative flex aspect-square items-center justify-center rounded-xl border border-border bg-bg/80 transition-all hover:border-accent/50",
                      isSelected && "border-accent bg-accent/10",
                      isMoveTarget && "border-accent/60 bg-accent/5"
                    )}
                    aria-label={`Cell ${index + 1}`}
                  >
                    {cell && (
                      <span
                        className={cn(
                          "h-14 w-14 rounded-full border-2 shadow-[0_0_24px_rgba(0,229,255,0.18)] sm:h-20 sm:w-20",
                          cell === YOU
                            ? "border-accent bg-accent/25"
                            : "border-accent2 bg-accent2/25"
                        )}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <aside className="glass rounded-2xl p-5 sm:p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10 text-accent">
                <Trophy size={20} />
              </div>
              <div>
                <p className="font-body text-xs uppercase tracking-wider text-muted">Status</p>
                <p className="font-display text-xl font-bold text-text">{status}</p>
              </div>
            </div>

            <div className="space-y-3 font-body text-sm text-muted">
              <div className="flex items-center justify-between rounded-xl border border-border bg-bg/60 px-4 py-3">
                <span>Your pieces</span>
                <span className="font-mono text-accent">{youPieces}/3</span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-border bg-bg/60 px-4 py-3">
                <span>OFS pieces</span>
                <span className="font-mono text-accent2">{ofsPieces}/3</span>
              </div>
              <div className="rounded-xl border border-border bg-bg/60 px-4 py-3 leading-relaxed">
                Make a straight line of three. First place your pieces, then slide them through
                connected points to block OFS and create your winning line.
              </div>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
