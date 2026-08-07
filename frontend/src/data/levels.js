

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
    // ── Audio paths preserved exactly as they are in production ──
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
`/**
 * @param {string} name
 * @param {number} age
 * @param {number} score
 * @return {string}
 */
var formatReport = function(name, age, score) {
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
    songName: "Lone Signal",
    requiredFeatures: ["functions"],
    hint: "Use an f-string in Python (f\"...{value:.2f}\") or toFixed(2) in JavaScript to format the score.",
    editorHeight: "380px",
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
    // ⚠ PLACEHOLDER — no real audio provided for this level yet.
    // Swap these paths once you have the actual files; naming isn't tied
    // to `id`, so any filenames work here.
    layers: {
      drums:  { src: "/audio/data_echoes_drums.mp3",  broken: true },
      chords: { src: "/audio/data_echoes_chords.mp3", broken: true },
      bass:   { src: "/audio/data_echoes_bass.mp3",   broken: true },
      melody: { src: "/audio/data_echoes_melody.mp3", broken: true },
    },
  },

  {
    id: 3,
    order: 20,
    title: "Level — Mirror Logic",
    locked: true,
    password: "Lone Signal", // ← update once Data Echoes' songName is picked
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
`/**
 * @param {number} x
 * @return {boolean}
 */
var isPalindrome = function(x) {
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
    // ── Audio paths preserved exactly as they are in production ──
    layers: {
      drums:  { src: "/audio/drums11.mp3",  broken: true },
      chords: { src: "/audio/chords11.mp3", broken: true },
      bass:   { src: "/audio/bass11.mp3",   broken: true },
      melody: { src: "/audio/melody11.mp3", broken: true },
    },
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
`/**
 * @param {number[]} nums
 * @return {number}
 */
var sumEven = function(nums) {
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
    // ── Preserved exactly: this is your real song name, NOT "NEON TOMORROW" ──
    songName: "Static Tomorrow",
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
    // ── Audio paths preserved exactly as they are in production ──
    layers: {
      drums:  { src: "/audio/drums2.mp3",  broken: true },
      chords: { src: "/audio/chords2.mp3", broken: true },
      bass:   { src: "/audio/bass2.mp3",   broken: true },
      melody: { src: "/audio/melody2.mp3", broken: true },
    },
  },

  {
    id: 4,
    order: 40,
    title: "Level — Positive Squares",
    locked: true,
    password: "Static Tomorrow",
    challenge: "Complete the filterSquares function.\n\nGiven a list of integers, return a new list containing the square of each positive number, in the same order. Skip zero and negative numbers entirely.",
    examples: [
      { input: "filterSquares([1, -2, 3, 0, -4, 5])", output: "1, 9, 25" },
      { input: "filterSquares([-1, -2, -3])",         output: "(empty)"  },
      { input: "filterSquares([2, 4, 6])",            output: "4, 16, 36" },
    ],
    description: "Not every value in the stream deserves to echo. Keep only what's positive — then let it resonate, squared.",
    type: "complete",
    starterCode:
`def filterSquares(nums):
    # Complete this function
    # Return a NEW list with the square of each POSITIVE number in nums,
    # preserving order. Skip zero and negative numbers.
    pass

# Public test runner — do not modify
print(", ".join(str(n) for n in filterSquares([1, -2, 3, 0, -4, 5])))
print(", ".join(str(n) for n in filterSquares([-1, -2, -3])))
print(", ".join(str(n) for n in filterSquares([2, 4, 6])))
`,
    starterCodeJS:
`/**
 * @param {number[]} nums
 * @return {number[]}
 */
var filterSquares = function(nums) {
    // Complete this function
    // Return a NEW array with the square of each POSITIVE number in nums,
    // preserving order. Skip zero and negative numbers.
};

// Public test runner — do not modify
console.log(filterSquares([1, -2, 3, 0, -4, 5]).join(", "));
console.log(filterSquares([-1, -2, -3]).join(", "));
console.log(filterSquares([2, 4, 6]).join(", "));
`,
    expectedOutput:   "1, 9, 25\n\n4, 16, 36",
    expectedOutputJS: "1, 9, 25\n\n4, 16, 36",
    songName: "Memory Leak",
    requiredFeatures: ["functions", "lists"],
    hint: "Build a new empty list, loop through nums, and only append the square if the number is greater than 0.",
    editorHeight: "380px",
    callTemplate: "filterSquares({args})",
    hiddenTests: [
      { args: [[3, -3, 0, 9]],   expected: [9, 81] },
      { args: [[]],              expected: []      },
      { args: [[-5, -10]],       expected: []      },
      { args: [[7]],             expected: [49]     },
      { args: [[1, 2, 3, 4, 5]], expected: [1, 4, 9, 16, 25] },
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
    // ⚠ PLACEHOLDER — no real audio provided for this level yet.
    layers: {
      drums:  { src: "/audio/positive_squares_drums.mp3",  broken: true },
      chords: { src: "/audio/positive_square_chords.mp3", broken: true },
      bass:   { src: "/audio/positive_squares_bass.mp3",   broken: true },
      melody: { src: "/audio/positive_squares_melody.mp3", broken: true },
    },
  },

  {
    id: 5,
    order: 50,
    title: "Level — Signal Memory",
    locked: true,
    password: "Memory Leak", // ← update once Positive Squares' songName is picked
    challenge: "Complete the uniqueValues function.\n\nGiven a list of integers, return a new list containing only the first occurrence of each value, in their original order. Remove all later duplicates.",
    examples: [
      { input: "uniqueValues([1, 2, 2, 3, 1, 4])", output: "1, 2, 3, 4" },
      { input: "uniqueValues([5, 5, 5])",          output: "5"          },
      { input: "uniqueValues([])",                 output: "(empty)"   },
    ],
    description: "A signal doesn't need to repeat to be heard. Remember what's already played — let only the new through.",
    type: "complete",
    starterCode:
`def uniqueValues(nums):
    # Complete this function
    # Return a NEW list with only the FIRST occurrence of each value,
    # preserving order. Remove later duplicates.
    pass

# Public test runner — do not modify
print(", ".join(str(n) for n in uniqueValues([1, 2, 2, 3, 1, 4])))
print(", ".join(str(n) for n in uniqueValues([5, 5, 5])))
print(", ".join(str(n) for n in uniqueValues([])))
`,
    starterCodeJS:
`/**
 * @param {number[]} nums
 * @return {number[]}
 */
var uniqueValues = function(nums) {
    // Complete this function
    // Return a NEW array with only the FIRST occurrence of each value,
    // preserving order. Remove later duplicates.
};

// Public test runner — do not modify
console.log(uniqueValues([1, 2, 2, 3, 1, 4]).join(", "));
console.log(uniqueValues([5, 5, 5]).join(", "));
console.log(uniqueValues([]).join(", "));
`,
    expectedOutput:   "1, 2, 3, 4\n5\n",
    expectedOutputJS: "1, 2, 3, 4\n5\n",
    songName: "Galactic Transit",
    requiredFeatures: ["functions", "sets"],
    hint: "Try using a set (Python: set(), JS: new Set()) to track which values you've already seen while looping through the list.",
    editorHeight: "380px",
    callTemplate: "uniqueValues({args})",
    hiddenTests: [
      { args: [[9, 9, 8, 7, 8, 9]],  expected: [9, 8, 7] },
      { args: [[1, 1, 1, 1]],        expected: [1]       },
      { args: [[]],                  expected: []         },
      { args: [[4, 3, 2, 1]],        expected: [4, 3, 2, 1] },
      { args: [[0, 0, -1, -1, 2]],   expected: [0, -1, 2] },
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
      melody: { label: "SAMPLE", desc: "All tests pass", color: "var(--accent-green)"  },
    },
    // ⚠ PLACEHOLDER — no real audio provided for this level yet.
    layers: {
      drums:  { src: "/audio/signal_memory_drums.m4a",  broken: true },
      chords: { src: "/audio/signal_memory_chords.m4a", broken: true },
      bass:   { src: "/audio/signal_memory_bass.m4a",   broken: true },
      melody: { src: "/audio/signal_memory_sample.m4a", broken: true },
    },
  },

{
    id: 6,
    order: 60,
    title: "Level — Loudest Voice",
    locked: true,
    password: "Galactic Transit", // ← update once Signal Memory's songName is picked
    challenge: "Complete the mostFrequent function.\n\nGiven a list of integers, return the value that appears most often. If there's a tie, return the SMALLEST tied value.",
    examples: [
      { input: "mostFrequent([1, 3, 2, 3, 4, 3])", output: "3" },
      { input: "mostFrequent([5, 5, 1, 1, 2])",     output: "1" },
      { input: "mostFrequent([7])",                 output: "7" },
    ],
    description: "Some signals repeat more than others. Find the one that speaks loudest — and when two tie, let the quieter one lead.",
    type: "complete",
    starterCode:
`def mostFrequent(nums):
    # Complete this function
    # Return the value that appears most often in nums.
    # If there's a tie, return the SMALLEST tied value.
    pass
 
# Public test runner — do not modify
print(mostFrequent([1, 3, 2, 3, 4, 3]))
print(mostFrequent([5, 5, 1, 1, 2]))
print(mostFrequent([7]))
`,
    starterCodeJS:
`/**
 * @param {number[]} nums
 * @return {number}
 */
var mostFrequent = function(nums) {
    // Complete this function
    // Return the value that appears most often in nums.
    // If there's a tie, return the SMALLEST tied value.
};
 
// Public test runner — do not modify
console.log(mostFrequent([1, 3, 2, 3, 4, 3]));
console.log(mostFrequent([5, 5, 1, 1, 2]));
console.log(mostFrequent([7]));
`,
    expectedOutput:   "3\n1\n7",
    expectedOutputJS: "3\n1\n7",
    songName: "Synthetic Breath",
    requiredFeatures: ["functions", "dictionaries"],
    hint: "Try using a dictionary (Python: {}) or object (JS: {}) to count how many times each number appears, then find the key with the highest count.",
    editorHeight: "380px",
    callTemplate: "mostFrequent({args})",
    hiddenTests: [
      { args: [[4, 4, 4, 2, 2, 2, 2]],     expected: 2  },
      { args: [[1, 1, 2, 2]],              expected: 1  },
      { args: [[9]],                       expected: 9  },
      { args: [[3, 3, 3, 3]],              expected: 3  },
      { args: [[-1, -1, -2, -3, -3]],      expected: -3 },
      { args: [[0, 1, 0, 1, 2]],           expected: 0  },
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
    // ⚠ PLACEHOLDER — no real audio provided for this level yet.
    layers: {
      drums:  { src: "/audio/loudest_voice_drums.m4a",  broken: true },
      chords: { src: "/audio/loudest_voice_chords.m4a", broken: true },
      bass:   { src: "/audio/loudest_voice_bass.m4a",   broken: true },
      melody: { src: "/audio/loudest_voice_melody.m4a", broken: true },
    },
  },
];






export const orderedLevels = [...levels].sort((a, b) => a.order - b.order);