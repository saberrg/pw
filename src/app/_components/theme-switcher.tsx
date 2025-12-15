"use client";

import { memo, useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

declare global {
  var updateDOM: () => void;
}

type ColorSchemePreference = "dark" | "light";

const STORAGE_KEY = "nextjs-blog-starter-theme";
const modes: ColorSchemePreference[] = ["dark", "light"];

/** function to be injected in script tag for avoiding FOUC (Flash of Unstyled Content) */
export const NoFOUCScript = (storageKey: string) => {
  const [DARK, LIGHT] = ["dark", "light"];

  /** Modify transition globally to avoid patched transitions */
  const modifyTransition = () => {
    const css = document.createElement("style");
    css.textContent = "*,*:after,*:before{transition:none !important;}";
    document.head.appendChild(css);

    return () => {
      getComputedStyle(document.body);
      setTimeout(() => document.head.removeChild(css), 1);
    };
  };

  /** function to add remove dark class */
  window.updateDOM = () => {
    const restoreTransitions = modifyTransition();
    const mode = localStorage.getItem(storageKey) ?? LIGHT;
    const classList = document.documentElement.classList;
    if (mode === DARK) classList.add(DARK);
    else classList.remove(DARK);
    document.documentElement.setAttribute("data-mode", mode);
    restoreTransitions();
  };
  window.updateDOM();
};

let updateDOM: () => void;

/**
 * Animated Sun/Moon toggle switch
 */
const ThemeToggle = () => {
  const [mode, setMode] = useState<ColorSchemePreference>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem(STORAGE_KEY) as ColorSchemePreference | null;
    if (stored) {
      setMode(stored);
    }
    updateDOM = window.updateDOM;
    
    /** Sync the tabs */
    const handleStorage = (e: StorageEvent): void => {
      if (e.key === STORAGE_KEY) {
        setMode(e.newValue as ColorSchemePreference);
      }
    };
    addEventListener("storage", handleStorage);
    return () => removeEventListener("storage", handleStorage);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem(STORAGE_KEY, mode);
    
    // Add transitioning class for smooth color transitions
    document.documentElement.classList.add("transitioning");
    
    if (typeof updateDOM === "function") {
      updateDOM();
    }
    
    // Remove transitioning class after animation completes
    const timer = setTimeout(() => {
      document.documentElement.classList.remove("transitioning");
    }, 300);
    
    return () => clearTimeout(timer);
  }, [mode, mounted]);

  /** toggle mode */
  const handleModeSwitch = () => {
    const index = modes.indexOf(mode);
    setMode(modes[(index + 1) % modes.length]);
  };

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <button
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-full bg-yellow-400 shadow-[0_0_20px_5px_rgba(250,204,21,0.4)] transition-colors hover:bg-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        aria-label="Toggle theme"
      >
        <span className="h-5 w-5" />
      </button>
    );
  }

  return (
    <button
      onClick={handleModeSwitch}
      className={`relative inline-flex h-9 w-9 items-center justify-center rounded-full transition-all duration-300 hover:bg-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
        mode === "light" 
          ? "bg-yellow-400 shadow-[0_0_20px_5px_rgba(250,204,21,0.4)]" 
          : "bg-secondary"
      }`}
      aria-label={`Switch to ${mode === "light" ? "dark" : "light"} mode`}
    >
      {/* Sun Icon */}
      <Sun
        className={`absolute h-5 w-5 transition-all duration-300 ${
          mode === "light"
            ? "rotate-0 scale-100 opacity-100 text-yellow-900"
            : "rotate-90 scale-0 opacity-0"
        }`}
        strokeWidth={2}
      />
      {/* Moon Icon */}
      <Moon
        className={`absolute h-5 w-5 transition-all duration-300 ${
          mode === "dark"
            ? "rotate-0 scale-100 opacity-100"
            : "-rotate-90 scale-0 opacity-0"
        }`}
        strokeWidth={2}
      />
    </button>
  );
};

const Script = memo(() => (
  <script
    dangerouslySetInnerHTML={{
      __html: `(${NoFOUCScript.toString()})('${STORAGE_KEY}')`,
    }}
  />
));

Script.displayName = "ThemeSwitcherScript";

/**
 * Theme Switcher component with animated sun/moon icons
 */
export const ThemeSwitcher = () => {
  return (
    <>
      <Script />
      <ThemeToggle />
    </>
  );
};
