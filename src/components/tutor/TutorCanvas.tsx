import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';
import { useTeaching } from '../../state/teachingStore';
import type { TutorState } from '../../state/teachingStore';

interface TutorMeshProps {
  tutorState: TutorState;
  isPlaying: boolean;
  gaze?: string;
  gesture?: string;
}

const HologramAvatar: React.FC<TutorMeshProps> = ({ tutorState, isPlaying, gaze, gesture }) => {
  const headRef = useRef<THREE.Group>(null);
  const jawRef = useRef<THREE.Mesh>(null);
  const leftEyeRef = useRef<THREE.Mesh>(null);
  const rightEyeRef = useRef<THREE.Mesh>(null);
  const haloRingRef = useRef<THREE.Mesh>(null);

  // Viseme morph target simulation
  const mouthOpenRef = useRef<number>(0);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

    // Subtle breathing / head tilt with gaze tracking towards board
    if (headRef.current) {
      let targetRotY = 0;
      let targetRotX = 0;

      if (gaze === 'TOWARDS_BOARD' || gesture === 'POINT_LEFT') {
        targetRotY = -0.38 + Math.sin(time * 1.5) * 0.03; // Turn to blackboard
        targetRotX = -0.04;
      } else if (gaze === 'DOWN_REFLECTIVE') {
        targetRotX = 0.15; // Reflective gaze
      } else if (tutorState === 'speaking' || isPlaying) {
        targetRotY = Math.sin(time * 2.5) * 0.08;
        targetRotX = Math.sin(time * 3.2) * 0.04 - 0.05;
      } else if (tutorState === 'listening') {
        targetRotY = 0.18;
        targetRotX = 0.08;
      } else {
        targetRotY = Math.sin(time * 0.8) * 0.04;
        targetRotX = Math.cos(time * 1.0) * 0.02;
      }

      headRef.current.rotation.y = THREE.MathUtils.lerp(headRef.current.rotation.y, targetRotY, 0.1);
      headRef.current.rotation.x = THREE.MathUtils.lerp(headRef.current.rotation.x, targetRotX, 0.1);
    }

    // Smooth lip sync mouth opening / closing with lerp interpolation
    let targetMouthOpen = 0;
    if (tutorState === 'speaking' || (isPlaying && tutorState !== 'paused')) {
      targetMouthOpen = (Math.sin(time * 14) * 0.5 + 0.5) * (0.3 + Math.sin(time * 7) * 0.4);
    }
    mouthOpenRef.current = THREE.MathUtils.lerp(mouthOpenRef.current, targetMouthOpen, delta * 18);

    if (jawRef.current) {
      jawRef.current.scale.y = 0.8 + mouthOpenRef.current * 1.2;
      jawRef.current.position.y = -0.32 - mouthOpenRef.current * 0.06;
    }

    // Halo pulse
    if (haloRingRef.current) {
      haloRingRef.current.rotation.z += delta * 0.4;
      const pulse = Math.sin(time * 2) * 0.05 + 1;
      haloRingRef.current.scale.set(pulse, pulse, pulse);
    }
  });

  // Futuristic semi-transparent holographic material
  const holoMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color('#818cf8'),
        emissive: new THREE.Color('#312e81'),
        emissiveIntensity: 0.6,
        roughness: 0.2,
        metalness: 0.1,
        transparent: true,
        opacity: 0.68, // 50-70% opacity specification
        wireframe: false
      }),
    []
  );

  const glowAccentMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('#38bdf8'),
        emissive: new THREE.Color('#38bdf8'),
        emissiveIntensity: 1.5,
        transparent: true,
        opacity: 0.85
      }),
    []
  );

  return (
    <group position={[0, -0.2, 0]}>
      {/* Floating Holographic Tutor */}
      <Float
        speed={2.2}
        rotationIntensity={0.25}
        floatIntensity={0.4}
        floatingRange={[-0.08, 0.08]}
      >
        <group ref={headRef}>
          {/* Head Sphere */}
          <mesh material={holoMaterial} position={[0, 0.2, 0]}>
            <sphereGeometry args={[0.5, 32, 32]} />
          </mesh>

          {/* Futuristic Face Mask Visor */}
          <mesh material={glowAccentMaterial} position={[0, 0.22, 0.42]} scale={[0.65, 0.2, 0.15]}>
            <boxGeometry args={[1, 1, 1]} />
          </mesh>

          {/* Eyes */}
          <mesh ref={leftEyeRef} material={glowAccentMaterial} position={[-0.16, 0.25, 0.48]}>
            <sphereGeometry args={[0.04, 16, 16]} />
          </mesh>
          <mesh ref={rightEyeRef} material={glowAccentMaterial} position={[0.16, 0.25, 0.48]}>
            <sphereGeometry args={[0.04, 16, 16]} />
          </mesh>

          {/* Animated Mouth Mesh (Interpolated Viseme) */}
          <mesh ref={jawRef} material={glowAccentMaterial} position={[0, -0.32, 0.42]}>
            <boxGeometry args={[0.22, 0.04, 0.08]} />
          </mesh>

          {/* Holographic Halo Ring */}
          <mesh ref={haloRingRef} position={[0, 0.85, 0]} rotation={[Math.PI / 2.3, 0, 0]}>
            <torusGeometry args={[0.55, 0.015, 16, 64]} />
            <meshBasicMaterial color="#a5b4fc" transparent opacity={0.55} />
          </mesh>

          {/* Sleek Torso / Shoulders */}
          <mesh material={holoMaterial} position={[0, -0.75, -0.05]} scale={[1.1, 0.8, 0.5]}>
            <coneGeometry args={[0.7, 1.1, 32]} />
          </mesh>

          {/* Chest Core Indicator */}
          <mesh position={[0, -0.6, 0.22]}>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshBasicMaterial
              color={tutorState === 'speaking' ? '#10b981' : tutorState === 'listening' ? '#f59e0b' : '#6366f1'}
            />
          </mesh>
        </group>
      </Float>
    </group>
  );
};

export interface TutorCanvasProps {
  mood?: string;
  gaze?: string;
  gesture?: string;
  tutorState?: TutorState;
  isPlaying?: boolean;
}

export const TutorCanvas: React.FC<TutorCanvasProps> = ({
  mood,
  gaze,
  gesture,
  tutorState: propTutorState,
  isPlaying: propIsPlaying,
}) => {
  const teaching = useTeaching();
  const effectiveTutorState = propTutorState || (mood === 'explaining' ? 'speaking' : teaching.tutorState);
  const effectiveIsPlaying = propIsPlaying !== undefined ? propIsPlaying : teaching.isPlaying;

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', pointerEvents: 'none' }}>
      {/* 3D R3F Viewport */}
      <Canvas
        camera={{ position: [0, 0, 3.2], fov: 42 }}
        gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
        style={{ pointerEvents: 'none' }}
      >
        <ambientLight intensity={0.8} />
        <pointLight position={[3, 3, 3]} intensity={1.2} color="#818cf8" />
        <pointLight position={[-3, 2, -2]} intensity={0.9} color="#38bdf8" />
        <directionalLight position={[0, 4, 2]} intensity={1.5} color="#ffffff" />

        <HologramAvatar
          tutorState={effectiveTutorState}
          isPlaying={effectiveIsPlaying}
          gaze={gaze}
          gesture={gesture}
        />
      </Canvas>

      {/* Tutor Status Label Badge */}
      <div
        style={{
          position: 'absolute',
          bottom: '12px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 10px',
          borderRadius: '999px',
          background: 'rgba(7, 8, 12, 0.75)',
          backdropFilter: 'blur(8px)',
          border: '1px solid var(--border-subtle)',
          fontSize: '0.7rem',
          fontWeight: 600,
          color: '#ffffff',
          letterSpacing: '0.02em',
          pointerEvents: 'auto'
        }}
      >
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background:
              effectiveTutorState === 'speaking'
                ? '#10b981'
                : effectiveTutorState === 'listening'
                ? '#f59e0b'
                : effectiveTutorState === 'paused'
                ? '#ef4444'
                : '#6366f1',
            boxShadow: `0 0 8px ${
              effectiveTutorState === 'speaking'
                ? '#10b981'
                : effectiveTutorState === 'listening'
                ? '#f59e0b'
                : '#6366f1'
            }`
          }}
        />
        <span>
          {effectiveTutorState === 'speaking'
            ? 'Dr. Nova (Lecturing)'
            : effectiveTutorState === 'listening'
            ? 'Dr. Nova (Listening)'
            : effectiveTutorState === 'paused'
            ? 'Dr. Nova (Paused)'
            : 'Dr. Nova (3D AI Tutor)'}
        </span>
      </div>
    </div>
  );
};
