import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, AlertTriangle, CheckCircle, XCircle, Loader } from "lucide-react";

const SURVEY_QUESTIONS = [
  {
    id: 1,
    question: "What's your stance on the topic before the debate starts?",
    placeholder: "Describe your initial opinion honestly...",
  },
  {
    id: 2,
    question: "What's one strong argument you'd expect from the opposing side?",
    placeholder: "Think critically here...",
  },
  {
    id: 3,
    question: "How do you typically handle disagreements in discussions?",
    placeholder: "Be honest about your debate style...",
  },
  {
    id: 4,
    question: "What would change your mind on this topic?",
    placeholder: "What evidence or argument would make you reconsider...",
  },
  {
    id: 5,
    question: "Why do you want to watch this debate? What are you hoping to learn?",
    placeholder: "What's drawing you to this topic...",
  },
];

const MIN_ANSWER_LENGTH = 15;

export default function SurveyScreen({ topic, onComplete, onBack }) {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState(Array(5).fill(""));
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState(null); // null | 'pass' | 'fail'
  const [failReason, setFailReason] = useState("");

  const currentAnswer = answers[currentQ] || "";
  const canProceed = currentAnswer.trim().length >= MIN_ANSWER_LENGTH;
  const isLast = currentQ === SURVEY_QUESTIONS.length - 1;

  const handleAnswer = (val) => {
    const newAnswers = [...answers];
    newAnswers[currentQ] = val;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (!canProceed) return;
    if (isLast) {
      runBSCheck();
    } else {
      setCurrentQ(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentQ > 0) {
      setCurrentQ(prev => prev - 1);
    } else {
      onBack();
    }
  };

  const runBSCheck = () => {
    setValidating(true);
    setValidationResult(null);

    // Client-side BS detection heuristics
    setTimeout(() => {
      let bsScore = 0;
      const allText = answers.join(" ").toLowerCase();

      // Check for repetitive garbage
      for (let i = 0; i < answers.length; i++) {
        const a = answers[i].trim().toLowerCase();
        // Too short after trim
        if (a.length < 20) bsScore += 2;
        // Repeated characters (aaaaaa, asdasd)
        if (/(.)\1{4,}/.test(a)) bsScore += 3;
        // Same word repeated (test test test)
        const words = a.split(/\s+/);
        const uniqueWords = new Set(words);
        if (words.length > 3 && uniqueWords.size <= 2) bsScore += 3;
        // Classic spam (asdf, qwerty, etc)
        if (/^(asdf|qwerty|test|aaa|bbb|123|abc|xxx|lol|idk|ok|yes|no|blah|whatever|nothing|none|na|n\/a)/i.test(a)) bsScore += 2;
        // Basically same answer for all questions
        for (let j = i + 1; j < answers.length; j++) {
          if (a === answers[j].trim().toLowerCase() && a.length > 0) bsScore += 3;
        }
      }

      // Check if answers are contextually empty
      const totalLen = answers.reduce((sum, a) => sum + a.trim().length, 0);
      if (totalLen < 100) bsScore += 2;

      if (bsScore >= 5) {
        setValidationResult("fail");
        setFailReason(
          bsScore >= 8
            ? "Your answers look like complete nonsense. The BS Verificator has spoken. Try again with actual thoughts."
            : "Some of your answers seem low-effort or repetitive. Put in a bit more thought and try again."
        );
      } else {
        setValidationResult("pass");
        setTimeout(() => onComplete(answers), 1500);
      }
      setValidating(false);
    }, 2000);
  };

  const handleRetry = () => {
    setValidationResult(null);
    setCurrentQ(0);
  };

  const q = SURVEY_QUESTIONS[currentQ];
  const progress = ((currentQ + 1) / SURVEY_QUESTIONS.length) * 100;

  // Validation screen
  if (validating || validationResult) {
    return (
      <div className="survey">
        <motion.div
          className="survey__validation"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          {validating && (
            <div className="survey__validating">
              <div className="survey__bs-icon">
                <Loader size={32} className="survey__spinner" />
              </div>
              <div className="survey__bs-title">BS Verificator</div>
              <div className="survey__bs-sub">Analyzing your responses...</div>
              <div className="survey__bs-bar">
                <motion.div
                  className="survey__bs-bar-fill"
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1.8, ease: "linear" }}
                />
              </div>
            </div>
          )}

          {validationResult === "pass" && (
            <motion.div className="survey__result survey__result--pass" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <CheckCircle size={48} />
              <div className="survey__result-title">You're in!</div>
              <div className="survey__result-sub">Your responses passed the BS check. Starting debate...</div>
            </motion.div>
          )}

          {validationResult === "fail" && (
            <motion.div className="survey__result survey__result--fail" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <XCircle size={48} />
              <div className="survey__result-title">BS Detected</div>
              <div className="survey__result-sub">{failReason}</div>
              <button className="btn-primary" onClick={handleRetry} style={{ marginTop: 24 }}>
                Try again
              </button>
            </motion.div>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="survey">
      <div className="survey__header">
        <button className="btn-ghost" onClick={handleBack}>
          <ArrowLeft size={18} />
        </button>
        <div className="survey__progress-wrap">
          <div className="survey__progress-bar">
            <motion.div
              className="survey__progress-fill"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
          <span className="survey__progress-text">{currentQ + 1}/{SURVEY_QUESTIONS.length}</span>
        </div>
      </div>

      <div className="survey__topic-badge">
        <AlertTriangle size={12} />
        <span>{topic}</span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQ}
          className="survey__body"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
        >
          <div className="survey__q-number">Question {currentQ + 1}</div>
          <h2 className="survey__question">{q.question}</h2>
          <textarea
            className="survey__textarea"
            value={currentAnswer}
            onChange={e => handleAnswer(e.target.value)}
            placeholder={q.placeholder}
            rows={4}
            autoFocus
          />
          <div className="survey__char-info">
            <span className={currentAnswer.trim().length < MIN_ANSWER_LENGTH ? "survey__char-warn" : "survey__char-ok"}>
              {currentAnswer.trim().length < MIN_ANSWER_LENGTH
                ? `${MIN_ANSWER_LENGTH - currentAnswer.trim().length} more characters needed`
                : "Good to go"}
            </span>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="survey__footer">
        <motion.button
          className="btn-primary"
          onClick={handleNext}
          disabled={!canProceed}
          whileTap={canProceed ? { scale: 0.97 } : {}}
          style={{ width: "100%", padding: "16px 0", fontSize: 16 }}
        >
          {isLast ? "Submit to BS Verificator" : "Next"}
          <ArrowRight size={18} />
        </motion.button>
      </div>
    </div>
  );
}
