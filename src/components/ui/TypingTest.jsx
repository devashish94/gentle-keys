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
  useMediaQuery,
  useTheme,
} from "@mui/material";

const wordBank =
  "about|above|add|after|again|air|all|almost|along|also|always|America|an|and|animal|another|answer|any|are";
const dict = wordBank.split("|");

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const MAX_INCORRECT_LETTERS_SHOWN = 7;

function TypingTest() {
  const inputElementRef = useRef();
  const [open, setOpen] = useState(false);
  const [renderedWords, setRenderedWords] = useState([]);
  const [input, setInput] = useState("");
  const [letterIndex, setLetterIndex] = useState(-1);
  const [wordIndex, setWordIndex] = useState(0);
  const [result, setResult] = useState(
    Array(dict.length).fill({ correctWord: "", userInput: "", time: -1 }),
  );
  const [timeTaken, setTimeTaken] = useState({ start: -1, end: -1 });
  const [wordsPerMinute, setWordsPerMinute] = useState(-1);

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  function generateWords(result) {
    return result.map(function (resultItem, wi) {
      const correctWord = resultItem.correctWord;
      const userInputWord = resultItem.userInput;
      const wordIndexLessThanCurrentWordIndex = wi < wordIndex;
      const isCorrectWord = correctWord === userInputWord;
      const isCurrentWord = wi === wordIndex;
      const className = `${isCurrentWord ? "bg-zinc-700" : ""} ${wordIndexLessThanCurrentWordIndex ? (isCorrectWord ? "bg-green-500/20" : "bg-red-400/20") : ""}`;

      return (
        <div key={wi} className={`${className} rounded-md px-1`}>
          {Array.from(
            userInputWord.length < correctWord.length
              ? correctWord
              : userInputWord,
          ).map(function (ambiguousLetter, li) {
            const correctLetter = correctWord[li];
            const userInputLetter = userInputWord[li];
            const isCorrectLetter = correctLetter === userInputLetter;
            const isLetterAttempted = userInputLetter !== undefined || null;
            const displayLetter =
              li < correctWord.length ? correctWord[li] : userInputWord[li];

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
                {displayLetter === " " ? "\u00A0" : displayLetter}
              </span>
            );
          })}
        </div>
      );
    });
  }

  function handleClose() {
    setOpen(() => false);
    shuffleAndInitialize();
    setTimeout(() => inputElementRef.current?.focus(), 250);
  }

  function restartRound() {
    shuffleAndInitialize();
    inputElementRef.current?.focus();
  }

  function shuffleAndInitialize() {
    const shuffledWords = [...dict];
    shuffleArray(shuffledWords);

    const newResult = shuffledWords.map((word) => ({
      correctWord: word,
      userInput: "",
      time: -1,
    }));

    setResult(newResult);
    setRenderedWords(generateWords(newResult));
    setInput("");
    setLetterIndex(-1);
    setWordIndex(0);
    setTimeTaken({ start: -1, end: -1 });
    setWordsPerMinute(-1);
  }

  function handleKeyDown(e) {
    if (wordIndex >= result.length) {
      return;
    }
    const key = e.key;
    if (e.metaKey || e.ctrlKey) {
      return;
    }

    if (!/^[a-zA-Z]$/.test(key)) {
      const allowedKeysAtRoundStart = ["Tab"];
      if (allowedKeysAtRoundStart.includes(key)) {
        return;
      }
      if (input.length === 0) {
        e.preventDefault();
        return;
      }
    }
    if (key === " ") {
      e.preventDefault();
      setLetterIndex(-1);
      setResult(function (prev) {
        const copy = prev.map((obj) => ({ ...obj }));
        copy[wordIndex].time = performance.now() - copy[wordIndex].time;
        return copy;
      });
      setWordIndex((prev) => prev + 1);
      setInput("");
    }
    if (timeTaken.start === -1) {
      setTimeTaken((prev) => ({ start: performance.now(), end: prev.end }));
    }
  }

  function handleInputChange(e) {
    if (wordIndex >= result.length) {
      return;
    }
    const userInput = e.target.value;
    if (
      userInput.length >
      result[wordIndex].correctWord.length + MAX_INCORRECT_LETTERS_SHOWN
    ) {
      return;
    }
    setInput(userInput);
    setLetterIndex(userInput.length - 1);
    setResult(function (prev) {
      const copy = prev.map((obj) => ({ ...obj }));
      copy[wordIndex].userInput = userInput;
      if (letterIndex === -1 && copy[wordIndex].time === -1) {
        copy[wordIndex].time = performance.now();
      }
      return copy;
    });
  }

  function shuffleArray(array) {
    let m = array.length;
    while (m) {
      const i = Math.floor(Math.random() * m--);
      const t = array[m];
      array[m] = array[i];
      array[i] = t;
    }
    return array;
  }

  useEffect(() => {
    shuffleAndInitialize();
    inputElementRef.current?.focus();
  }, []);

  useEffect(() => {
    setRenderedWords(generateWords(result));
  }, [result]);

  function calculateTimeInSeconds() {
    const { start, end } = timeTaken;
    if (start !== -1 && end !== -1) {
      return (end - start) / 1000;
    }
    return null;
  }

  // Following the MonkeyType formula from their info page + count spaces too (from ChatGPT)
  function calculateWordsPerMinute(time, result) {
    let totalLettersInCorrectWords = 0;
    for (let i = 0; i < result.length; ++i) {
      const userInputWord = result[i].userInput;
      const correctWord = result[i].correctWord;
      if (userInputWord === correctWord) {
        totalLettersInCorrectWords += correctWord.length;
        if (i < result.length - 1) {
          totalLettersInCorrectWords += 1; // count a space after each word
        }
      }
    }
    return (totalLettersInCorrectWords * 60) / (5 * time);
  }

  useEffect(() => {
    if (wordIndex >= result.length) {
      if (timeTaken.end === -1) {
        setTimeTaken((prev) => ({ start: prev.start, end: performance.now() }));
      }
      const timeInSeconds = calculateTimeInSeconds();
      if (!timeInSeconds) {
        return;
      }
      const wpm = calculateWordsPerMinute(timeInSeconds, result);
      console.log(
        "WPM:",
        wpm.toFixed(3),
        "Time Taken:",
        timeInSeconds.toFixed(3),
        "sec",
      );
      setWordsPerMinute(wpm.toFixed(2));
      inputElementRef.current?.blur();
      setOpen(true);
    }
    setRenderedWords(generateWords(result));
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
        fullScreen={fullScreen}
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
