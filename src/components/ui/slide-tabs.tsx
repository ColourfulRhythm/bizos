"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";

export interface SlideTabItem {
  label: string;
  href: string;
}

const defaultTabs: SlideTabItem[] = [
  { label: "Home", href: "/" },
  { label: "Pricing", href: "/pricing" },
  { label: "Breakdown", href: "/breakdown" },
  { label: "Info", href: "/info" },
  { label: "Contact", href: "/contact" },
];

interface Position {
  left: number;
  width: number;
  opacity: number;
}

export interface SlideTabsProps {
  tabs?: SlideTabItem[];
  className?: string;
}

export function SlideTabs({ tabs = defaultTabs, className }: SlideTabsProps) {
  const [position, setPosition] = useState<Position>({
    left: 0,
    width: 0,
    opacity: 0,
  });
  const pathname = usePathname();
  const [selected, setSelected] = useState(0);
  const tabsRef = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    const idx = tabs.findIndex((t) => t.href === pathname || (t.href !== "/" && pathname.startsWith(t.href)));
    setSelected(idx >= 0 ? idx : 0);
  }, [pathname, tabs]);

  useEffect(() => {
    const selectedTab = tabsRef.current[selected];
    if (selectedTab) {
      const { width } = selectedTab.getBoundingClientRect();
      setPosition({
        left: selectedTab.offsetLeft,
        width,
        opacity: 1,
      });
    }
  }, [selected]);

  const updatePosition = (el: HTMLLIElement | null) => {
    if (!el) return;
    const { width } = el.getBoundingClientRect();
    setPosition({
      left: el.offsetLeft,
      width,
      opacity: 1,
    });
  };

  return (
    <ul
      onMouseLeave={() => {
        const selectedTab = tabsRef.current[selected];
        if (selectedTab) {
          const { width } = selectedTab.getBoundingClientRect();
          setPosition({
            left: selectedTab.offsetLeft,
            width,
            opacity: 1,
          });
        }
      }}
      className={`relative mx-auto flex w-fit rounded-full border-2 border-zinc-300 bg-white p-1 shadow-sm dark:border-zinc-600 dark:bg-zinc-800 ${className ?? ""}`}
    >
      {tabs.map((tab, i) => (
        <Tab
          key={tab.href}
          ref={(el) => {
            tabsRef.current[i] = el;
          }}
          href={tab.href}
          onSelect={() => setSelected(i)}
          onMouseEnter={(el) => updatePosition(el)}
        >
          {tab.label}
        </Tab>
      ))}
      <Cursor position={position} />
    </ul>
  );
}

interface TabProps {
  children: React.ReactNode;
  href: string;
  onSelect: () => void;
  onMouseEnter: (el: HTMLLIElement) => void;
}

const Tab = React.forwardRef<HTMLLIElement | null, TabProps>(
  ({ children, href, onSelect, onMouseEnter }, ref) => (
    <li
      ref={ref}
        onMouseEnter={(e) => onMouseEnter(e.currentTarget)}
        className="relative z-10 block cursor-pointer px-2.5 py-1 text-[10px] uppercase tracking-wide text-zinc-900 md:px-4 md:py-2 md:text-xs dark:text-zinc-100"
      >
        <Link href={href} onClick={onSelect} className="block">
          {children}
        </Link>
      </li>
  )
);

Tab.displayName = "Tab";

function Cursor({ position }: { position: Position }) {
  return (
    <motion.li
      animate={{
        left: position.left,
        width: position.width,
        opacity: position.opacity,
      }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className="absolute left-0 top-1 z-0 h-5 rounded-full bg-zinc-800 md:top-1 md:h-6 dark:bg-zinc-100"
      aria-hidden
    />
  );
}
