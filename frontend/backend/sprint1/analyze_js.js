/**
 * analyze_js.js — Codio JS AST Analyzer
 * Uses acorn to parse JS code and extract structural features.
 * Reads code from stdin, outputs JSON to stdout.
 *
 * Usage: echo "<js_code>" | node analyze_js.js
 * Install: npm install acorn
 */

const acorn = require("acorn");

function analyzeJS(code) {
  let ast;

  try {
    ast = acorn.parse(code, {
      ecmaVersion: 2020,
      sourceType: "script",
    });
  } catch (err) {
    return {
      loops:             0,
      conditions:        0,
      function_presence: false,
      nested_depth:      0,
      syntax_error:      true,
      correct_output:    false,
      error_message:     err.message,
    };
  }

  let loops     = 0;
  let conditions = 0;
  let functions  = 0;
  let maxDepth   = 0;

  function walk(node, depth = 0) {
    if (!node || typeof node !== "object") return;
    maxDepth = Math.max(maxDepth, depth);

    switch (node.type) {
      case "ForStatement":
      case "ForInStatement":
      case "ForOfStatement":
      case "WhileStatement":
      case "DoWhileStatement":
        loops++;
        break;
      case "IfStatement":
      case "SwitchStatement":
        conditions++;
        break;
      case "FunctionDeclaration":
      case "FunctionExpression":
      case "ArrowFunctionExpression":
        functions++;
        break;
    }

    for (const key of Object.keys(node)) {
      if (["type", "start", "end"].includes(key)) continue;
      const child = node[key];
      if (Array.isArray(child)) {
        child.forEach(c => { if (c && c.type) walk(c, depth + 1); });
      } else if (child && typeof child === "object" && child.type) {
        walk(child, depth + 1);
      }
    }
  }

  walk(ast);

  return {
    loops,
    conditions,
    function_presence: functions > 0,
    nested_depth:      maxDepth,
    syntax_error:      false,
    correct_output:    false,
  };
}

// Read from stdin
let code = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", chunk => { code += chunk; });
process.stdin.on("end", () => {
  const result = analyzeJS(code);
  process.stdout.write(JSON.stringify(result));
});
