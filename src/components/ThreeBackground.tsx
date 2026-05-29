import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

function Fireflies({ count = 100, color = "#bef264", size = 0.15, speed = 0.03, radius = 25, parallaxMultiplier = 0.005 }) {
  const ref = useRef<THREE.Points>(null);
  
  const [positions, phases] = useMemo(() => {
    const p = new Float32Array(count * 3);
    const ph = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      p[i * 3] = (Math.random() - 0.5) * radius * 2; // x
      p[i * 3 + 1] = (Math.random() - 0.5) * radius * 2; // y
      p[i * 3 + 2] = (Math.random() - 0.5) * 15 - 5; // z
      ph[i] = Math.random() * Math.PI * 2;
    }
    return [p, ph];
  }, [count, radius]);

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * speed;
      ref.current.rotation.x -= delta * (speed / 3);
      
      const scrollY = window.scrollY;
      const targetY = scrollY * parallaxMultiplier;
      
      ref.current.position.y = THREE.MathUtils.lerp(
        ref.current.position.y,
        Math.sin(state.clock.elapsedTime * speed * 10) * 0.3 + targetY,
        delta * 5
      );
    }
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color={color}
        size={size}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        opacity={0.8}
      />
    </Points>
  );
}

export default function ThreeBackground() {
  return (
    <div className="fixed inset-0 z-[5] pointer-events-none" style={{ height: '100vh', width: '100vw' }}>
      <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
        <Fireflies count={150} color="#bef264" size={0.08} speed={0.02} radius={25} parallaxMultiplier={0.003} />
        <Fireflies count={50} color="#d9f99d" size={0.15} speed={0.05} radius={15} parallaxMultiplier={0.006} />
        <Fireflies count={20} color="#a3e635" size={0.25} speed={0.01} radius={10} parallaxMultiplier={0.012} />
      </Canvas>
    </div>
  );
}
