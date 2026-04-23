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
    expectedOutput: "0\n1\n2\n3\n4",
    songName: "THE BEGINNING",
    requiredFeatures: ["loops"],
    hint: "Try using a for loop with range().",
    // Audio layers for this level
    layers: {
      drums:  { src: "/audio/drums.wav",  broken: true  },
      chords: { src: "/audio/chords.mp3", broken: true  },
      bass:   { src: "/audio/bass.wav",   broken: true  },
      melody: null, // no melody layer for level 0
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
    expectedOutput: "True\nFalse\nFalse",
    songName: "CYBERPATH",
    requiredFeatures: ["functions", "conditions"],
    hint: "Convert x to a string and compare it to its reverse. Negative numbers are never palindromes.",
    // Audio layers for this level — fill in src paths once you have the files
    layers: {
      drums:  { src: "/audio/l1_drums.wav",  broken: true  },
      chords: { src: "/audio/l1_chords.wav", broken: true  },
      bass:   { src: "/audio/l1_bass.wav",   broken: true  },
      melody: { src: "/audio/l1_melody.wav", broken: true  },
    },
  },
];