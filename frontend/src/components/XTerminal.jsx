import { useEffect, useRef, useImperativeHandle, forwardRef } from "react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import "@xterm/xterm/css/xterm.css";

// XTerminal — a real terminal emulator component
// Usage:
//   const termRef = useRef();
//   <XTerminal ref={termRef} />
//   termRef.current.write("hello world");
//   termRef.current.clear();

const XTerminal = forwardRef(function XTerminal(_, ref) {
  const containerRef = useRef(null);
  const termRef      = useRef(null);
  const fitAddonRef  = useRef(null);

  useEffect(() => {
    const term = new Terminal({
      cursorBlink: false,
      fontSize: 13,
      fontFamily: "'Share Tech Mono', 'Courier New', monospace",
      theme: {
        background:    "#050810",
        foreground:    "#00ff9c",   // accent-green — default output color
        black:         "#050810",
        brightBlack:   "#4a5568",
        red:           "#ff2d78",   // accent-pink — errors
        brightRed:     "#ff2d78",
        green:         "#00ff9c",   // accent-green — success
        brightGreen:   "#00ff9c",
        yellow:        "#f6e05e",
        brightYellow:  "#faf089",
        blue:          "#00f5ff",   // accent-cyan
        brightBlue:    "#00f5ff",
        magenta:       "#b044ff",   // accent-purple
        brightMagenta: "#b044ff",
        cyan:          "#00f5ff",
        brightCyan:    "#00f5ff",
        white:         "#e2e8f0",
        brightWhite:   "#ffffff",
        cursor:        "#00f5ff",
        selectionBackground: "#00f5ff33",
      },
      scrollback: 500,
      convertEol: true,     // \n → \r\n automatically
      disableStdin: true,   // read-only — user types in Monaco, not here
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(containerRef.current);
    fitAddon.fit();

    termRef.current     = term;
    fitAddonRef.current = fitAddon;

    // Initial prompt line
    term.writeln("\x1b[36m[ CODIO OUTPUT TERMINAL ]\x1b[0m");
    term.writeln("\x1b[90m// Waiting for execution...\x1b[0m");

    // Refit on window resize
    const handleResize = () => fitAddon.fit();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      term.dispose();
    };
  }, []);

  // Expose methods to parent via ref
  useImperativeHandle(ref, () => ({
    // Write raw output from code execution
    writeOutput(text) {
      if (!termRef.current) return;
      termRef.current.reset();
      termRef.current.writeln("\x1b[36m[ OUTPUT ]\x1b[0m");

      if (!text || text.trim() === "") {
        termRef.current.writeln("\x1b[90m// No output produced.\x1b[0m");
        return;
      }

      // Color errors red, normal output green
      const isError = /error|exception|traceback/i.test(text);
      const color   = isError ? "\x1b[91m" : "\x1b[92m";
      const reset   = "\x1b[0m";

      text.split("\n").forEach((line) => {
        termRef.current.writeln(`${color}${line}${reset}`);
      });
    },

    // Show a status/info message in cyan
    writeInfo(text) {
      if (!termRef.current) return;
      termRef.current.writeln(`\x1b[36m${text}\x1b[0m`);
    },

    // Show executing indicator
    writeLoading() {
      if (!termRef.current) return;
      termRef.current.reset();
      termRef.current.writeln("\x1b[36m[ OUTPUT ]\x1b[0m");
      termRef.current.writeln("\x1b[90m// Executing...\x1b[0m");
    },

    // Full clear
    clear() {
      if (!termRef.current) return;
      termRef.current.reset();
      termRef.current.writeln("\x1b[36m[ CODIO OUTPUT TERMINAL ]\x1b[0m");
      termRef.current.writeln("\x1b[90m// Waiting for execution...\x1b[0m");
    },
  }));

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "160px",
        background: "#050810",
        border: "1px solid var(--border-color)",
        padding: "4px",
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    />
  );
});

export default XTerminal;