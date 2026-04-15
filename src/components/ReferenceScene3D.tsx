"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, ContactShadows } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";

function GlassBuilding({
  position,
  size,
  color = "#0a3540",
  emissive = "#0a3540",
  windowColor = "#9ee6d8",
}: {
  position: [number, number, number];
  size: [number, number, number];
  color?: string;
  emissive?: string;
  windowColor?: string;
}) {
  // Procedural window grid texture
  const texture = useRef<THREE.CanvasTexture | null>(null);
  if (typeof window !== "undefined" && !texture.current) {
    const c = document.createElement("canvas");
    c.width = 256;
    c.height = 1024;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, c.width, c.height);
    // floors
    const floors = 24;
    const cols = 8;
    const fh = c.height / floors;
    const cw = c.width / cols;
    for (let f = 0; f < floors; f++) {
      for (let col = 0; col < cols; col++) {
        const lit = Math.random() > 0.55;
        ctx.fillStyle = lit ? windowColor : "#06373c";
        ctx.fillRect(col * cw + cw * 0.18, f * fh + fh * 0.18, cw * 0.64, fh * 0.6);
      }
      // floor slab
      ctx.fillStyle = "#13232d";
      ctx.fillRect(0, (f + 1) * fh - 2, c.width, 2);
    }
    const t = new THREE.CanvasTexture(c);
    t.wrapS = THREE.RepeatWrapping;
    t.wrapT = THREE.RepeatWrapping;
    t.anisotropy = 4;
    texture.current = t;
  }

  return (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial
        map={texture.current}
        color="#ffffff"
        metalness={0.7}
        roughness={0.18}
        emissive={emissive}
        emissiveIntensity={0.05}
      />
    </mesh>
  );
}

function Skybridge({
  from,
  to,
  height = 0.8,
  thickness = 0.6,
}: {
  from: [number, number, number];
  to: [number, number, number];
  height?: number;
  thickness?: number;
}) {
  const dx = to[0] - from[0];
  const dz = to[2] - from[2];
  const len = Math.hypot(dx, dz);
  const cx = (from[0] + to[0]) / 2;
  const cz = (from[2] + to[2]) / 2;
  const angleY = Math.atan2(dz, dx);
  return (
    <mesh position={[cx, from[1], cz]} rotation={[0, -angleY, 0]} castShadow>
      <boxGeometry args={[len, height, thickness]} />
      <meshPhysicalMaterial
        color="#bff0e3"
        metalness={0.4}
        roughness={0.05}
        transmission={0.6}
        thickness={0.8}
        clearcoat={1}
      />
    </mesh>
  );
}

function Scene() {
  const group = useRef<THREE.Group>(null!);
  useFrame((state) => {
    // very slow drift to feel alive without distracting
    if (group.current) {
      group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.08) * 0.18;
    }
  });

  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight
        position={[6, 12, 4]}
        intensity={1.4}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-12}
        shadow-camera-right={12}
        shadow-camera-top={12}
        shadow-camera-bottom={-12}
      />
      <Environment preset="city" />

      <group ref={group}>
        {/* Left mid-rise office */}
        <GlassBuilding position={[-3.4, 2.6, 0.3]} size={[2.2, 5.2, 2.2]} />

        {/* Center high-rise tower */}
        <GlassBuilding position={[0, 4.4, 0]} size={[2.6, 8.8, 2.6]} />

        {/* Right wide office */}
        <GlassBuilding position={[3.6, 2.0, 0.4]} size={[3.0, 4.0, 2.4]} />

        {/* Skybridge: from center tower (right side, mid-height) to right office (left side, top floor) */}
        <Skybridge from={[1.3, 3.4, 0.4]} to={[2.1, 3.4, 0.4]} height={0.7} thickness={1.0} />

        {/* Antenna mast on top of center */}
        <mesh position={[0, 9.2, 0]} castShadow>
          <cylinderGeometry args={[0.05, 0.05, 1.4, 8]} />
          <meshStandardMaterial color="#13232d" metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh position={[0, 10.0, 0]}>
          <sphereGeometry args={[0.12, 12, 12]} />
          <meshStandardMaterial color="#31cfb3" emissive="#31cfb3" emissiveIntensity={0.6} />
        </mesh>

        {/* Plaza ground */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
          <planeGeometry args={[40, 40]} />
          <meshStandardMaterial color="#e6e6e6" roughness={0.85} metalness={0.1} />
        </mesh>
      </group>

      <ContactShadows
        position={[0, 0.01, 0]}
        opacity={0.45}
        scale={20}
        blur={2.4}
        far={10}
        resolution={512}
      />
    </>
  );
}

export default function ReferenceScene3D() {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [-1.4, 1.6, 9.5], fov: 38 }}
      gl={{ antialias: true, preserveDrawingBuffer: false }}
      style={{ background: "linear-gradient(to bottom, #f5f5f5 0%, #e6e6e6 60%, #d8d8d8 100%)" }}
    >
      <Scene />
    </Canvas>
  );
}
