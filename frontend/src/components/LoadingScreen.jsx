import React from "react";
import { motion, AnimatePresence } from "framer-motion";

const LoadingScreen = ({ isLoading }) => {
  return (
    <AnimatePresence mode="wait">
      {isLoading && (
        <motion.div
          initial = {{ opacity: 1 }}
          exit = {{ opacity: 0 }}
          transition = {{ duration: 1.2, ease: "easeOut" }}
          style = {{ 
            position: "fixed", inset: 0,
            background: "#000",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 9999, overflow: "hidden",
          }}
        >
          <motion.div
            initial = {{ 
              scale: 0, opacity: 0, rotate: -720
            }}

            animate = {{ 
              scale: 1, opacity: 1, rotate: 0 
            }}

            exit = {{ 
              scale: 2, opacity: 0, rotate: 360, filter: "blur(16px)"
            }}

            transition = {{
              duration: 1.8, ease: [0.22, 1, 0.36, 1], rotate: { duration: 1.8, ease: "easeOut" }
            }}

            style = {{ position: "relative", }}
          >
            <img
              src="/images/logoMain.png"
              alt="Logo"
              style= {{ height: "160px", filter: "drop-shadow(0 0 60px rgba(255, 215, 0, 0.9))", }}
            />

            <motion.div
              initial = {{ scale: 0.5, opacity: 1 }}
              animate = {{ scale: 3, opacity: 0 }}
              transition = {{ duration: 1.2, ease: "easeOut" }}
              style = {{
                position: "absolute",
                inset: -50,
                background: "radial-gradient(circle, rgba(255, 215, 0, 0.6) 0%, transparent 60%)",
                borderRadius: "50%",
              }}
            />
          </motion.div>

          <motion.div
            animate = {{ scale: [1, 1.4, 1], opacity: [0.3, 0.6, 0.3], }}

            transition = {{ duration: 2.4, repeat: Infinity, ease: "easeInOut", }}

            style = {{
              position: "absolute",
              width: "420px", height: "420px",
              border: "2px solid rgba(255, 215, 0, 0.4)", borderRadius: "50%",
              boxShadow: "0 0 60px rgba(255, 215, 0, 0.3)",
            }}
          />

          {[...Array(6)].map((_, i) => (
            <motion.div
              key = {i}

              initial = {{ opacity: 0, scale: 0 }}

              animate = {{
                opacity: [0, 1, 0], scale: [0, 1.5, 2],
                x: Math.cos(i * 60 * Math.PI / 180) * 200,
                y: Math.sin(i * 60 * Math.PI / 180) * 200,
              }}

              transition = {{ duration: 1.8, delay: 0.6 + i * 0.1, ease: "easeOut", }}

              style={{
                position: "absolute",
                width: 6, height: 6,
                background: "#ffd700",
                borderRadius: "50%",
                boxShadow: "0 0 20px #ffd700",
              }}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingScreen;