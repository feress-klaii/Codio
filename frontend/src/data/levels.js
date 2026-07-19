export const levels = [
  {
    id: 0,
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
    // ── Generic scoring criteria ──
    // Each criterion maps a check (key) to an audio layer and a point weight.
    // The backend scores these generically — no per-level code needed.
    criteria: [
      { key: "loops",           layer: "drums",  weight: 35 },
      { key: "no_syntax_error", layer: "chords", weight: 35 },
      { key: "correct_output",  layer: "bass",   weight: 30 },
    ],
    layers: {
      drums:  { src: "/audio/drums0.mp3",  broken: true },
      chords: { src: "/audio/chords0.mp3", broken: true },
      bass:   { src: "/audio/bass0.mp3",   broken: true },
      melody: null,
    },
  },
  {
    id: 1,
    title: "Level 1 — Mirror Logic",
    locked: true,
    password: "THE BEGINNING",
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
    criteria: [
      { key: "correct_output",  layer: "drums",  weight: 30 },
      { key: "conditions",      layer: "chords", weight: 25 },
      { key: "functions",       layer: "bass",   weight: 25 },
      { key: "no_syntax_error", layer: "melody", weight: 20 },
    ],
    layers: {
      drums:  { src: "/audio/drums11.mp3",  broken: true },
      chords: { src: "/audio/chords11.mp3", broken: true },
      bass:   { src: "/audio/bass11.mp3",   broken: true },
      melody: { src: "/audio/melody11.mp3", broken: true }
    },
  },
  {
    id: 2,
    title: "Level 2 — Even Frequency",
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
    hiddenTests: [
      { input: [],           expected: 0   },
      { input: [-2, -4, 1], expected: -6  },
      { input: [0, 1, 2],   expected: 2   },
      { input: [100, 99],   expected: 100 },
      { input: [7, 13, 21], expected: 0   },
      { input: [2, 2, 2],   expected: 6   },
      { input: [-1, -2, -3, -4], expected: -6 },
    ],
    songName: "TBD",
    requiredFeatures: ["loops", "conditions"],
    hint: "Loop through the list and check if each number is divisible by 2 using the % operator.",
    criteria: [
      { key: "loops",             layer: "drums",  weight: 25 },
      { key: "conditions",        layer: "chords", weight: 25 },
      { key: "no_syntax_error",   layer: "bass",   weight: 20 },
      { key: "all_hidden_passed", layer: "melody", weight: 30 },
    ],
    layers: {
      drums:  { src: "/audio/drums2.mp3",  broken: true },
      chords: { src: "/audio/chords2.mp3", broken: true },
      bass:   { src: "/audio/bass2.mp3",   broken: true },
      melody: { src: "/audio/melody2.mp3", broken: true },
    },
  },
];