"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

type Difficulty = "easy" | "normal" | "hard";
type Phase = "placing" | "moving";
type Player = "blue" | "red";
type Piece = Player | null;
type Pos = (typeof POS)[number];
type Board = Record<Pos, Piece>;
type CpuMove =
  | { type: "place"; pos: Pos }
  | { type: "move"; from: Pos; to: Pos };

type GameState = {
  board: Board;
  phase: Phase;
  current: Player;
  bluePieces: number;
  redPieces: number;
  selected: Pos | null;
  legal: Pos[];
  winner: Player | null;
  busy: boolean;
};

const POS = ["A", "B", "C", "D", "E", "F", "G", "H", "I"] as const;

const XY: Record<Pos, { x: number; y: number }> = {
  A: { x: 70, y: 70 },
  B: { x: 210, y: 70 },
  C: { x: 350, y: 70 },
  D: { x: 70, y: 210 },
  E: { x: 210, y: 210 },
  F: { x: 350, y: 210 },
  G: { x: 70, y: 350 },
  H: { x: 210, y: 350 },
  I: { x: 350, y: 350 },
};

const ADJ: Record<Pos, readonly Pos[]> = {
  A: ["B", "D", "E"],
  B: ["A", "C", "E"],
  C: ["B", "F", "E"],
  D: ["A", "E", "G"],
  E: ["A", "B", "C", "D", "F", "G", "H", "I"],
  F: ["C", "E", "I"],
  G: ["D", "E", "H"],
  H: ["G", "E", "I"],
  I: ["F", "E", "H"],
};

const WINS: readonly (readonly Pos[])[] = [
  ["A", "B", "C"],
  ["D", "E", "F"],
  ["G", "H", "I"],
  ["A", "D", "G"],
  ["B", "E", "H"],
  ["C", "F", "I"],
  ["A", "E", "I"],
  ["C", "E", "G"],
];

function createBoard() {
  return POS.reduce((board, pos) => {
    board[pos] = null;
    return board;
  }, {} as Board);
}

function createGame(): GameState {
  return {
    board: createBoard(),
    phase: "placing",
    current: "blue",
    bluePieces: 0,
    redPieces: 0,
    selected: null,
    legal: [],
    winner: null,
    busy: false,
  };
}

function checkWin(board: Board, player: Player) {
  return WINS.some((line) => line.every((pos) => board[pos] === player));
}

function legalMoves(board: Board, pos: Pos) {
  return ADJ[pos].filter((next) => board[next] === null);
}

function allMoves(board: Board, player: Player) {
  const moves: Array<{ from: Pos; to: Pos }> = [];

  POS.forEach((from) => {
    if (board[from] !== player) return;
    ADJ[from].forEach((to) => {
      if (board[to] === null) moves.push({ from, to });
    });
  });

  return moves;
}

function applyMove(board: Board, from: Pos, to: Pos, player: Player) {
  const next = { ...board };
  next[from] = null;
  next[to] = player;
  return next;
}

function minimax(board: Board, depth: number, isMax: boolean, alpha: number, beta: number): number {
  if (checkWin(board, "red")) return 10 - depth;
  if (checkWin(board, "blue")) return depth - 10;
  if (depth === 0) return 0;

  const moves = allMoves(board, isMax ? "red" : "blue");
  if (!moves.length) return 0;

  if (isMax) {
    let best = -99;

    for (const move of moves) {
      const score = minimax(applyMove(board, move.from, move.to, "red"), depth - 1, false, alpha, beta);
      if (score > best) best = score;
      if (best > alpha) alpha = best;
      if (beta <= alpha) break;
    }

    return best;
  }

  let best = 99;

  for (const move of moves) {
    const score = minimax(applyMove(board, move.from, move.to, "blue"), depth - 1, true, alpha, beta);
    if (score < best) best = score;
    if (best < beta) beta = best;
    if (beta <= alpha) break;
  }

  return best;
}

function cpuPick(board: Board, phase: Phase, difficulty: Difficulty): CpuMove | null {
  if (phase === "placing") {
    const empty = POS.filter((pos) => board[pos] === null);
    if (!empty.length) return null;

    if (difficulty === "easy") {
      return { type: "place", pos: empty[Math.floor(Math.random() * empty.length)] };
    }

    for (const pos of empty) {
      if (checkWin({ ...board, [pos]: "red" }, "red")) return { type: "place", pos };
    }

    for (const pos of empty) {
      if (checkWin({ ...board, [pos]: "blue" }, "blue")) return { type: "place", pos };
    }

    if (difficulty === "hard") {
      const priority: Pos[] = ["E", "A", "C", "G", "I", "B", "D", "F", "H"];
      const pick = priority.find((pos) => board[pos] === null);
      if (pick) return { type: "place", pos: pick };
    }

    return { type: "place", pos: empty[Math.floor(Math.random() * empty.length)] };
  }

  const moves = allMoves(board, "red");
  if (!moves.length) return null;

  if (difficulty === "easy") {
    return { type: "move", ...moves[Math.floor(Math.random() * moves.length)] };
  }

  for (const move of moves) {
    if (checkWin(applyMove(board, move.from, move.to, "red"), "red")) {
      return { type: "move", ...move };
    }
  }

  const blueMoves = allMoves(board, "blue");
  for (const blueMove of blueMoves) {
    if (checkWin(applyMove(board, blueMove.from, blueMove.to, "blue"), "blue")) {
      const block = moves.find((move) => move.to === blueMove.to);
      if (block) return { type: "move", ...block };
    }
  }

  if (difficulty === "hard") {
    let best = -99;
    let bestMove = moves[0];

    for (const move of moves) {
      const score = minimax(applyMove(board, move.from, move.to, "red"), 4, false, -99, 99);
      if (score > best) {
        best = score;
        bestMove = move;
      }
    }

    return { type: "move", ...bestMove };
  }

  return { type: "move", ...moves[Math.floor(Math.random() * moves.length)] };
}

function getStatus(game: GameState) {
  if (game.winner === "blue") {
    return { text: "You win! Well played.", className: "win-blue" };
  }

  if (game.winner === "red") {
    return { text: "Red CPU wins this round.", className: "win-red" };
  }

  if (game.busy) return { text: "CPU thinking..." };

  if (game.phase === "placing") {
    return {
      text:
        game.current === "blue"
          ? `Your turn - place a piece (${3 - game.bluePieces} left)`
          : "CPU placing...",
    };
  }

  return {
    text:
      game.current === "blue"
        ? game.selected
          ? `Moving from ${game.selected} - pick a green spot`
          : "Your turn - select a piece"
        : "CPU moving...",
  };
}

export default function MiniMorabarabaPage() {
  const [game, setGame] = useState<GameState>(() => createGame());
  const [difficulty, setDifficultyState] = useState<Difficulty>("easy");
  const [showRules, setShowRules] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  const status = getStatus(game);

  const winningPositions = useMemo(() => {
    const points = new Set<Pos>();

    if (!game.winner) return points;

    WINS.forEach((line) => {
      if (line.every((pos) => game.board[pos] === game.winner)) {
        line.forEach((pos) => points.add(pos));
      }
    });

    return points;
  }, [game.board, game.winner]);

  useEffect(() => {
    document.title = "Mini Morabaraba";

    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, []);

  const clearCpuTimeout = () => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const runCpuTurn = (currentDifficulty: Difficulty) => {
    const delay = currentDifficulty === "easy" ? 200 : currentDifficulty === "normal" ? 350 : 550;
    clearCpuTimeout();

    timeoutRef.current = window.setTimeout(() => {
      setGame((previous) => {
        if (previous.winner || previous.current !== "red") {
          return { ...previous, busy: false };
        }

        const move = cpuPick(previous.board, previous.phase, currentDifficulty);
        if (!move) {
          return { ...previous, current: "blue", busy: false };
        }

        let board = { ...previous.board };
        let redPieces = previous.redPieces;

        if (move.type === "place") {
          board[move.pos] = "red";
          redPieces += 1;
        } else {
          board = applyMove(board, move.from, move.to, "red");
        }

        const winner = checkWin(board, "red") ? "red" : null;
        const phase = !winner && previous.bluePieces === 3 && redPieces === 3 ? "moving" : previous.phase;

        return {
          ...previous,
          board,
          redPieces,
          phase,
          current: winner ? "red" : "blue",
          selected: null,
          legal: [],
          winner,
          busy: false,
        };
      });
    }, delay);
  };

  const commitPlayerMove = (next: GameState) => {
    setGame(next);

    if (next.current === "red" && !next.winner) {
      runCpuTurn(difficulty);
    }
  };

  const restart = () => {
    clearCpuTimeout();
    setGame(createGame());
  };

  const setDifficulty = (nextDifficulty: Difficulty) => {
    setDifficultyState(nextDifficulty);
    clearCpuTimeout();
    setGame(createGame());
  };

  const handlePointClick = (pos: Pos) => {
    if (game.winner || game.current !== "blue" || game.busy) return;

    if (game.phase === "placing") {
      if (game.board[pos] !== null || game.bluePieces >= 3) return;

      const board = { ...game.board, [pos]: "blue" as Player };
      const bluePieces = game.bluePieces + 1;
      const winner = checkWin(board, "blue") ? "blue" : null;
      const phase = !winner && bluePieces === 3 && game.redPieces === 3 ? "moving" : game.phase;

      commitPlayerMove({
        ...game,
        board,
        bluePieces,
        phase,
        current: winner ? "blue" : "red",
        selected: null,
        legal: [],
        winner,
        busy: !winner,
      });

      return;
    }

    if (game.board[pos] === "blue" && game.selected !== pos) {
      setGame({
        ...game,
        selected: pos,
        legal: legalMoves(game.board, pos),
      });
      return;
    }

    if (game.selected === pos) {
      setGame({ ...game, selected: null, legal: [] });
      return;
    }

    if (!game.selected || !game.legal.includes(pos)) return;

    const board = applyMove(game.board, game.selected, pos, "blue");
    const winner = checkWin(board, "blue") ? "blue" : null;

    commitPlayerMove({
      ...game,
      board,
      current: winner ? "blue" : "red",
      selected: null,
      legal: [],
      winner,
      busy: !winner,
    });
  };

  return (
    <main className="morabaraba-page">
      <Link
        href="/#projects"
        className="portfolio-back inline-flex min-h-10 items-center gap-2 rounded-lg border border-transparent bg-transparent px-3 text-sm text-muted transition hover:border-accent/50 hover:bg-accent/10 hover:text-accent"
      >
        <ArrowLeft size={18} />
        Portfolio
      </Link>

      <div className="inner">
        <div className="heading">
          <div className="tag">Web Game</div>
          <div className="title">
            Mini <span>Morabaraba</span>
          </div>
          <div id="phase-tag" className="phase-tag">
            {game.phase === "placing" ? "Placing Phase" : "Moving Phase"}
          </div>
        </div>

        <div className="diff-row">
          {(["easy", "normal", "hard"] as const).map((value) => (
            <button
              key={value}
              type="button"
              className={cn("diff-btn", difficulty === value && "active")}
              onClick={() => setDifficulty(value)}
            >
              {value.charAt(0).toUpperCase() + value.slice(1)}
            </button>
          ))}
        </div>

        <div id="status" className={cn("status", status.className)}>
          {status.text}
        </div>

        <div className="board-wrap">
          <svg id="board" className="board-svg" viewBox="0 0 420 420" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <filter id="cyan-glow">
                <feGaussianBlur stdDeviation="4" result="b" />
                <feMerge>
                  <feMergeNode in="b" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter id="piece-shadow">
                <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.5" />
              </filter>
            </defs>

            <rect width="420" height="420" fill="#0d1220" />

            <g stroke="rgba(0,229,255,0.06)" strokeWidth="0.5">
              <line x1="0" y1="140" x2="420" y2="140" />
              <line x1="0" y1="280" x2="420" y2="280" />
              <line x1="140" y1="0" x2="140" y2="420" />
              <line x1="280" y1="0" x2="280" y2="420" />
            </g>

            <g stroke="#00bcd4" strokeWidth="2" strokeLinecap="round" opacity="0.55">
              <line x1="70" y1="70" x2="210" y2="70" />
              <line x1="210" y1="70" x2="350" y2="70" />
              <line x1="70" y1="210" x2="210" y2="210" />
              <line x1="210" y1="210" x2="350" y2="210" />
              <line x1="70" y1="350" x2="210" y2="350" />
              <line x1="210" y1="350" x2="350" y2="350" />
              <line x1="70" y1="70" x2="70" y2="210" />
              <line x1="70" y1="210" x2="70" y2="350" />
              <line x1="210" y1="70" x2="210" y2="210" />
              <line x1="210" y1="210" x2="210" y2="350" />
              <line x1="350" y1="70" x2="350" y2="210" />
              <line x1="350" y1="210" x2="350" y2="350" />
              <line x1="70" y1="70" x2="210" y2="210" />
              <line x1="210" y1="210" x2="350" y2="350" />
              <line x1="350" y1="70" x2="210" y2="210" />
              <line x1="210" y1="210" x2="70" y2="350" />
            </g>

            <g id="pts">
              {POS.map((pos) => {
                const { x, y } = XY[pos];
                const piece = game.board[pos];
                const isSelected = game.selected === pos;
                const isLegal = game.legal.includes(pos);
                const isWinningPoint = winningPositions.has(pos);

                return (
                  <g
                    key={pos}
                    className="point"
                    style={{ cursor: game.winner || game.busy || game.current !== "blue" ? "default" : "pointer" }}
                    onClick={() => handlePointClick(pos)}
                  >
                    {isLegal && (
                      <circle
                        cx={x}
                        cy={y}
                        r="23"
                        fill="rgba(0,229,255,0.08)"
                        stroke="#00e5ff"
                        strokeWidth="1.5"
                        className="pulse-r"
                      />
                    )}

                    {!piece && (
                      <>
                        <circle
                          cx={x}
                          cy={y}
                          r={isLegal ? 13 : 11}
                          fill={isLegal ? "rgba(0,229,255,0.1)" : "rgba(255,255,255,0.04)"}
                          stroke={isLegal ? "#00e5ff" : "#1e293b"}
                          strokeWidth={isLegal ? 1.5 : 1}
                        />
                        <text
                          x={x}
                          y={y + 4}
                          textAnchor="middle"
                          fill={isLegal ? "#00e5ff" : "#334155"}
                          fontSize="10"
                          fontFamily="monospace"
                        >
                          {pos}
                        </text>
                      </>
                    )}

                    {piece === "blue" && (
                      <>
                        {isSelected && (
                          <rect
                            x={x - 24}
                            y={y - 24}
                            width="48"
                            height="48"
                            rx="6"
                            fill="none"
                            stroke="#00e5ff"
                            strokeWidth="2"
                            opacity="0.5"
                            className="pulse-r"
                          />
                        )}
                        <rect
                          x={x - 14}
                          y={y - 14}
                          width="28"
                          height="28"
                          rx="3"
                          fill={isWinningPoint ? "#00bcd4" : isSelected ? "#0284c7" : "#0369a1"}
                          stroke={isWinningPoint ? "#00e5ff" : isSelected ? "#38bdf8" : "#0ea5e9"}
                          strokeWidth={isWinningPoint ? 3 : 1.5}
                          filter={isWinningPoint ? "url(#cyan-glow)" : "url(#piece-shadow)"}
                          className={isWinningPoint ? "win-p" : undefined}
                        />
                        <text
                          x={x}
                          y={y + 4}
                          textAnchor="middle"
                          fill="#e2e8f0"
                          fontSize="10"
                          fontWeight="bold"
                          fontFamily="monospace"
                        >
                          {pos}
                        </text>
                      </>
                    )}

                    {piece === "red" && (
                      <>
                        <polygon
                          points={`${x},${y - 17} ${x - 15},${y + 11} ${x + 15},${y + 11}`}
                          fill={isWinningPoint ? "#ff4444" : "#be123c"}
                          stroke={isWinningPoint ? "#ff8888" : "#f43f5e"}
                          strokeWidth={isWinningPoint ? 3 : 1.5}
                          filter={isWinningPoint ? "url(#cyan-glow)" : "url(#piece-shadow)"}
                          className={isWinningPoint ? "win-p" : undefined}
                        />
                        <text
                          x={x}
                          y={y + 8}
                          textAnchor="middle"
                          fill="#fca5a5"
                          fontSize="10"
                          fontWeight="bold"
                          fontFamily="monospace"
                        >
                          {pos}
                        </text>
                      </>
                    )}
                  </g>
                );
              })}
            </g>
          </svg>
        </div>

        <div className="score-row">
          <div className="score-card">
            <div className="score-lbl">You (Blue)</div>
            <div id="blue-tr" className="piece-row">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="blue-track-piece"
                  style={{
                    borderColor: index < game.bluePieces ? "#0ea5e9" : "#1e293b",
                    background: index < game.bluePieces ? "#0369a1" : "transparent",
                  }}
                />
              ))}
            </div>
          </div>

          <div className="versus">VS</div>

          <div className="score-card">
            <div className="score-lbl">Red CPU</div>
            <div id="red-tr" className="piece-row">
              {Array.from({ length: 3 }).map((_, index) => (
                <svg key={index} width="16" height="14" viewBox="0 0 16 14" aria-hidden="true">
                  <polygon
                    points="8,1 1,13 15,13"
                    fill={index < game.redPieces ? "#be123c" : "transparent"}
                    stroke={index < game.redPieces ? "#f43f5e" : "#1e293b"}
                    strokeWidth="1.5"
                  />
                </svg>
              ))}
            </div>
          </div>
        </div>

        <div className="btn-row">
          <button type="button" className="action-btn" onClick={restart}>
            Restart
          </button>
          <button type="button" className="action-btn" onClick={() => setShowRules((current) => !current)}>
            How to Play
          </button>
        </div>

        {showRules && (
          <div id="rules" className="rules">
            <strong>How to Play</strong>
            <div className="rules-grid">
              <div>
                <b>Phase 1 - Placing</b>
                Take turns placing pieces on empty points. You are Blue (squares), CPU is Red (triangles).
                Each player places 3 pieces.
              </div>
              <div>
                <b>Phase 2 - Moving</b>
                Click one of your pieces, then click a highlighted connected empty spot to move it one step.
              </div>
              <div>
                <b>Winning</b>
                Get all 3 of your pieces in any straight winning line to win instantly.
              </div>
              <div>
                <b>Winning Lines</b>
                <span>A-B-C / D-E-F / G-H-I A-D-G / B-E-H / C-F-I A-E-I / C-E-G</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        .morabaraba-page,
        .morabaraba-page * {
          box-sizing: border-box;
        }

        .morabaraba-page {
          --game-bg: #0a0e1a;
          --game-bg2: #0d1220;
          --game-bg3: #111827;
          --game-cyan: #00e5ff;
          --game-cyan2: #00bcd4;
          --game-cyan-dim: rgba(0, 229, 255, 0.12);
          --game-cyan-border: rgba(0, 229, 255, 0.25);
          --game-text: #e2e8f0;
          --game-muted: #64748b;
          --game-border: #1e293b;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background-color: var(--game-bg);
          background-image:
            linear-gradient(rgba(0, 229, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 229, 255, 0.03) 1px, transparent 1px);
          background-size: 40px 40px;
          color: var(--game-text);
          font-family: "Segoe UI", system-ui, sans-serif;
          position: relative;
        }

        .morabaraba-page .portfolio-back {
          position: absolute;
          left: clamp(14px, calc((100vw - 1152px) / 2), 999px);
          top: 25px;
          z-index: 2;
          text-decoration: none;
          font-family: "Satoshi", system-ui, sans-serif;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }

        .morabaraba-page .portfolio-back:hover {
          background: rgba(0, 229, 255, 0.08);
        }

        .morabaraba-page .inner {
          width: 100%;
          max-width: 460px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .morabaraba-page .heading {
          text-align: center;
          padding-top: 2px;
        }

        .morabaraba-page .tag {
          display: inline-block;
          margin-bottom: 6px;
          padding: 2px 12px;
          border: 1px solid var(--game-cyan-border);
          border-radius: 20px;
          color: var(--game-cyan2);
          font-family: monospace;
          font-size: 11px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .morabaraba-page .title {
          color: #fff;
          font-size: 28px;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-shadow: 0 0 30px rgba(0, 229, 255, 0.3);
        }

        .morabaraba-page .title span {
          color: var(--game-cyan);
        }

        .morabaraba-page .phase-tag {
          display: inline-block;
          margin-top: 6px;
          padding: 2px 12px;
          border: 1px solid var(--game-cyan-border);
          border-radius: 20px;
          background: var(--game-cyan-dim);
          color: var(--game-cyan2);
          font-family: monospace;
          font-size: 11px;
          letter-spacing: 0.1em;
        }

        .morabaraba-page .diff-row {
          display: flex;
          justify-content: center;
          gap: 8px;
        }

        .morabaraba-page .diff-btn {
          padding: 5px 18px;
          border: 1px solid var(--game-border);
          border-radius: 20px;
          background: transparent;
          color: var(--game-muted);
          cursor: pointer;
          font-family: monospace;
          font-size: 12px;
          letter-spacing: 0.05em;
          transition: all 0.15s;
        }

        .morabaraba-page .diff-btn:hover {
          border-color: var(--game-cyan-border);
          color: var(--game-cyan2);
        }

        .morabaraba-page .diff-btn.active {
          border-color: var(--game-cyan-border);
          background: var(--game-cyan-dim);
          color: var(--game-cyan);
        }

        .morabaraba-page .status {
          min-height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 9px 16px;
          border: 1px solid var(--game-border);
          border-radius: 8px;
          background: var(--game-bg3);
          color: var(--game-text);
          font-size: 13px;
          text-align: center;
          transition: all 0.2s;
        }

        .morabaraba-page .status.win-blue {
          border-color: rgba(0, 229, 255, 0.5);
          color: var(--game-cyan);
          font-weight: 600;
        }

        .morabaraba-page .status.win-red {
          border-color: rgba(255, 80, 80, 0.5);
          color: #ff6b6b;
          font-weight: 600;
        }

        .morabaraba-page .board-wrap {
          overflow: hidden;
          border: 1px solid var(--game-cyan-border);
          border-radius: 12px;
          background: var(--game-bg2);
          box-shadow:
            0 0 30px rgba(0, 229, 255, 0.07),
            inset 0 0 60px rgba(0, 229, 255, 0.02);
        }

        .morabaraba-page .board-svg {
          display: block;
          width: 100%;
          height: auto;
        }

        .morabaraba-page .score-row {
          display: flex;
          align-items: stretch;
          gap: 10px;
        }

        .morabaraba-page .score-card {
          flex: 1;
          padding: 10px 14px;
          border: 1px solid var(--game-border);
          border-radius: 8px;
          background: var(--game-bg3);
          text-align: center;
        }

        .morabaraba-page .score-lbl {
          color: var(--game-muted);
          font-family: monospace;
          font-size: 11px;
          letter-spacing: 0.05em;
        }

        .morabaraba-page .piece-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          margin-top: 5px;
        }

        .morabaraba-page .blue-track-piece {
          width: 14px;
          height: 14px;
          border: 1.5px solid var(--game-border);
          border-radius: 2px;
        }

        .morabaraba-page .versus {
          display: flex;
          align-items: center;
          color: var(--game-muted);
          font-family: monospace;
          font-size: 11px;
        }

        .morabaraba-page .btn-row {
          display: flex;
          gap: 10px;
        }

        .morabaraba-page .action-btn {
          flex: 1;
          padding: 10px;
          border: 1px solid var(--game-border);
          border-radius: 8px;
          background: var(--game-bg3);
          color: var(--game-text);
          cursor: pointer;
          font-family: monospace;
          font-size: 13px;
          letter-spacing: 0.04em;
          transition: all 0.15s;
        }

        .morabaraba-page .action-btn:hover {
          border-color: var(--game-cyan-border);
          color: var(--game-cyan);
        }

        .morabaraba-page .rules {
          padding: 16px;
          border: 1px solid var(--game-border);
          border-radius: 10px;
          background: var(--game-bg3);
          color: var(--game-muted);
          font-size: 12px;
          line-height: 1.65;
        }

        .morabaraba-page .rules strong {
          display: block;
          color: var(--game-text);
          font-size: 13px;
        }

        .morabaraba-page .rules b {
          display: block;
          margin-bottom: 4px;
          color: var(--game-cyan2);
        }

        .morabaraba-page .rules span {
          display: block;
          font-family: monospace;
          font-size: 11px;
          line-height: 1.9;
        }

        .morabaraba-page .rules-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-top: 10px;
        }

        @keyframes pulse-r {
          0%,
          100% {
            opacity: 0.35;
          }
          50% {
            opacity: 1;
          }
        }

        @keyframes win-glow {
          0%,
          100% {
            opacity: 0.6;
          }
          50% {
            opacity: 1;
          }
        }

        .morabaraba-page .pulse-r {
          animation: pulse-r 0.9s ease-in-out infinite;
        }

        .morabaraba-page .win-p {
          animation: win-glow 0.7s ease-in-out infinite;
        }

        @media (max-width: 520px) {
          .morabaraba-page {
            align-items: flex-start;
            padding: 84px 14px 14px;
          }

          .morabaraba-page .portfolio-back {
            left: 14px;
            top: 14px;
          }

          .morabaraba-page .rules-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </main>
  );
}
