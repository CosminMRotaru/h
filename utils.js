import { words } from "./words";

export function getRandomWord() {
    const randomIndex = Math.floor(Math.random() * words.length);
    return words[randomIndex];
}

const customQuotes = {
    "HTML": "I always felt... empty inside. Like a div without content.",
    "CSS": "Guess specificity wins again.",
    "JavaScript": "Maybe I should’ve used triple equals...",
    "React": "No more hooks... only regrets.",
    "TypeScript": "Turns out types can't save you either.",
    "Node.js": "Server crashed... permanently.",
    "Python": "IndentationError: Developer lost.",
    "Ruby": "Even elegance can’t escape fate.",
    "Assembly": "01000011 01111001 01100001... 🪦"
};

export function getFarewellText(language) {
    return customQuotes[language] || `Farewell, ${language}`;
}
