import { useEffect, useRef, useImperativeHandle, forwardRef } from "react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import "@xterm/xterm/css/xterm.css";

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
        yellow:        "#f6ad55",   // orange — wrong output
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

    term.writeln("\x1b[36m[ CODIO OUTPUT TERMINAL ]\x1b[0m");
    term.writeln("\x1b[90m// Waiting for execution...\x1b[0m");

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
      termRef.current.reset();
      termRef.current.writeln("\x1b[36m[ OUTPUT ]\x1b[0m");

      if (!text || text.trim() === "") {
        termRef.current.writeln("\x1b[90m// No output produced.\x1b[0m");
        return;
      }

      // color codes: green=92, orange/yellow=93, red=91
      const colorCode = mode === "error" ? "91" : mode === "wrong" ? "93" : "92";

      text.split("\n").forEach((line) => {
        termRef.current.writeln(`\x1b[${colorCode}m${line}\x1b[0m`);
      });
    },

    // Orange hint shown below wrong output
    writeHint(text) {
      if (!termRef.current) return;
      termRef.current.writeln("");
      termRef.current.writeln("\x1b[33m⚠ OUTPUT MISMATCH\x1b[0m");
      text.split("\n").forEach((line) => {
        termRef.current.writeln(`\x1b[33m  ${line}\x1b[0m`);
      });
    },

    writeInfo(text) {
      if (!termRef.current) return;
      termRef.current.writeln(`\x1b[36m${text}\x1b[0m`);
    },

    writeLoading() {
      if (!termRef.current) return;
      termRef.current.reset();
      termRef.current.writeln("\x1b[36m[ OUTPUT ]\x1b[0m");
      termRef.current.writeln("\x1b[90m// Executing...\x1b[0m");
    },

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
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    />
  );
});

export default XTerminal;