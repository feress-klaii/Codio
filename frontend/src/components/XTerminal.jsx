import { useEffect, useRef, useImperativeHandle, forwardRef } from "react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import "@xterm/xterm/css/xterm.css";

// XTerminal — a real terminal emulator component, with each line
// manually center-padded based on the terminal's actual column width.
//
// xterm.js renders onto a canvas-based character grid — CSS text-align
// has no effect on it at all. To visually center content we compute how
// many blank columns are available (term.cols - line.length) and prepend
// half of that as leading spaces before writing each line. This adapts
// automatically as the terminal resizes, since fitAddon keeps term.cols
// current.

const centerLine = (text, cols) => {
  if (!cols || text.length >= cols) return text;
  const totalPad = cols - text.length;
  const left = Math.floor(totalPad / 2);
  return " ".repeat(left) + text;
};

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
        foreground:    "#00ff9c",
        black:         "#050810",
        brightBlack:   "#4a5568",
        red:           "#ff2d78",
        brightRed:     "#ff2d78",
        green:         "#00ff9c",
        brightGreen:   "#00ff9c",
        yellow:        "#f6ad55",
        brightYellow:  "#fbd38d",
        blue:          "#00f5ff",
        brightBlue:    "#00f5ff",
        magenta:       "#b044ff",
        brightMagenta: "#b044ff",
        cyan:          "#00f5ff",
        brightCyan:    "#00f5ff",
        white:         "#e2e8f0",
        brightWhite:   "#ffffff",
        cursor:        "#00f5ff",
        selectionBackground: "#00f5ff33",
      },
      scrollback: 500,
      convertEol: true,
      disableStdin: true,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(containerRef.current);
    fitAddon.fit();

    termRef.current     = term;
    fitAddonRef.current = fitAddon;

    const cols = term.cols;
    term.writeln(`\x1b[36m${centerLine("[ CODIO OUTPUT TERMINAL ]", cols)}\x1b[0m`);
    term.writeln(`\x1b[90m${centerLine("// Waiting for execution...", cols)}\x1b[0m`);

    const handleResize = () => fitAddon.fit();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      term.dispose();
    };
  }, []);

  useImperativeHandle(ref, () => ({

    // mode: "success" → green, "wrong" → orange, "error" → red
    writeOutput(text, mode = "success") {
      if (!termRef.current) return;
      const term = termRef.current;
      const cols = term.cols;
      term.reset();
      term.writeln(`\x1b[36m${centerLine("[ OUTPUT ]", cols)}\x1b[0m`);

      if (!text || text.trim() === "") {
        term.writeln(`\x1b[90m${centerLine("// No output produced.", cols)}\x1b[0m`);
        return;
      }

      const colorCode = mode === "error" ? "91" : mode === "wrong" ? "93" : "92";

      text.split("\n").forEach((line) => {
        term.writeln(`\x1b[${colorCode}m${centerLine(line, cols)}\x1b[0m`);
      });
    },

    // Orange hint shown below wrong output
    writeHint(text) {
      if (!termRef.current) return;
      const term = termRef.current;
      const cols = term.cols;
      term.writeln("");
      term.writeln(`\x1b[33m${centerLine("⚠ OUTPUT MISMATCH", cols)}\x1b[0m`);
      text.split("\n").forEach((line) => {
        term.writeln(`\x1b[33m${centerLine(line, cols)}\x1b[0m`);
      });
    },

    // Highlights that a syntax/runtime error occurred on a specific line —
    // this was being called from Level.jsx but never actually implemented,
    // which would throw at runtime the first time a syntax error fired.
    writeErrorLine(lineNumber) {
      if (!termRef.current || !lineNumber) return;
      const term = termRef.current;
      const cols = term.cols;
      term.writeln("");
      term.writeln(`\x1b[91m${centerLine(`⚠ Error on line ${lineNumber}`, cols)}\x1b[0m`);
    },

    writeInfo(text) {
      if (!termRef.current) return;
      const term = termRef.current;
      term.writeln(`\x1b[36m${centerLine(text, term.cols)}\x1b[0m`);
    },

    writeLoading() {
      if (!termRef.current) return;
      const term = termRef.current;
      const cols = term.cols;
      term.reset();
      term.writeln(`\x1b[36m${centerLine("[ OUTPUT ]", cols)}\x1b[0m`);
      term.writeln(`\x1b[90m${centerLine("// Executing...", cols)}\x1b[0m`);
    },

    clear() {
      if (!termRef.current) return;
      const term = termRef.current;
      const cols = term.cols;
      term.reset();
      term.writeln(`\x1b[36m${centerLine("[ CODIO OUTPUT TERMINAL ]", cols)}\x1b[0m`);
      term.writeln(`\x1b[90m${centerLine("// Waiting for execution...", cols)}\x1b[0m`);
    },
  }));

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "160px",
        background: "#050810",
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    />
  );
});

export default XTerminal;