

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
    layers: {
      drums:  { src: "/audio/loudest_voice_drums.m4a",  broken: true },
      chords: { src: "/audio/loudest_voice_chords.m4a", broken: true },
      bass:   { src: "/audio/loudest_voice_bass.m4a",   broken: true },
      melody: { src: "/audio/loudest_voice_melody.m4a", broken: true },
    },
  },
  {
    id: 7,
    order: 70,
    title: "Level — Peak Signal",
    locked: true,
    password: "Synthetic Breath", // ← update once Loudest Voice's songName is picked
    challenge: "Complete the topScorer function.\n\nGiven a list of student records (each an object with 'name' and 'score'), return the name of the student with the highest score. If there's a tie, return whoever appears FIRST in the list.",
    examples: [
      { input: 'topScorer([{"name":"Alice","score":92},{"name":"Bob","score":88},{"name":"Cy","score":95}])', output: "Cy" },
      { input: 'topScorer([{"name":"Amy","score":70}])', output: "Amy" },
      { input: 'topScorer([{"name":"Max","score":50},{"name":"Ann","score":50}])', output: "Max" },
    ],
    description: "Every record hides a value. Reach into each one, find the loudest peak, and name it.",
    type: "complete",
    starterCode:
`def topScorer(students):
    # Complete this function
    # students is a list of dicts like {"name": ..., "score": ...}
    # Return the name of the student with the highest score.
    # On a tie, return whoever appears FIRST.
    pass
 
# Public test runner — do not modify
print(topScorer([{"name": "Alice", "score": 92}, {"name": "Bob", "score": 88}, {"name": "Cy", "score": 95}]))
print(topScorer([{"name": "Amy", "score": 70}]))
print(topScorer([{"name": "Max", "score": 50}, {"name": "Ann", "score": 50}]))
`,
    starterCodeJS:
`/**
 * @param {Array<{name: string, score: number}>} students
 * @return {string}
 */
var topScorer = function(students) {
    // Complete this function
    // Return the name of the student with the highest score.
    // On a tie, return whoever appears FIRST.
};
 
// Public test runner — do not modify
console.log(topScorer([{name:"Alice",score:92},{name:"Bob",score:88},{name:"Cy",score:95}]));
console.log(topScorer([{name:"Amy",score:70}]));
console.log(topScorer([{name:"Max",score:50},{name:"Ann",score:50}]));
`,
    expectedOutput:   "Cy\nAmy\nMax",
    expectedOutputJS: "Cy\nAmy\nMax",
    songName: "TBD",
    requiredFeatures: ["functions", "nested-data"],
    hint: "Loop through the list, and for each student's dict/object, compare its 'score' field to the best one found so far.",
    editorHeight: "380px",
    callTemplate: "topScorer({args})",
    hiddenTests: [
      { args: [[{name:"Zoe",score:10},{name:"Bo",score:99}]], expected: "Bo" },
      { args: [[{name:"A",score:0},{name:"B",score:0},{name:"C",score:5}]], expected: "C" },
      { args: [[{name:"Solo",score:1}]], expected: "Solo" },
      { args: [[{name:"X",score:-5},{name:"Y",score:-1}]], expected: "Y" },
      { args: [[{name:"T1",score:100},{name:"T2",score:100},{name:"T3",score:100}]], expected: "T1" },
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
      drums:  { src: "/audio/PLACEHOLDER_peak_signal_drums.mp3",  broken: true },
      chords: { src: "/audio/PLACEHOLDER_peak_signal_chords.mp3", broken: true },
      bass:   { src: "/audio/PLACEHOLDER_peak_signal_bass.mp3",   broken: true },
      melody: { src: "/audio/PLACEHOLDER_peak_signal_melody.mp3", broken: true },
    },
  },
  {
    id: 8,
    order: 80,
    isBoss: true,
    title: "BOSS — Signal Report",
    locked: true,
    password: "TBD", // ← update once Peak Signal's songName is picked
    challenge: "Complete filterValid, groupByType, and processSignals.\n\nGiven a list of sensor readings ({type, value}), drop invalid readings (value <= 0), group the rest by type, then return a string of each type's average value (2 decimals), sorted alphabetically: \"type1: X.XX, type2: Y.YY\"",
    examples: [
      { input: '[{"type":"audio","value":4},{"type":"audio","value":5},{"type":"video","value":2}]', output: "audio: 4.50, video: 2.00" },
      { input: '[{"type":"audio","value":-1},{"type":"video","value":3}]', output: "video: 3.00" },
    ],
    description: "Three signals, one report. Filter the noise, group the truth, and speak it in order.",
    type: "complete",
    starterCode:
`def filterValid(readings):
    # Drop readings with value <= 0
    pass
 
def groupByType(readings):
    # Group readings into a dict: type -> [values]
    pass
 
def processSignals(readings):
    # Use the two helpers above (or your own approach).
    # Return "type1: avg1.2f, type2: avg2.2f", sorted alphabetically by type.
    pass
 
# Public test runner — do not modify
print(processSignals([{"type": "audio", "value": 4}, {"type": "audio", "value": 5}, {"type": "video", "value": 2}]))
print(processSignals([{"type": "audio", "value": -1}, {"type": "video", "value": 3}]))
`,
    starterCodeJS:
`function filterValid(readings) {
    // Drop readings with value <= 0
}
function groupByType(readings) {
    // Group readings into an object: type -> [values]
}
function processSignals(readings) {
    // Use the two helpers above (or your own approach).
    // Return "type1: avg1.2f, type2: avg2.2f", sorted alphabetically by type.
}
 
// Public test runner — do not modify
console.log(processSignals([{type:"audio",value:4},{type:"audio",value:5},{type:"video",value:2}]));
console.log(processSignals([{type:"audio",value:-1},{type:"video",value:3}]));
`,
    expectedOutput:   "audio: 4.50, video: 2.00\nvideo: 3.00",
    expectedOutputJS: "audio: 4.50, video: 2.00\nvideo: 3.00",
    songName: "TBD",
    requiredFeatures: ["functions", "conditions", "dictionaries"],
    hint: "filterValid uses a condition. groupByType uses a dict/object. processSignals sorts the keys, computes each average, and joins the formatted parts with ', '.",
    editorHeight: "440px",
    callTemplate: "processSignals({args})",
    hiddenTests: [
      { args: [[{type:"audio",value:4},{type:"audio",value:5},{type:"video",value:2}]], expected: "audio: 4.50, video: 2.00" },
      { args: [[{type:"audio",value:-1},{type:"video",value:3}]], expected: "video: 3.00" },
      { args: [[]], expected: "" },
      { args: [[{type:"z",value:10},{type:"a",value:20}]], expected: "a: 20.00, z: 10.00" },
      { args: [[{type:"x",value:0},{type:"x",value:6}]], expected: "x: 6.00" },
    ],
    criteria: [
      { key: "functions",         layer: "drums",  weight: 15 },
      { key: "conditions",        layer: "chords", weight: 15 },
      { key: "no_syntax_error",   layer: "bass",   weight: 15 },
      { key: "correct_output",    layer: "melody", weight: 25 },
      { key: "all_hidden_passed", layer: "lead",   weight: 30 },
    ],
    layerDisplay: {
      drums:  { label: "DRUMS",  desc: "Structure",      color: "var(--accent-cyan)"   },
      chords: { label: "CHORDS", desc: "Logic",          color: "var(--accent-purple)" },
      bass:   { label: "BASS",   desc: "Clarity",        color: "var(--accent-pink)"   },
      melody: { label: "MELODY", desc: "Correctness",    color: "var(--accent-green)"  },
      lead:   { label: "LEAD",   desc: "All tests pass", color: "#ffd166"               },
    },
    // ⚠ PLACEHOLDER — add real audio (needs 5 stems: drums/chords/bass/melody/lead)
    layers: {
      drums:  { src: "/audio/PLACEHOLDER_boss1_drums.mp3",  broken: true },
      chords: { src: "/audio/PLACEHOLDER_boss1_chords.mp3", broken: true },
      bass:   { src: "/audio/PLACEHOLDER_boss1_bass.mp3",   broken: true },
      melody: { src: "/audio/PLACEHOLDER_boss1_melody.mp3", broken: true },
      lead:   { src: "/audio/PLACEHOLDER_boss1_lead.mp3",   broken: true },
    },
  },
  {
    id: 9,
    order: 90,
    title: "Level — Echo Chamber",
    locked: true,
    password: "TBD", // ← update once Signal Report's songName is picked
    challenge: "Complete the fib function.\n\nGiven a non-negative integer n, return the nth Fibonacci number (fib(0)=0, fib(1)=1) using recursion.",
    examples: [
      { input: "fib(0)", output: "0" },
      { input: "fib(5)", output: "5" },
      { input: "fib(7)", output: "13" },
    ],
    description: "Some echoes call back to smaller echoes, until silence answers first.",
    type: "complete",
    starterCode:
`def fib(n):
    # Complete this function using recursion
    # fib(0) = 0, fib(1) = 1
    pass

# Public test runner — do not modify
print(fib(0))
print(fib(5))
print(fib(7))
`,
    starterCodeJS:
`function fib(n) {
    // Complete this function using recursion
    // fib(0) = 0, fib(1) = 1
}

// Public test runner — do not modify
console.log(fib(0));
console.log(fib(5));
console.log(fib(7));
`,
    expectedOutput:   "0\n5\n13",
    expectedOutputJS: "0\n5\n13",
    songName: "TBD",
    requiredFeatures: ["functions", "conditions"],
    hint: "Base case: if n is 0 or 1, return n. Otherwise, return fib(n-1) + fib(n-2).",
    editorHeight: "380px",
    callTemplate: "fib({args})",
    hiddenTests: [
      { args: [2],  expected: 1  },
      { args: [3],  expected: 2  },
      { args: [6],  expected: 8  },
      { args: [8],  expected: 21 },
      { args: [10], expected: 55 },
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
      drums:  { src: "/audio/PLACEHOLDER_echo_chamber_drums.mp3",  broken: true },
      chords: { src: "/audio/PLACEHOLDER_echo_chamber_chords.mp3", broken: true },
      bass:   { src: "/audio/PLACEHOLDER_echo_chamber_bass.mp3",   broken: true },
      melody: { src: "/audio/PLACEHOLDER_echo_chamber_melody.mp3", broken: true },
    },
  },{
    id: 10,
    order: 100,
    title: "Level — Compressed Wave",
    locked: true,
    password: "TBD",
    challenge: "Complete the compress function.\n\nGiven a string, run-length-encode it: each character followed by its consecutive repeat count, e.g. 'aaabbc' -> 'a3b2c1'.",
    examples: [
      { input: 'compress("aaabbc")', output: "a3b2c1" },
      { input: 'compress("abc")',    output: "a1b1c1" },
      { input: 'compress("")',       output: "(empty)" },
    ],
    description: "Every repeated beat can be folded into one count. Compress the wave without losing its shape.",
    type: "complete",
    starterCode:
`def compress(s):
    # Complete this function
    # Return the run-length-encoded string: each char + its consecutive count
    pass
 
# Public test runner — do not modify
print(compress("aaabbc"))
print(compress("abc"))
print(compress(""))
`,
    starterCodeJS:
`function compress(s) {
    // Complete this function
    // Return the run-length-encoded string: each char + its consecutive count
}
 
// Public test runner — do not modify
console.log(compress("aaabbc"));
console.log(compress("abc"));
console.log(compress(""));
`,
    expectedOutput:   "a3b2c1\na1b1c1\n",
    expectedOutputJS: "a3b2c1\na1b1c1\n",
    songName: "TBD",
    requiredFeatures: ["functions", "loops"],
    hint: "Walk through the string, counting how many times each character repeats in a row before it changes.",
    editorHeight: "380px",
    callTemplate: "compress({args})",
    hiddenTests: [
      { args: ["aabbaa"],     expected: "a2b2a2" },
      { args: ["zzzzz"],      expected: "z5" },
      { args: ["x"],          expected: "x1" },
      { args: ["aabbbccccd"], expected: "a2b3c4d1" },
      { args: ["ababab"],     expected: "a1b1a1b1a1b1" },
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
      drums:  { src: "/audio/PLACEHOLDER_compressed_wave_drums.mp3",  broken: true },
      chords: { src: "/audio/PLACEHOLDER_compressed_wave_chords.mp3", broken: true },
      bass:   { src: "/audio/PLACEHOLDER_compressed_wave_bass.mp3",   broken: true },
      melody: { src: "/audio/PLACEHOLDER_compressed_wave_melody.mp3", broken: true },
    },
  },
  {
    id: 11,
    order: 110,
    title: "Level — Binary Trace",
    locked: true,
    password: "TBD",
    challenge: "Complete the binarySearch function.\n\nGiven a sorted list of integers and a target, return the target's index using binary search. Return -1 if not found.",
    examples: [
      { input: "binarySearch([1,3,5,7,9], 5)", output: "2" },
      { input: "binarySearch([1,3,5,7,9], 1)", output: "0" },
      { input: "binarySearch([1,3,5,7,9], 4)", output: "-1" },
    ],
    description: "Don't scan every signal — cut the search in half each time until the trace locks on.",
    type: "complete",
    starterCode:
`def binarySearch(nums, target):
    # Complete this function using binary search (not a linear loop)
    # Return the index of target, or -1 if not found
    pass

# Public test runner — do not modify
print(binarySearch([1, 3, 5, 7, 9], 5))
print(binarySearch([1, 3, 5, 7, 9], 1))
print(binarySearch([1, 3, 5, 7, 9], 4))
`,
    starterCodeJS:
`function binarySearch(nums, target) {
    // Complete this function using binary search (not a linear loop)
    // Return the index of target, or -1 if not found
}

// Public test runner — do not modify
console.log(binarySearch([1, 3, 5, 7, 9], 5));
console.log(binarySearch([1, 3, 5, 7, 9], 1));
console.log(binarySearch([1, 3, 5, 7, 9], 4));
`,
    expectedOutput:   "2\n0\n-1",
    expectedOutputJS: "2\n0\n-1",
    songName: "TBD",
    requiredFeatures: ["functions", "loops", "conditions"],
    hint: "Keep low/high pointers. Check the middle element: if it's too small, search the right half; too big, search the left half.",
    editorHeight: "380px",
    callTemplate: "binarySearch({args})",
    hiddenTests: [
      { args: [[1,3,5,7,9], 9], expected: 4  },
      { args: [[], 5],          expected: -1 },
      { args: [[2], 2],         expected: 0  },
      { args: [[2], 3],         expected: -1 },
      { args: [[1,2,3,4,5,6,7,8], 8], expected: 7 },
    ],
    criteria: [
      { key: "functions",         layer: "drums",  weight: 20 },
      { key: "loops",             layer: "chords", weight: 20 },
      { key: "no_syntax_error",   layer: "bass",   weight: 20 },
      { key: "all_hidden_passed", layer: "melody", weight: 40 },
    ],
    layerDisplay: {
      drums:  { label: "DRUMS",  desc: "Structure",      color: "var(--accent-cyan)"   },
      chords: { label: "CHORDS", desc: "Iteration",      color: "var(--accent-purple)" },
      bass:   { label: "BASS",   desc: "Clarity",        color: "var(--accent-pink)"   },
      melody: { label: "MELODY", desc: "All tests pass", color: "var(--accent-green)"  },
    },
    layers: {
      drums:  { src: "/audio/PLACEHOLDER_binary_trace_drums.mp3",  broken: true },
      chords: { src: "/audio/PLACEHOLDER_binary_trace_chords.mp3", broken: true },
      bass:   { src: "/audio/PLACEHOLDER_binary_trace_bass.mp3",   broken: true },
      melody: { src: "/audio/PLACEHOLDER_binary_trace_melody.mp3", broken: true },
    },
  },

];






export const orderedLevels = [...levels].sort((a, b) => a.order - b.order);