// ─────────────────────────────────────────────────────────────────────────
// LEVEL CONFIG — single source of truth for the whole platform.
//
// `id`    — PERMANENT identifier. Never change once a level ships.
//           Used for audio filenames, server-side hidden test lookup, etc.
// `order` — DISPLAY/SEQUENCE position. Spaced by 10s on purpose, so a new
//           level can be inserted anywhere later just by picking a number
//           in between two existing ones — no renumbering, ever.
//
// Level 0 is the tutorial and is intentionally excluded from the
// "learn path" topic progression — it has order 0 but isn't counted
// as part of the curriculum sequence shown to the user.
// ─────────────────────────────────────────────────────────────────────────

export const levels = [
  {
    id: 0,
    order: 0,
    title: "Level 0 — The First Beat",
    locked: false,
    password: null,
    challenge: "Write a loop that prints numbers from 0 to 4.",
    examples: [],
    description: "Your first mission. Make the machine count. Make it feel the rhythm.",
    type: "write",
    starterCode: "# Write your code here\n",
    starterCodeJS: "// Write your code here\n",
    expectedOutput:   "0\n1\n2\n3\n4",
    expectedOutputJS: "0\n1\n2\n3\n4",
    songName: "THE BEGINNING",
    requiredFeatures: ["loops"],
    hint: "Try using a for loop with range().",
    editorHeight: "360px",
    criteria: [
      { key: "loops",           layer: "drums",  weight: 35 },
      { key: "no_syntax_error", layer: "chords", weight: 35 },
      { key: "correct_output",  layer: "bass",   weight: 30 },
    ],
    layerDisplay: {
      drums:  { label: "DRUMS",  desc: "Rhythm",    color: "var(--accent-cyan)"   },
      chords: { label: "CHORDS", desc: "Clarity",   color: "var(--accent-purple)" },
      bass:   { label: "BASS",   desc: "Precision", color: "var(--accent-pink)"   },
      melody: { label: "MELODY", desc: "Harmony",   color: "var(--accent-green)"  },
    },
    layers: {
      drums:  { src: "/audio/drums0.mp3",  broken: true },
      chords: { src: "/audio/chords0.mp3", broken: true },
      bass:   { src: "/audio/bass0.mp3",   broken: true },
      melody: null,
    },
  },

  {
    id: 1,
    order: 10,
    title: "Level — Data Echoes",
    locked: true,
    password: "THE BEGINNING",
    challenge: "Complete the formatReport function.\n\nGiven a name (string), age (integer), and score (float), return a formatted report string with the score shown to exactly 2 decimal places.",
    examples: [
      { input: 'formatReport("Alice", 30, 92.5)', output: "Name: Alice, Age: 30, Score: 92.50" },
      { input: 'formatReport("Bob", 22, 75)',     output: "Name: Bob, Age: 22, Score: 75.00"   },
      { input: 'formatReport("Cy", 19, 100)',     output: "Name: Cy, Age: 19, Score: 100.00"   },
    ],
    description: "Every value has a voice — string, number, decimal. Learn to make them speak in one line.",
    type: "complete",
    starterCode:
`def formatReport(name, age, score):
    # Complete this function
    # Return: "Name: {name}, Age: {age}, Score: {score with 2 decimal places}"
    pass

# Public test runner — do not modify
print(formatReport("Alice", 30, 92.5))
print(formatReport("Bob", 22, 75))
print(formatReport("Cy", 19, 100))
`,
    starterCodeJS:
`var formatReport = function(name, age, score) {
    // Complete this function
    // Return: "Name: {name}, Age: {age}, Score: {score with 2 decimal places}"
};

// Public test runner — do not modify
console.log(formatReport("Alice", 30, 92.5));
console.log(formatReport("Bob", 22, 75));
console.log(formatReport("Cy", 19, 100));
`,
    expectedOutput:   "Name: Alice, Age: 30, Score: 92.50\nName: Bob, Age: 22, Score: 75.00\nName: Cy, Age: 19, Score: 100.00",
    expectedOutputJS: "Name: Alice, Age: 30, Score: 92.50\nName: Bob, Age: 22, Score: 75.00\nName: Cy, Age: 19, Score: 100.00",
    songName: "TBD",
    requiredFeatures: ["functions"],
    hint: "Use an f-string in Python (f\"...{value:.2f}\") or toFixed(2) in JavaScript to format the score.",
    editorHeight: "380px",
    // Documentation only — the authoritative copy of these tests lives
    // server-side in main.py and is never trusted from the client.
    callTemplate: "formatReport({args})",
    hiddenTests: [
      { args: ["Zoe", 45, 60],    expected: "Name: Zoe, Age: 45, Score: 60.00" },
      { args: ["Max", 8, 99.99], expected: "Name: Max, Age: 8, Score: 99.99"   },
      { args: ["Ivy", 100, 0],   expected: "Name: Ivy, Age: 100, Score: 0.00"  },
    ],
    criteria: [
      { key: "functions",         layer: "drums",  weight: 25 },
      { key: "no_syntax_error",   layer: "chords", weight: 25 },
      { key: "correct_output",    layer: "bass",   weight: 20 },
      { key: "all_hidden_passed", layer: "melody", weight: 30 },
    ],
    layerDisplay: {
      drums:  { label: "DRUMS",  desc: "Structure",      color: "var(--accent-cyan)"   },
      chords: { label: "CHORDS", desc: "Clarity",        color: "var(--accent-purple)" },
      bass:   { label: "BASS",   desc: "Precision",      color: "var(--accent-pink)"   },
      melody: { label: "MELODY", desc: "All tests pass", color: "var(--accent-green)"  },
    },
    layers: {
      drums:  { src: "/audio/l3_drums.mp3",  broken: true },
      chords: { src: "/audio/l3_chords.mp3", broken: true },
      bass:   { src: "/audio/l3_bass.mp3",   broken: true },
      melody: { src: "/audio/l3_melody.mp3", broken: true },
    },
  },

  {
    id: 3,
    order: 20,
    title: "Level — Mirror Logic",
    locked: true,
    password: "TBD", // ← update to match the Data Echoes songName once you pick it
    challenge: "Given an integer x, return True if x is a palindrome, False otherwise.",
    examples: [
      { input: "isPalindrome(121)",  output: "True"  },
      { input: "isPalindrome(-121)", output: "False" },
      { input: "isPalindrome(10)",   output: "False" },
    ],
    description: "The machine speaks in mirrors. Can you make it understand symmetry?",
    type: "fix",
    starterCode:
`class Solution(object):
    def isPalindrome(self, x):
        # Complete this method
        # Return True if x is a palindrome, False otherwise
        pass

# Test runner — do not modify
sol = Solution()
print(sol.isPalindrome(121))
print(sol.isPalindrome(-121))
print(sol.isPalindrome(10))
`,
    starterCodeJS:
`var isPalindrome = function(x) {
    // Complete this function
    // Return true if x is a palindrome, false otherwise
};

// Test runner — do not modify
console.log(isPalindrome(121));
console.log(isPalindrome(-121));
console.log(isPalindrome(10));
`,
    expectedOutput:   "True\nFalse\nFalse",
    expectedOutputJS: "true\nfalse\nfalse",
    songName: "16 PUNKS",
    requiredFeatures: ["functions", "conditions"],
    hint: "Convert x to a string and compare it to its reverse. Negative numbers are never palindromes.",
    editorHeight: "380px",
    callTemplate: "Solution().isPalindrome({args})",
    hiddenTests: [
      { args: [12321], expected: true  },
      { args: [123],   expected: false },
      { args: [0],     expected: true  },
      { args: [-5],    expected: false },
      { args: [1],     expected: true  },
    ],
    // ── all_hidden_passed replaces correct_output on drums ──
    // Closes the cheat gap: hardcoding print(True); print(False); print(False)
    // satisfies the public test's correct_output, but the class method itself
    // still gets called directly with fresh inputs during hidden verification,
    // so a hardcoded/empty implementation fails there and never reaches 100%.
    criteria: [
      { key: "all_hidden_passed", layer: "drums",  weight: 30 },
      { key: "conditions",        layer: "chords", weight: 25 },
      { key: "functions",         layer: "bass",   weight: 25 },
      { key: "no_syntax_error",   layer: "melody", weight: 20 },
    ],
    layerDisplay: {
      drums:  { label: "DRUMS",  desc: "Precision", color: "var(--accent-cyan)"   },
      chords: { label: "CHORDS", desc: "Logic",      color: "var(--accent-purple)" },
      bass:   { label: "BASS",   desc: "Structure",  color: "var(--accent-pink)"   },
      melody: { label: "MELODY", desc: "Clarity",    color: "var(--accent-green)"  },
    },
    layers: {
      drums:  { src: "/audio/drums11.mp3",  broken: true },
      chords: { src: "/audio/chords11.mp3", broken: true },
      bass:   { src: "/audio/bass11.mp3",   broken: true },
      melody: { src: "/audio/melody11.mp3", broken: true }
    }
  },

  {
    id: 2,
    order: 30,
    title: "Level — Even Frequency",
    locked: true,
    password: "16 PUNKS",
    challenge: "Complete the sumEven function.\n\nGiven a list of integers, return the sum of all even numbers in it.",
    examples: [
      { input: "sumEven([1, 2, 3, 4])", output: "6"  },
      { input: "sumEven([1, 3, 5])",    output: "0"  },
      { input: "sumEven([2, 4, 6, 8])", output: "20" },
    ],
    description: "Not every frequency deserves to be heard. Filter the noise, keep the even pulse.",
    type: "complete",
    starterCode:
`def sumEven(nums):
    # Complete this function
    # Return the sum of all even numbers in nums
    pass

# Public test runner — do not modify
print(sumEven([1, 2, 3, 4]))
print(sumEven([1, 3, 5]))
print(sumEven([2, 4, 6, 8]))
`,
    starterCodeJS:
`var sumEven = function(nums) {
    // Complete this function
    // Return the sum of all even numbers in nums
};

// Public test runner — do not modify
console.log(sumEven([1, 2, 3, 4]));
console.log(sumEven([1, 3, 5]));
console.log(sumEven([2, 4, 6, 8]));
`,
    expectedOutput:   "6\n0\n20",
    expectedOutputJS: "6\n0\n20",
    songName: "TBD",
    requiredFeatures: ["loops", "conditions"],
    hint: "Loop through the list and check if each number is divisible by 2 using the % operator.",
    editorHeight: "380px",
    callTemplate: "sumEven({args})",
    hiddenTests: [
      { args: [[]],               expected: 0   },
      { args: [[-2, -4, 1]],     expected: -6  },
      { args: [[0, 1, 2]],       expected: 2   },
      { args: [[100, 99]],       expected: 100 },
      { args: [[7, 13, 21]],     expected: 0   },
      { args: [[2, 2, 2]],       expected: 6   },
      { args: [[-1, -2, -3, -4]],expected: -6  },
    ],
    criteria: [
      { key: "loops",             layer: "drums",  weight: 25 },
      { key: "conditions",        layer: "chords", weight: 25 },
      { key: "no_syntax_error",   layer: "bass",   weight: 20 },
      { key: "all_hidden_passed", layer: "melody", weight: 30 },
    ],
    layerDisplay: {
      drums:  { label: "DRUMS",  desc: "Iteration",      color: "var(--accent-cyan)"   },
      chords: { label: "CHORDS", desc: "Logic",          color: "var(--accent-purple)" },
      bass:   { label: "BASS",   desc: "Clarity",        color: "var(--accent-pink)"   },
      melody: { label: "MELODY", desc: "All tests pass", color: "var(--accent-green)"  },
    },
    layers: {
      drums:  { src: "/audio/drums2.mp3",  broken: true },
      chords: { src: "/audio/chords2.mp3", broken: true },
      bass:   { src: "/audio/bass2.mp3",   broken: true },
      melody: { src: "/audio/melody2.mp3", broken: true },
    },
  },
];

// Levels sorted by display order — use this everywhere levels are listed/navigated.
export const orderedLevels = [...levels].sort((a, b) => a.order - b.order);