"use client";

import React, { useRef, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { Float, Sphere, MeshDistortMaterial, PerspectiveCamera } from "@react-three/drei";

const PARTICLES_COUNT = 5000;

const Particles = () => {
  const points = useRef<THREE.Points>(null!);
  
  const particlesPosition = useMemo(() => {
    const positions = new Float32Array(PARTICLES_COUNT * 3);
    for (let j = 0; j < PARTICLES_COUNT; j++) {
      // eslint-disable-next-line react-hooks/purity
      positions[j * 3] = (Math.random() - 0.5) * 15;
      // eslint-disable-next-line react-hooks/purity
      positions[j * 3 + 1] = (Math.random() - 0.5) * 15;
      // eslint-disable-next-line react-hooks/purity
      positions[j * 3 + 2] = (Math.random() - 0.5) * 15;
    }
    return positions;
  }, []);

  useFrame((state) => {
    const { clock, mouse } = state;
    if (points.current) {
      points.current.rotation.y = clock.getElapsedTime() * 0.05;
      points.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.1) * 0.1;
      
      // Subtle mouse follow
      points.current.position.x = THREE.MathUtils.lerp(points.current.position.x, mouse.x * 0.5, 0.03);
      points.current.position.y = THREE.MathUtils.lerp(points.current.position.y, mouse.y * 0.5, 0.03);
    }
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particlesPosition.length / 3}
          args={[particlesPosition, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.015}
        color="#6366f1"
        transparent
        opacity={0.6}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

const Nebula = () => {
  const mesh = useRef<THREE.Mesh>(null!);
  
  // Custom shader for nebula effect
  const shaderArgs = useMemo(() => ({
    uniforms: {
      uTime: { value: 0 },
      uColor1: { value: new THREE.Color("#1e1b4b") },
      uColor2: { value: new THREE.Color("#4338ca") },
      uColor3: { value: new THREE.Color("#000000") },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform vec3 uColor1;
      uniform vec3 uColor2;
      uniform vec3 uColor3;
      varying vec2 vUv;

      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
      }

      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        float a = hash(i);
        float b = hash(i + vec2(1.0, 0.0));
        float c = hash(i + vec2(0.0, 1.0));
        float d = hash(i + vec2(1.0, 1.0));
        return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
      }

      float fbm(vec2 p) {
        float v = 0.0;
        float a = 0.5;
        vec2 shift = vec2(100.0);
        for (int i = 0; i < 5; ++i) {
          v += a * noise(p);
          p = p * 2.0 + shift;
          a *= 0.5;
        }
        return v;
      }

      void main() {
        vec2 uv = vUv * 3.0;
        float n = fbm(uv + uTime * 0.1);
        float n2 = fbm(uv - uTime * 0.05 + n);
        
        vec3 color = mix(uColor1, uColor2, n2);
        color = mix(color, uColor3, n * 0.5);
        
        // Add some glowing "stars" in the nebula
        float stars = pow(fbm(uv * 10.0), 10.0) * 2.0;
        color += stars * uColor2;

        gl_FragColor = vec4(color, 1.0);
      }
    `
  }), []);

  useFrame((state) => {
    if (mesh.current) {
      (mesh.current.material as THREE.ShaderMaterial).uniforms.uTime.value = state.clock.getElapsedTime();
    }
  });

  return (
    <mesh ref={mesh} scale={[20, 20, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        args={[shaderArgs]}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
};

const FloatingShapes = () => {
  return (
    <>
      <Float speed={2} rotationIntensity={1} floatIntensity={2}>
        <Sphere args={[1, 64, 64]} position={[-3, 2, -5]}>
          <MeshDistortMaterial
            color="#4338ca"
            speed={3}
            distort={0.4}
            radius={1}
            transparent
            opacity={0.4}
            roughness={0.1}
            metalness={0.8}
          />
        </Sphere>
      </Float>
      
      <Float speed={1.5} rotationIntensity={2} floatIntensity={1.5}>
        <mesh position={[4, -2, -3]} rotation={[Math.PI / 4, 0, 0]}>
          <torusGeometry args={[1.5, 0.4, 32, 100]} />
          <meshPhysicalMaterial
            color="#6366f1"
            transmission={0.8}
            thickness={0.5}
            roughness={0}
            metalness={0.2}
            transparent
            opacity={0.3}
          />
        </mesh>
      </Float>

      <Float speed={3} rotationIntensity={0.5} floatIntensity={1}>
        <Sphere args={[0.5, 32, 32]} position={[2, 3, -4]}>
          <meshStandardMaterial color="#818cf8" emissive="#4338ca" emissiveIntensity={2} />
        </Sphere>
      </Float>
    </>
  );
};

export const Scene = () => {
  const { mouse } = useThree();
  const cameraRef = useRef<THREE.PerspectiveCamera>(null!);

  useFrame(() => {
    if (cameraRef.current) {
      cameraRef.current.position.x = THREE.MathUtils.lerp(cameraRef.current.position.x, mouse.x * 0.5, 0.05);
      cameraRef.current.position.y = THREE.MathUtils.lerp(cameraRef.current.position.y, mouse.y * 0.5, 0.05);
      cameraRef.current.lookAt(0, 0, 0);
    }
  });

  return (
    <>
      <PerspectiveCamera makeDefault ref={cameraRef} position={[0, 0, 8]} fov={75} />
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#6366f1" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#4338ca" />
      
      {/* Mouse Glow */}
      <pointLight 
        position={[mouse.x * 10, mouse.y * 10, 2]} 
        intensity={2} 
        color="#818cf8" 
        distance={20}
      />
      
      <Particles />
      <FloatingShapes />
      
      <fog attach="fog" args={["#000", 5, 15]} />
    </>
  );
};
