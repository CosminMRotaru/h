import { useState, useEffect } from "react";
import { clsx } from "clsx";
import { languages } from "./languages";
import { getFarewellText, getRandomWord } from "./utils";
import { words } from "./words";
import Confetti from "react-confetti";

export default function HangDev() {
    const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark");

    useEffect(() => {
        document.body.className = "";
        document.body.classList.add(theme === "light" ? "light-theme" : "dark-theme");
        localStorage.setItem("theme", theme);
    }, [theme]);

    const [currentWord, setCurrentWord] = useState(() => {
        const stored = localStorage.getItem("currentWord");
        return stored || getRandomWord(words);
    });

    const [guessedLetters, setGuessedLetters] = useState(() => {
        const stored = localStorage.getItem("guessedLetters");
        return stored ? JSON.parse(stored) : [];
    });

    useEffect(() => {
        localStorage.setItem("currentWord", currentWord);
    }, [currentWord]);

    useEffect(() => {
        localStorage.setItem("guessedLetters", JSON.stringify(guessedLetters));
    }, [guessedLetters]);

    const alphabet = "abcdefghijklmnopqrstuvwxyz";

    const numGuessesLeft = languages.length - 1;
    const wrongGuessCount = guessedLetters.filter(letter => !currentWord.includes(letter)).length;
    const isGameWon = currentWord.split("").every(letter => guessedLetters.includes(letter));
    const isGameLost = wrongGuessCount >= numGuessesLeft;
    const isGameOver = isGameWon || isGameLost;
    const lastGuessedLetter = guessedLetters[guessedLetters.length - 1];
    const isLastGuessIncorrect = lastGuessedLetter && !currentWord.includes(lastGuessedLetter);

    function addGuessedLetter(letter) {
        setGuessedLetters(prev => prev.includes(letter) ? prev : [...prev, letter]);
    }

    function startNewGame() {
        const newWord = getRandomWord(words);
        setCurrentWord(newWord);
        setGuessedLetters([]);
    }

    useEffect(() => {
        function handleKeydown(e) {
            const letter = e.key.toLowerCase();
            if (alphabet.includes(letter) && !isGameOver) {
                addGuessedLetter(letter);
            }
        }
        window.addEventListener("keydown", handleKeydown);
        return () => window.removeEventListener("keydown", handleKeydown);
    }, [guessedLetters, isGameOver]);

    const languageElements = languages.map((lang, index) => {
        const isLost = index < wrongGuessCount;
        const styles = {
            backgroundColor: lang.backgroundColor,
            color: lang.color,
        };
        const className = clsx("chip", isLost && "lost");
        return (
            <span className={className} style={styles} key={lang.name}>
                {lang.name}
            </span>
        );
    });

    const letterElements = currentWord.split("").map((letter, i) => {
        const isVisible = isGameLost || guessedLetters.includes(letter);
        const className = clsx(
            "word-letter",
            isGameLost && !guessedLetters.includes(letter) && "missed-letter"
        );
        return (
            <span className={className} key={i}>
                {isVisible ? letter.toUpperCase() : ""}
            </span>
        );
    });

    const keyboardElements = alphabet.split("").map(letter => {
        const isGuessed = guessedLetters.includes(letter);
        const isCorrect = isGuessed && currentWord.includes(letter);
        const isWrong = isGuessed && !currentWord.includes(letter);

        const className = clsx("key", {
            correct: isCorrect,
            wrong: isWrong,
        });

        return (
            <button
                key={letter}
                className={className}
                disabled={isGameOver}
                aria-disabled={isGuessed}
                onClick={() => addGuessedLetter(letter)}
                aria-label={`Letter ${letter}`}
            >
                {letter.toUpperCase()}
            </button>
        );
    });

    const gameStatusClass = clsx("game-status", {
        won: isGameWon,
        lost: isGameLost,
        farewell: !isGameOver && isLastGuessIncorrect,
    });

    function renderStatus() {
        if (!isGameOver && isLastGuessIncorrect) {
            return (
                <p className="farewell-message">
                    {getFarewellText(languages[wrongGuessCount - 1]?.name)}
                </p>
            );
        }
        if (isGameWon) {
            return (
                <>
                    <h2>Victory!</h2>
                    <p>Console.log('Victory')🎉</p>
                </>
            );
        }
        if (isGameLost) {
            return (
                <>
                    <h2>Defeat!</h2>
                    <p>Stack overflowed... and so did your chances.</p>
                </>
            );
        }
        return null;
    }

    return (
        <main className="hangdev-main">
            {isGameWon && <Confetti numberOfPieces={800} recycle={false} />}

            <header className="hangdev-header">
                <h1 className="hangdev-title">HangDev</h1>
                <p className="hangdev-subtitle">
                    Guess the word. Save the language. Or it`s gone` 💀
                </p>
                <div className="control-bar">
                    <button className="new-game" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                        Toggle {theme === "dark" ? "Light" : "Dark"} Mode
                    </button>
                    <button className="new-game" onClick={startNewGame}>
                        Start New Game
                    </button>
                </div>
            </header>

            <section className={gameStatusClass} aria-live="polite" role="status">
                {renderStatus()}
            </section>

            <section className="language-chips">{languageElements}</section>

            <section className="word">{letterElements}</section>

            <section className="sr-only" aria-live="polite" role="status">
                <p>
                    {currentWord.includes(lastGuessedLetter)
                        ? `Correct! The letter ${lastGuessedLetter} is in the word.`
                        : `Sorry, the letter ${lastGuessedLetter} is not in the word.`}
                    You have {numGuessesLeft} attempts left.
                </p>
                <p>
                    Current word:{" "}
                    {currentWord
                        .split("")
                        .map(l =>
                            guessedLetters.includes(l) ? l + "." : "blank."
                        )
                        .join(" ")}
                </p>
            </section>

            <section className="keyboard">{keyboardElements}</section>
        </main>
    );
}
