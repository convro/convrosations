import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, CheckCircle, XCircle, Loader } from "lucide-react";

const LIDL_LOGO = "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftoppng.com%2Fuploads%2Fpreview%2Flidl-vector-logo-download-free-11574087712loacquwwxp.png&f=1&nofb=1&ipt=b916ba89441fba319473d609cf3d2ddc9bbd9526b5816e93ffa81f25bd14da1b";
const INPOST_LOGO = "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fimages.seeklogo.com%2Flogo-png%2F52%2F1%2Finpost-logo-png_seeklogo-526687.png&f=1&nofb=1&ipt=dc162b68ac543f44e0e95eb87f2efdbca261c974c3bd78b4fa65b337c074ffbb";

const STATIC_QUESTIONS = [
  {
    id: 1,
    question: "How often do you shop at Lidl and what's your go-to item you always grab?",
    placeholder: "Tell us about your Lidl shopping habits...",
    sponsor: "lidl",
  },
  {
    id: 2,
    question: "When was the last time you used an InPost paczkomat and how was the experience?",
    placeholder: "Share your InPost parcel locker experience...",
    sponsor: "inpost",
  },
  {
    id: 3,
    question: "What's your favorite Lidl weekly special you've ever scored? The bakery counts too!",
    placeholder: "That one deal you still think about...",
    sponsor: "lidl",
  },
];

const MIN_ANSWER_LENGTH = 15;
const TOTAL_QUESTIONS = 6;

export default function SurveyScreen({ topic, onComplete, onBack, send, on }) {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState(Array(TOTAL_QUESTIONS).fill(""));
  const [allQuestions, setAllQuestions] = useState(STATIC_QUESTIONS);
  const [loadingAIQuestions, setLoadingAIQuestions] = useState(false);
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState(null);
  const [failReason, setFailReason] = useState("");

  const currentAnswer = answers[currentQ] || "";
  const canProceed = currentAnswer.trim().length >= MIN_ANSWER_LENGTH;
  const isLast = currentQ === allQuestions.length - 1 && allQuestions.length === TOTAL_QUESTIONS;
  const q = allQuestions[currentQ];
  const progress = ((currentQ + 1) / TOTAL_QUESTIONS) * 100;

  // Listen for AI-generated questions from server
  useEffect(() => {
    if (!on) return;
    on("survey_questions", ({ questions }) => {
      const aiQs = questions.map((q, i) => ({
        id: 4 + i,
        question: q.question,
        placeholder: q.placeholder,
        sponsor: i === 0 ? "lidl" : i === 2 ? "inpost" : null,
      }));
      setAllQuestions(prev => [...STATIC_QUESTIONS, ...aiQs]);
      setLoadingAIQuestions(false);
    });

    on("survey_validation", ({ pass, reason }) => {
      if (pass) {
        setValidationResult("pass");
        setTimeout(() => onComplete(answers), 1500);
      } else {
        setValidationResult("fail");
        setFailReason(reason || "Your answers didn't pass the BS check. Try harder.");
      }
      setValidating(false);
    });
  }, [on, answers, onComplete]);

  const handleAnswer = (val) => {
    const newAnswers = [...answers];
    newAnswers[currentQ] = val;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (!canProceed) return;

    // After completing 3 static questions, request AI questions
    if (currentQ === 2 && allQuestions.length === 3) {
      setLoadingAIQuestions(true);
      send?.({
        type: "generate_survey_questions",
        previousAnswers: answers.slice(0, 3),
        language: "en",
      });
      return;
    }

    if (isLast) {
      runValidation();
    } else {
      setCurrentQ(prev => prev + 1);
    }
  };

  // Auto-advance when AI questions arrive
  useEffect(() => {
    if (!loadingAIQuestions && allQuestions.length === TOTAL_QUESTIONS && currentQ === 2) {
      setCurrentQ(3);
    }
  }, [loadingAIQuestions, allQuestions.length, currentQ]);

  const handleBack = () => {
    if (currentQ > 0) {
      setCurrentQ(prev => prev - 1);
    } else {
      onBack();
    }
  };

  const runValidation = () => {
    setValidating(true);
    setValidationResult(null);

    // First do client-side heuristic check
    let bsScore = 0;
    for (let i = 0; i < answers.length; i++) {
      const a = answers[i].trim().toLowerCase();
      if (a.length < 20) bsScore += 2;
      if (/(.)\1{4,}/.test(a)) bsScore += 3;
      const words = a.split(/\s+/);
      const uniqueWords = new Set(words);
      if (words.length > 3 && uniqueWords.size <= 2) bsScore += 3;
      if (/^(asdf|qwerty|test|aaa|bbb|123|abc|xxx|lol|idk|ok|yes|no|blah|whatever|nothing|none|na|n\/a)/i.test(a)) bsScore += 2;
      for (let j = i + 1; j < answers.length; j++) {
        if (a === answers[j].trim().toLowerCase() && a.length > 0) bsScore += 3;
      }
    }

    if (bsScore >= 6) {
      setTimeout(() => {
        setValidating(false);
        setValidationResult("fail");
        setFailReason(bsScore >= 10
          ? "Your answers are complete garbage. The BS Verificator is not amused. Try writing actual thoughts."
          : "Some of your answers seem low-effort or repetitive. Put in more thought.");
      }, 2000);
      return;
    }

    // Then send to AI for deeper validation
    if (send) {
      // Send questions AND answers as pairs so AI knows context
      const qaPairs = allQuestions.map((q, i) => ({
        question: q.question,
        answer: answers[i] || "",
      })).filter(qa => qa.answer.trim().length > 0);

      send({
        type: "validate_survey",
        qaPairs,
        language: "en",
      });
    } else {
      // Fallback if no send
      setTimeout(() => {
        setValidating(false);
        setValidationResult("pass");
        setTimeout(() => onComplete(answers), 1500);
      }, 2000);
    }
  };

  const handleRetry = () => {
    setValidationResult(null);
    setCurrentQ(0);
  };

  // Loading AI questions screen
  if (loadingAIQuestions) {
    return (
      <div className="survey">
        <motion.div className="survey__validation" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="survey__validating">
            <Loader size={32} className="survey__spinner" />
            <div className="survey__bs-title">Generating questions...</div>
            <div className="survey__bs-sub">AI is crafting personalized follow-ups based on your answers</div>
            <div className="survey__bs-bar">
              <motion.div className="survey__bs-bar-fill" initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 4, ease: "linear" }} />
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Validation screen
  if (validating || validationResult) {
    return (
      <div className="survey">
        <motion.div className="survey__validation" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}>
          {validating && (
            <div className="survey__validating">
              <Loader size={32} className="survey__spinner" />
              <div className="survey__bs-title">BS Verificator</div>
              <div className="survey__bs-sub">Analyzing your responses...</div>
              <div className="survey__bs-bar">
                <motion.div className="survey__bs-bar-fill" initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 3, ease: "linear" }} />
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
              <button className="btn-primary" onClick={handleRetry} style={{ marginTop: 24 }}>Try again</button>
            </motion.div>
          )}
        </motion.div>
      </div>
    );
  }

  if (!q) return null;

  return (
    <div className="survey">
      <div className="survey__header">
        <button className="btn-ghost" onClick={handleBack}>
          <ArrowLeft size={18} />
        </button>
        <div className="survey__progress-wrap">
          <div className="survey__progress-bar">
            <motion.div className="survey__progress-fill" animate={{ width: `${progress}%` }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }} />
          </div>
          <span className="survey__progress-text">{currentQ + 1}/{TOTAL_QUESTIONS}</span>
        </div>
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
          <div className="survey__bottom-row">
            <div className="survey__char-info">
              <span className={currentAnswer.trim().length < MIN_ANSWER_LENGTH ? "survey__char-warn" : "survey__char-ok"}>
                {currentAnswer.trim().length < MIN_ANSWER_LENGTH
                  ? `${MIN_ANSWER_LENGTH - currentAnswer.trim().length} more characters needed`
                  : "Good to go"}
              </span>
            </div>
            {q.sponsor && (
              <div className="survey__sponsor">
                <span className="survey__sponsor-text">sponsored by</span>
                <img
                  src={q.sponsor === "lidl" ? LIDL_LOGO : INPOST_LOGO}
                  alt={q.sponsor}
                  className="survey__sponsor-logo"
                />
              </div>
            )}
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
