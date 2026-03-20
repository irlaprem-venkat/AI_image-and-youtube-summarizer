"use client";

import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Scene } from "./Three/Scene";
import { motion, AnimatePresence } from "framer-motion";

export const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 pointer-events-none -z-[1] overflow-hidden bg-background">
      {/* 3D Scene */}
      <Canvas
        camera={{ position: [0, 0, 8], fov: 75 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>

      {/* Overlays for depth and readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-80" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(10,10,20,0)_0%,rgba(0,0,0,0.4)_100%)]" />
      
      {/* Cinematic Vignette */}
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_150px_rgba(0,0,0,0.8)]" />

      {/* Initial Entry Animation */}
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2 }}
          className="absolute inset-0 pointer-events-none"
        />
      </AnimatePresence>
    </div>
  );
};
