"use client";

import { cn } from "@/lib/utils";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

export interface Character {
  id?: string | number;
  emoji: string;
  name: string;
  description?: string;
  href?: string;
  online?: boolean;
  backgroundColor?: string;
  gradientFrom?: string;
  gradientTo?: string;
  gradientColors?: string;
  avatar?: string;
}

export interface MessageDockProps {
  characters?: Character[];
  onCharacterSelect?: (character: Character, index: number) => void;
  className?: string;
  position?: "bottom" | "top";
  theme?: "light" | "dark" | "auto";
  enableAnimations?: boolean;
}

const defaultCharacters: Character[] = [
  { emoji: "🏠", name: "Home", description: "Back to main chat", href: "/", online: true },
  { emoji: "💰", name: "Pricing", description: "Plans and prices", href: "/pricing", online: true, backgroundColor: "bg-amber-100", gradientColors: "#fde68a, #fef3c7" },
  { emoji: "📋", name: "Breakdown", description: "How it works", href: "/breakdown", online: true, backgroundColor: "bg-green-100", gradientColors: "#86efac, #dcfce7" },
  { emoji: "ℹ️", name: "More Info", description: "About BizOS", href: "/info", online: true, backgroundColor: "bg-blue-100", gradientColors: "#93c5fd, #dbeafe" },
  { emoji: "📧", name: "Contact", description: "Get in touch", href: "/contact", online: true, backgroundColor: "bg-purple-100", gradientColors: "#c4b5fd, #ede9fe" },
];

export function MessageDock({
  characters = defaultCharacters,
  onCharacterSelect,
  className,
  position = "bottom",
  theme = "light",
  enableAnimations = true,
}: MessageDockProps) {
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const dockRef = useRef<HTMLDivElement>(null);

  const positionClasses =
    position === "top"
      ? "fixed top-6 left-0 right-0 flex justify-center z-50"
      : "fixed bottom-6 left-0 right-0 flex justify-center z-50";

  const handleClick = (character: Character, index: number) => {
    onCharacterSelect?.(character, index);
    if (character.href) {
      navigate(character.href);
    }
  };

  const hoverAnimation = shouldReduceMotion
    ? { scale: 1.02 }
    : {
        scale: 1.08,
        y: -6,
        transition: { type: "spring", stiffness: 400, damping: 25 },
      };

  return (
    <motion.div
      ref={dockRef}
      className={cn(positionClasses, className)}
      initial={enableAnimations ? { opacity: 0, y: 20 } : {}}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <motion.div
        className={cn(
          "flex items-center gap-2 rounded-full px-4 py-2 shadow-lg border",
          theme === "dark" ? "bg-zinc-800 border-zinc-700" : "bg-white/95 border-zinc-200/80 backdrop-blur"
        )}
      >
        {characters.map((character, index) => (
          <motion.div
            key={character.name}
            className="relative"
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <motion.button
              className={cn(
                "relative w-11 h-11 rounded-full flex items-center justify-center text-xl cursor-pointer",
                character.backgroundColor || "bg-zinc-100",
                theme === "dark" && "bg-zinc-700"
              )}
              onClick={() => handleClick(character, index)}
              whileHover={enableAnimations ? hoverAnimation : undefined}
              whileTap={{ scale: 0.95 }}
              aria-label={character.description || character.name}
            >
              <span className="text-xl">{character.emoji}</span>
            </motion.button>
            {/* Tooltip on hover */}
            <AnimatePresence>
              {hoveredIndex === index && character.description && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  className={cn(
                    "absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap",
                    theme === "dark"
                      ? "bg-zinc-700 text-zinc-100"
                      : "bg-zinc-800 text-white"
                  )}
                >
                  {character.description}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
