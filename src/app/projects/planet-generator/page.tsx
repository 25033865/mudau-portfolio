"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, X } from "lucide-react";
import * as THREE from "three";

type Planet = {
  name: string;
  type: string;
  distance: string;
  diameter: string;
  dayLength: string;
  description: string;
  color: string;
  emissive: string;
  size: number;
  position: [number, number, number];
  speed: number;
  hasRing?: boolean;
};

const sunPosition: [number, number, number] = [-5.3, 0, 0];

const planets: Planet[] = [
  {
    name: "Mercury",
    type: "Rocky Planet",
    distance: "57.9 million km",
    diameter: "4,879 km",
    dayLength: "58.6 Earth days",
    description: "The smallest planet and closest to the Sun.",
    color: "#9ca3af",
    emissive: "#374151",
    size: 0.35,
    position: [-4, 0, 0],
    speed: 0.008,
  },
  {
    name: "Venus",
    type: "Rocky Planet",
    distance: "108.2 million km",
    diameter: "12,104 km",
    dayLength: "243 Earth days",
    description: "A hot planet covered by thick toxic clouds.",
    color: "#f59e0b",
    emissive: "#78350f",
    size: 0.55,
    position: [-2.8, 0.2, 1.2],
    speed: 0.006,
  },
  {
    name: "Earth",
    type: "Ocean Planet",
    distance: "149.6 million km",
    diameter: "12,742 km",
    dayLength: "24 hours",
    description: "Our home planet, filled with oceans and life.",
    color: "#0ea5e9",
    emissive: "#075985",
    size: 0.6,
    position: [-1.3, -0.1, -1],
    speed: 0.01,
  },
  {
    name: "Mars",
    type: "Desert Planet",
    distance: "227.9 million km",
    diameter: "6,779 km",
    dayLength: "24.6 hours",
    description: "The red planet with dusty landscapes and giant volcanoes.",
    color: "#ef4444",
    emissive: "#7f1d1d",
    size: 0.45,
    position: [0.2, 0.1, 1.4],
    speed: 0.009,
  },
  {
    name: "Jupiter",
    type: "Gas Giant",
    distance: "778.5 million km",
    diameter: "139,820 km",
    dayLength: "9.9 hours",
    description: "The largest planet, famous for its massive storms.",
    color: "#d97706",
    emissive: "#451a03",
    size: 1.2,
    position: [2.2, 0, -0.8],
    speed: 0.004,
  },
  {
    name: "Saturn",
    type: "Gas Giant",
    distance: "1.43 billion km",
    diameter: "116,460 km",
    dayLength: "10.7 hours",
    description: "Known for its beautiful icy ring system.",
    color: "#facc15",
    emissive: "#713f12",
    size: 1.05,
    position: [4.4, 0.1, 1],
    speed: 0.0045,
    hasRing: true,
  },
  {
    name: "Uranus",
    type: "Ice Giant",
    distance: "2.87 billion km",
    diameter: "50,724 km",
    dayLength: "17.2 hours",
    description: "A pale blue ice giant that rotates on its side.",
    color: "#67e8f9",
    emissive: "#164e63",
    size: 0.8,
    position: [6.5, -0.1, -1.1],
    speed: 0.003,
  },
  {
    name: "Neptune",
    type: "Ice Giant",
    distance: "4.5 billion km",
    diameter: "49,244 km",
    dayLength: "16.1 hours",
    description: "A deep blue planet with powerful winds.",
    color: "#2563eb",
    emissive: "#1e3a8a",
    size: 0.78,
    position: [8.4, 0.2, 0.8],
    speed: 0.0035,
  },
];

function PlanetMesh({
  planet,
  selected,
  onSelect,
  onHover,
}: {
  planet: Planet;
  selected: boolean;
  onSelect: (planet: Planet) => void;
  onHover: (planet: Planet | null) => void;
}) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (!ref.current) return;
    ref.current.rotation.y += planet.speed;
    ref.current.rotation.x += planet.speed * 0.25;
  });

  return (
    <group position={planet.position}>
      <mesh
        ref={ref}
        onPointerOver={(event) => {
          event.stopPropagation();
          document.body.style.cursor = "pointer";
          onHover(planet);
        }}
        onPointerOut={() => {
          document.body.style.cursor = "";
          onHover(null);
        }}
        onClick={(event) => {
          event.stopPropagation();
          onSelect(planet);
        }}
      >
        <sphereGeometry args={[planet.size, 48, 48]} />
        <meshStandardMaterial
          color={planet.color}
          emissive={planet.emissive}
          emissiveIntensity={selected ? 0.8 : 0.25}
          roughness={0.55}
          metalness={0.15}
        />
      </mesh>

      {(selected || planet.hasRing) && (
        <mesh rotation={[Math.PI / 2.4, 0, 0]}>
          <torusGeometry
            args={[
              planet.hasRing ? planet.size * 1.45 : planet.size * 1.25,
              planet.hasRing ? 0.035 : 0.015,
              16,
              120,
            ]}
          />
          <meshBasicMaterial
            color={selected ? "#22d3ee" : "#f8fafc"}
            transparent
            opacity={selected ? 0.75 : 0.35}
          />
        </mesh>
      )}

      {selected && (
        <mesh>
          <sphereGeometry args={[planet.size * 1.18, 32, 32]} />
          <meshBasicMaterial color="#22d3ee" transparent opacity={0.12} side={THREE.BackSide} />
        </mesh>
      )}
    </group>
  );
}

function OrbitRing({ radius }: { radius: number }) {
  return (
    <mesh position={sunPosition} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[radius, 0.006, 8, 160]} />
      <meshBasicMaterial color="#38bdf8" transparent opacity={0.18} />
    </mesh>
  );
}

function SpaceScene({
  selected,
  setSelected,
  setHovered,
}: {
  selected: Planet | null;
  setSelected: (planet: Planet) => void;
  setHovered: (planet: Planet | null) => void;
}) {
  return (
    <>
      <ambientLight intensity={0.45} />
      <pointLight position={sunPosition} intensity={4} color="#facc15" />
      <pointLight position={[6, 5, 5]} intensity={1.2} color="#22d3ee" />

      <Stars radius={80} depth={45} count={3000} factor={4} fade speed={1} />

      <mesh position={sunPosition}>
        <sphereGeometry args={[0.75, 48, 48]} />
        <meshBasicMaterial color="#facc15" />
      </mesh>

      {[1.4, 2.8, 4.1, 5.7, 7.6, 9.8, 11.9, 13.8].map((radius) => (
        <OrbitRing key={radius} radius={radius} />
      ))}

      {planets.map((planet) => (
        <PlanetMesh
          key={planet.name}
          planet={planet}
          selected={selected?.name === planet.name}
          onSelect={setSelected}
          onHover={setHovered}
        />
      ))}

      <OrbitControls
        enableDamping
        dampingFactor={0.08}
        target={[1.5, 0, 0]}
        rotateSpeed={0.65}
        zoomSpeed={0.8}
        minDistance={4}
        maxDistance={18}
      />
    </>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.06] p-3">
      <p className="mb-1 font-mono text-[9px] uppercase tracking-[0.22em] text-white/35">
        {label}
      </p>
      <p className="text-sm font-bold text-white/85">{value}</p>
    </div>
  );
}

export default function PlanetViewer3D() {
  const [selected, setSelected] = useState<Planet | null>(planets[2]);
  const [hovered, setHovered] = useState<Planet | null>(null);
  const activePlanet = hovered ?? selected;

  useEffect(() => {
    document.title = "3D Planet Explorer";

    return () => {
      document.body.style.cursor = "";
    };
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#020617] text-white">
      <div className="absolute inset-0 z-0 h-screen w-screen">
        <Canvas
          className="!h-full !w-full"
          style={{ height: "100vh", width: "100vw" }}
          camera={{ position: [2.5, 4, 10], fov: 55 }}
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}
          onCreated={({ gl }) => gl.setClearColor("#020617", 1)}
        >
          <SpaceScene selected={selected} setSelected={setSelected} setHovered={setHovered} />
        </Canvas>
      </div>

      <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(circle_at_top_left,rgba(124,58,237,0.22),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(34,211,238,0.16),transparent_35%)]" />

      <header className="pointer-events-none absolute left-0 right-0 top-0 z-30 flex flex-wrap items-start justify-between gap-3 p-4 sm:p-5">
        <Link
          href="/#projects"
          className="pointer-events-auto inline-flex min-h-10 items-center gap-2 rounded-lg border border-transparent bg-transparent px-3 text-sm text-white/70 transition hover:border-cyan-300/50 hover:bg-black/25 hover:text-cyan-200 hover:backdrop-blur-xl focus-visible:border-cyan-300/50 focus-visible:bg-black/25 focus-visible:text-cyan-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/30 focus-visible:backdrop-blur-xl"
        >
          <ArrowLeft size={16} />
          Portfolio
        </Link>

        <div className="pointer-events-none max-w-md rounded-lg border border-white/10 bg-white/[0.06] p-4 backdrop-blur-xl sm:p-5">
          <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.3em] text-cyan-300">
            Interactive Space Viewer
          </p>
          <h1 className="text-2xl font-black leading-tight sm:text-3xl">
            3D Planet{" "}
            <span className="bg-gradient-to-r from-cyan-300 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Explorer
            </span>
          </h1>
        </div>
      </header>

      <AnimatePresence>
        {activePlanet && (
          <motion.aside
            key={activePlanet.name}
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.96 }}
            transition={{ duration: 0.35 }}
            className="absolute bottom-4 left-4 right-4 z-30 max-h-[48vh] overflow-auto rounded-lg border border-white/10 bg-black/45 p-4 shadow-[0_0_40px_rgba(34,211,238,0.18)] backdrop-blur-2xl sm:bottom-5 sm:left-auto sm:right-5 sm:max-h-[calc(100vh-2.5rem)] sm:w-[calc(100%-40px)] sm:max-w-sm sm:p-5"
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-cyan-300">
                  {hovered ? "Hovering" : "Selected"}
                </p>
                <h2 className="mt-1 text-3xl font-black">{activePlanet.name}</h2>
              </div>

              {selected && (
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="rounded-full border border-white/10 bg-white/10 p-2 text-white/70 transition hover:bg-white/20"
                  aria-label="Close planet details"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <p className="mb-4 rounded-lg border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm leading-6 text-cyan-50/80">
              {activePlanet.description}
            </p>

            <div className="grid grid-cols-2 gap-3">
              <Info label="Type" value={activePlanet.type} />
              <Info label="Distance" value={activePlanet.distance} />
              <Info label="Diameter" value={activePlanet.diameter} />
              <Info label="Day Length" value={activePlanet.dayLength} />
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

    </main>
  );
}
