import { forwardRef, useEffect, useRef, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Paper,
  Slide,
} from "@mui/material";

const wordBank =
  "about|above|add|after|again|air|all|almost|along|also|always|America|an|and|animal|another|answer|any|are";
const dict = wordBank.split("|");

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

function TypingTest() {
  const inputElementRef = useRef();
  const [open, setOpen] = useState(false);
  const [renderedWords, setRenderedWords] = useState();
  const [input, setInput] = useState("");
  const [letterIndex, setLetterIndex] = useState(-1);
  const [wordIndex, setWordIndex] = useState(0);
  const [result, setResult] = useState(
    Array(dict.length).fill({ correctWord: "", userInput: "" }),
  );
  const [timeTaken, setTimeTaken] = useState({ start: -1, end: -1 });
  const [wordsPerMinute, setWordsPerMinute] = useState(-1);

  function generateWords(words) {
    return words.map(function (word, wi) {
      const originalObject = result[wi];
      const correctWord = originalObject.correctWord;
      const userInputWord = originalObject.userInput;

      const wordIndexLessThanCurrentWordIndex = wi < wordIndex;
      const isCorrectWord = correctWord === userInputWord;
      const isCurrentWord = wi === wordIndex;
      const className = `${isCurrentWord ? "bg-zinc-700" : ""} ${wordIndexLessThanCurrentWordIndex ? (isCorrectWord ? "bg-green-500/20" : "bg-red-400/20") : ""}`;

      return (
        <div key={wi} className={`${className} rounded-md px-1`}>
          {Array.from(word).map(function (letter, li) {
            const correctLetter = correctWord[li];
            const userInputLetter = userInputWord[li];
            const isCorrectLetter = correctLetter === userInputLetter;
            const isLetterAttempted = userInputLetter !== undefined || null;
            const letterColor = wordIndexLessThanCurrentWordIndex
              ? isCorrectLetter
                ? "text-green-400"
                : "text-red-300"
              : isCurrentWord && isLetterAttempted
                ? isCorrectLetter
                  ? "text-green-300"
                  : "text-red-300"
                : "";

            return (
              <span key={li} className={letterColor}>
                {letter === " " ? "\u00A0" : letter}
              </span>
            );
          })}
        </div>
      );
    });
  }

  function restartRound() {
    resetRoundStats();
    inputElementRef.current?.focus();
  }

  function resetRoundStats() {
    setLetterIndex(-1);
    setWordIndex(0);
    setInput("");
    setResult(function (prev) {
      const copy = prev.map((obj) => ({ ...obj }));
      for (let i = 0; i < dict.length; ++i) {
        copy[i].correctWord = "";
        copy[i].userInput = "";
      }
      return copy;
    });
    setRenderedWords(generateWords(dict));
    setTimeTaken({ start: -1, end: -1 });
    initializeResult();
  }

  function handleKeyDown(e) {
    if (wordIndex >= dict.length) {
      return;
    }
    const key = e.key;
    if (e.metaKey || e.ctrlKey) {
      return;
    }

    if (!/^[a-zA-Z]$/.test(key)) {
      if (input.length === 0) {
        e.preventDefault();
        return;
      }
    }
    if (key === " ") {
      e.preventDefault();
      setLetterIndex(-1);
      setWordIndex((prev) => prev + 1);
      setInput("");
    }
    if (timeTaken.start === -1) {
      setTimeTaken((prev) => ({ start: Date.now(), end: prev.end }));
    }
  }

  function handleInputChange(e) {
    if (wordIndex >= dict.length) {
      return;
    }
    const userInput = e.target.value;
    setInput(userInput);
    setLetterIndex(userInput.length - 1);
    setResult(function (prev) {
      const copy = [...prev];
      copy[wordIndex].userInput = userInput;
      return copy;
    });
  }

  function handleClose() {
    restartRound();
    setOpen(false);
  }

  function initializeResult() {
    setResult(function (prev) {
      const copy = prev.map((obj) => ({ ...obj }));
      for (let i = 0; i < dict.length; ++i) {
        copy[i].correctWord = dict[i];
      }
      return copy;
    });
  }

  useEffect(() => {
    initializeResult();
    inputElementRef.current?.focus();
  }, []);

  useEffect(() => {
    setRenderedWords(generateWords(dict));
  }, [result]);

  function calculateTimeInSeconds() {
    const { start, end } = timeTaken;
    if (start !== -1 && end !== -1) {
      return (end - start) / 1000;
    }
    return null;
  }

  // Following the MonkeyType formula from their info page + count spaces too (from ChatGPT)
  function calculateWordsPerMinute(time) {
    let totalLettersInCorrectWords = 0;
    for (let i = 0; i < dict.length; ++i) {
      const userInputWord = result[i].userInput;
      const correctWord = dict[i];
      if (userInputWord === correctWord) {
        totalLettersInCorrectWords += correctWord.length;
        if (i < dict.length - 1) {
          totalLettersInCorrectWords += 1; // count a space after each word
        }
      }
    }
    return (totalLettersInCorrectWords * 60) / (5 * time);
  }

  useEffect(() => {
    if (wordIndex >= dict.length) {
      if (timeTaken.end === -1) {
        setTimeTaken((prev) => ({ start: prev.start, end: Date.now() }));
      }
      const timeInSeconds = calculateTimeInSeconds();
      if (!timeInSeconds) {
        return;
      }
      const wpm = calculateWordsPerMinute(timeInSeconds);
      console.log(wpm, timeInSeconds);
      setWordsPerMinute(wpm.toFixed(2));
      setOpen(true);
    }
    setRenderedWords(generateWords(dict));
  }, [wordIndex, letterIndex, timeTaken.end]);

  return (
    <>
      <div
        className={
          "flex flex-col gap-4 w-full min-w-full md:min-w-[750px] max-w-[900px] font-mono"
        }
      >
        <Paper
          elevation={5}
          className={
            "p-4 bg-zinc-800 rounded-lg flex flex-wrap gap-1.5 text-lg"
          }
        >
          {renderedWords}
        </Paper>
        <input
          ref={inputElementRef}
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          type="text"
          className={
            "px-3 py-2 rounded-lg font-mono bg-inherit border-2 border-zinc-400 outline-none"
          }
        />
        <Button
          variant={"contained"}
          onClick={restartRound}
          className={"w-fit h-fit self-center"}
        >
          Restart
        </Button>
      </div>
      <Dialog
        open={open}
        TransitionComponent={Transition}
        keepMounted
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle>{"Race Complete!"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-slide-description">
            Words per Minute: {wordsPerMinute}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Restart</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default TypingTest;
