"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";

/** Esfera de puntos tipo "red neuronal" con parallax de mouse. */
function NeuralSphere() {
  const group = useRef<THREE.Group>(null);
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  const { positions, colors } = useMemo(() => {
    const count = 1700;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const cyan = new THREE.Color("#22d3ee");
    const violet = new THREE.Color("#8b5cf6");
    const white = new THREE.Color("#dbe4ff");
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));

    for (let i = 0; i < count; i++) {
      const y = 1 - (i / (count - 1)) * 2;
      const radiusAtY = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = goldenAngle * i;
      const r = 2.25 * (1 + (Math.random() - 0.5) * 0.07);

      positions[i * 3] = Math.cos(theta) * radiusAtY * r;
      positions[i * 3 + 1] = y * r;
      positions[i * 3 + 2] = Math.sin(theta) * radiusAtY * r;

      let c: THREE.Color;
      if (Math.random() < 0.1) {
        c = white;
      } else {
        c =
          y > 0
            ? violet.clone().lerp(cyan, Math.random() * 0.65)
            : cyan.clone().lerp(violet, Math.random() * 0.55);
      }
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    return { positions, colors };
  }, []);

  useFrame((_, delta) => {
    if (!group.current) return;
    group.current.rotation.y += delta * 0.075;
    group.current.rotation.x = THREE.MathUtils.lerp(
      group.current.rotation.x,
      mouse.current.y * 0.28,
      0.045,
    );
    group.current.rotation.z = THREE.MathUtils.lerp(
      group.current.rotation.z,
      mouse.current.x * 0.14,
      0.045,
    );
  });

  return (
    <group ref={group}>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.021}
          vertexColors
          transparent
          opacity={0.9}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
      {/* Malla wireframe sutil */}
      <mesh scale={1.015}>
        <icosahedronGeometry args={[2.25, 1]} />
        <meshBasicMaterial wireframe color="#4c5fae" transparent opacity={0.08} />
      </mesh>
      {/* Núcleo interior */}
      <points>
        <icosahedronGeometry args={[1.15, 2]} />
        <pointsMaterial size={0.035} color="#7dd3fc" transparent opacity={0.5} sizeAttenuation depthWrite={false} blending={THREE.AdditiveBlending} />
      </points>
    </group>
  );
}

export default function ParticleField() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);

  // Pausar el render loop cuando el hero sale del viewport (ahorro de GPU)
  useEffect(() => {
    const el = wrapRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      threshold: 0.02,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={wrapRef} className="pointer-events-none absolute inset-0" aria-hidden>
      <Canvas
        frameloop={visible ? "always" : "never"}
        camera={{ position: [0, 0, 5.6], fov: 45 }}
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <Float speed={1.1} rotationIntensity={0.12} floatIntensity={0.45}>
          <NeuralSphere />
        </Float>
      </Canvas>
    </div>
  );
}
