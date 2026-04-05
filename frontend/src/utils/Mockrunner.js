// mockRunner.js — simulates backend locally for testing
// Replace this with real axios call once backend is ready

export function mockRunCode(code, expectedOutput) {
  // Basic syntax check
  const syntaxError = detectSyntaxError(code);

  // Feature extraction (simulates AST)
  const loops = (code.match(/\bfor\b|\bwhile\b/g) || []).length;
  const conditions = (code.match(/\bif\b/g) || []).length;
  const function_presence = /\bdef\b/.test(code);

  // Simulate output
  let output = "";
  if (syntaxError) {
    output = `SyntaxError: ${syntaxError}`;
  } else {
    output = simulateOutput(code);
  }

  const correct_output = output.trim() === expectedOutput.trim();

  return {
    output,
    analysis: {
      loops,
      conditions,
      function_presence,
      syntax_error: !!syntaxError,
      correct_output,
    },
  };
}

function detectSyntaxError(code) {
  // Catch common mistakes
  const lines = code.split("\n");
  for (let line of lines) {
    const stripped = line.trim();
    if (stripped === "") continue;
    if (/^(for|while|if|else|elif|def|class)\b.*[^:]$/.test(stripped)) {
      if (!/^(#|pass|return|break|continue)/.test(stripped)) {
        if (!stripped.endsWith(":") && stripped.match(/^(for|while|if|def)\b/)) {
          return `missing ':' at end of statement → "${stripped}"`;
        }
      }
    }
  }
  return null;
}

function simulateOutput(code) {
  const lines = [];

  // Simulate: for i in range(N): print(i)
  const forRangeMatch = code.match(/for\s+(\w+)\s+in\s+range\((\d+)(?:,\s*(\d+))?\)/);
  const printMatch = code.match(/print\((\w+)\)/);

  if (forRangeMatch && printMatch) {
    const varName = forRangeMatch[1];
    const printVar = printMatch[1];

    if (varName === printVar) {
      const start = forRangeMatch[3] !== undefined ? parseInt(forRangeMatch[2]) : 0;
      const end = forRangeMatch[3] !== undefined ? parseInt(forRangeMatch[3]) : parseInt(forRangeMatch[2]);
      for (let i = start; i < end; i++) {
        lines.push(String(i));
      }
      return lines.join("\n");
    }
  }

  // Simulate: while loop with counter
  const whileMatch = code.match(/while\s+(\w+)\s*(<|<=)\s*(\d+)/);
  if (whileMatch && printMatch) {
    const limit = parseInt(whileMatch[3]);
    const op = whileMatch[2];
    const max = op === "<=" ? limit + 1 : limit;
    for (let i = 0; i < max; i++) {
      lines.push(String(i));
    }
    return lines.join("\n");
  }

  // Simulate: bare print("...") or print('...')
  const printStringMatch = code.match(/print\(["'](.+?)["']\)/);
  if (printStringMatch) {
    return printStringMatch[1];
  }

  return "// Output simulation not supported for this pattern.\n// Connect backend for full execution.";
}