import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, ChevronRight, XCircle, CheckCircle2, AlertCircle, Award, RefreshCw, Volume2 } from 'lucide-react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ─── Evaluator ───────────────────────────────────────────────────
const evaluateAnswer = async (question, userAnswer, idealAnswer, topic) => {
  const skipPhrases = [
    "i don't know", "i dont know", "i do not know",
    "no", "i can't", "i cannot", "i have no idea",
    "not sure", "don't know", "no idea", "pass", "skip"
  ];
  const lower = userAnswer.trim().toLowerCase();
  const isSkipped = skipPhrases.some(p => lower === p || lower.startsWith(p + ' ') || lower.startsWith(p + '.'));

  if (isSkipped) {
    return {
      score: 0,
      status: 'skipped',
      good: '',
      missing: 'No answer provided.',
      modelAnswer: idealAnswer,
      feedback: "No answer given. Study the model answer below.",
      offTopic: false
    };
  }

  try {
    const res = await axios.post(`${API_BASE}/interview/evaluate`, {
      question, userAnswer, idealAnswer, topic
    });
    return res.data;
  } catch {
    // Fallback client-side basic eval
    const words = idealAnswer.toLowerCase().split(/\s+/);
    const ansWords = lower.split(/\s+/);
    const matches = words.filter(w => w.length > 4 && ansWords.includes(w)).length;
    const score = Math.min(10, Math.max(1, Math.round((matches / Math.max(words.length, 1)) * 20)));
    return {
      score,
      status: 'answered',
      good: score >= 5 ? 'Covered some key points.' : 'Attempted an answer.',
      missing: score < 7 ? 'Could be more detailed and precise.' : '',
      modelAnswer: idealAnswer,
      feedback: score >= 7 ? 'Good answer!' : 'Review the model answer.',
      offTopic: false
    };
  }
};

// ─── Main Component ───────────────────────────────────────────────
const VoiceInterview = ({ questions: rawQuestions, topic, onClose }) => {
  const questions = rawQuestions.slice(0, 10);
  const total = questions.length;

  const STAGES = { INTRO: 'intro', QUESTION: 'question', REVIEWING: 'reviewing', REPORT: 'report' };
  const [stage, setStage] = useState(STAGES.INTRO);
  const [current, setCurrent] = useState(0);
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimText, setInterimText] = useState('');
  const [results, setResults] = useState([]);
  const [evaluating, setEvaluating] = useState(false);
  const [currentResult, setCurrentResult] = useState(null);
  const [timer, setTimer] = useState(120);
  const [timerActive, setTimerActive] = useState(false);

  const recognitionRef = useRef(null);
  const timerRef = useRef(null);
  const finalTranscriptRef = useRef('');

  const currentQ = questions[current];

  // ── Timer ──
  useEffect(() => {
    if (timerActive && timer > 0) {
      timerRef.current = setTimeout(() => setTimer(t => t - 1), 1000);
    } else if (timerActive && timer === 0) {
      stopRecording();
    }
    return () => clearTimeout(timerRef.current);
  }, [timerActive, timer]);

  // ── Speech Recognition ──
  const startRecording = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert('Speech recognition not supported. Use Chrome.'); return; }

    finalTranscriptRef.current = '';
    setTranscript('');
    setInterimText('');

    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'en-US';

    rec.onresult = (e) => {
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) {
          finalTranscriptRef.current += e.results[i][0].transcript + ' ';
        } else {
          interim += e.results[i][0].transcript;
        }
      }
      setTranscript(finalTranscriptRef.current);
      setInterimText(interim);
    };

    rec.onerror = (e) => {
      if (e.error !== 'no-speech') console.error('Speech error:', e.error);
    };

    rec.start();
    recognitionRef.current = rec;
    setRecording(true);
    setTimer(120);
    setTimerActive(true);
  };

  const stopRecording = () => {
    recognitionRef.current?.stop();
    setRecording(false);
    setTimerActive(false);
    clearTimeout(timerRef.current);
  };

  const handleSubmitAnswer = async () => {
    stopRecording();
    const answer = (finalTranscriptRef.current + interimText).trim() || transcript.trim();
    if (!answer) { alert('No answer detected. Please speak clearly.'); return; }

    setEvaluating(true);
    setCurrentResult(null);

    const idealAnswer = currentQ.answer || currentQ.idealAnswer || currentQ.ideal_answer || '';
    const result = await evaluateAnswer(currentQ.question, answer, idealAnswer, topic);
    result.question = currentQ.question;
    result.userAnswer = answer;
    result.idealAnswer = idealAnswer;
    result.qIndex = current;

    setCurrentResult(result);
    setResults(prev => [...prev, result]);
    setEvaluating(false);
    setStage(STAGES.REVIEWING);
  };

  const handleNext = () => {
    if (current + 1 >= total) {
      setStage(STAGES.REPORT);
    } else {
      setCurrent(c => c + 1);
      setTranscript('');
      setInterimText('');
      finalTranscriptRef.current = '';
      setCurrentResult(null);
      setStage(STAGES.QUESTION);
    }
  };

  const handleEndInterview = () => {
    stopRecording();
    setStage(STAGES.REPORT);
  };

  const avgScore = results.length
    ? Math.round(results.reduce((s, r) => s + (r.score || 0), 0) / results.length)
    : 0;

  const timerColor = timer > 60 ? '#22c55e' : timer > 30 ? '#f59e0b' : '#ef4444';
  const mins = String(Math.floor(timer / 60)).padStart(2, '0');
  const secs = String(timer % 60).padStart(2, '0');

  // ─────────────────────────────────────────────────────────────────
  // INTRO SCREEN
  // ─────────────────────────────────────────────────────────────────
  if (stage === STAGES.INTRO) return (
    <div style={overlay}>
      <div style={{ ...modal, maxWidth: 560 }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(79,70,229,0.15)', border: '2px solid #4F46E5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <Mic size={36} color="#4F46E5" />
          </div>
          <h2 style={heading2}>Voice Mock Interview</h2>
          <p style={muted}>Topic: <strong style={{ color: '#06B6D4' }}>{topic}</strong></p>
        </div>

        <div style={{ background: 'rgba(79,70,229,0.08)', border: '1px solid rgba(79,70,229,0.2)', borderRadius: 12, padding: '1.2rem 1.5rem', marginBottom: '2rem' }}>
          {[
            '🎤 Speak your answer clearly — browser mic required',
            `📋 ${total} famous interview questions, max 10`,
            '⏱️ 2 minutes per question',
            '❌ "I don\'t know / No / Skip" = not counted as answer',
            '📊 AI evaluates score, feedback & model answer',
            '⏭️ Use Next to skip or move forward anytime',
          ].map((tip, i) => (
            <p key={i} style={{ color: '#94A3B8', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{tip}</p>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={onClose} style={outlineBtn}>Cancel</button>
          <button onClick={() => setStage(STAGES.QUESTION)} style={primaryBtn}>
            Start Interview →
          </button>
        </div>
      </div>
    </div>
  );

  // ─────────────────────────────────────────────────────────────────
  // QUESTION SCREEN
  // ─────────────────────────────────────────────────────────────────
  if (stage === STAGES.QUESTION) return (
    <div style={overlay}>
      <div style={{ ...modal, maxWidth: 680 }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span style={badge('#4F46E5')}>Q {current + 1} / {total}</span>
            {recording && <span style={badge('#ef4444')}>● REC</span>}
          </div>
          <button onClick={handleEndInterview} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 6 }}>
            <XCircle size={16} /> End Interview
          </button>
        </div>

        {/* Progress bar */}
        <div style={{ height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 4, marginBottom: '2rem' }}>
          <div style={{ height: '100%', width: `${((current) / total) * 100}%`, background: 'linear-gradient(90deg, #4F46E5, #7C3AED)', borderRadius: 4, transition: 'width 0.4s ease' }} />
        </div>

        {/* Question */}
        <div style={{ background: 'rgba(79,70,229,0.06)', border: '1px solid rgba(79,70,229,0.2)', borderRadius: 16, padding: '1.5rem 2rem', marginBottom: '2rem' }}>
          <p style={{ color: '#06B6D4', fontSize: '0.8rem', fontWeight: 700, letterSpacing: 2, marginBottom: '0.8rem' }}>INTERVIEW QUESTION</p>
          <h3 style={{ ...heading2, fontSize: '1.4rem', marginBottom: 0 }}>{currentQ?.question}</h3>
        </div>

        {/* Timer */}
        {recording && (
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.2rem' }}>
            <span style={{ color: timerColor, fontWeight: 800, fontSize: '1.3rem', fontFamily: 'monospace' }}>⏱ {mins}:{secs}</span>
          </div>
        )}

        {/* Transcript display */}
        <div style={{ background: 'rgba(0,0,0,0.2)', border: `1px solid ${recording ? '#4F46E5' : 'rgba(255,255,255,0.06)'}`, borderRadius: 12, padding: '1rem 1.2rem', minHeight: 90, marginBottom: '1.5rem', transition: 'border 0.3s' }}>
          {transcript || interimText
            ? <p style={{ color: '#F8FAFC', lineHeight: 1.6, fontSize: '0.95rem' }}>
                {transcript}
                <span style={{ color: '#94A3B8' }}>{interimText}</span>
              </p>
            : <p style={{ color: '#94A3B8', fontSize: '0.9rem' }}>{recording ? '🎤 Listening... speak now' : 'Your spoken answer will appear here'}</p>
          }
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {!recording
            ? <button onClick={startRecording} style={{ ...primaryBtn, flex: 1, gap: 10 }}>
                <Mic size={18} /> Start Speaking
              </button>
            : <button onClick={stopRecording} style={{ ...primaryBtn, flex: 1, background: '#ef4444', gap: 10 }}>
                <MicOff size={18} /> Stop Recording
              </button>
          }
          <button
            onClick={handleSubmitAnswer}
            disabled={evaluating || (!transcript && !interimText)}
            style={{ ...primaryBtn, flex: 1, background: (!transcript && !interimText) ? '#333' : '#22c55e', gap: 10, opacity: evaluating ? 0.7 : 1 }}
          >
            {evaluating ? '⏳ Evaluating...' : '✓ Submit Answer'}
          </button>
          <button onClick={handleNext} style={{ ...outlineBtn, flex: 1 }}>
            Skip <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );

  // ─────────────────────────────────────────────────────────────────
  // REVIEWING SCREEN
  // ─────────────────────────────────────────────────────────────────
  if (stage === STAGES.REVIEWING && currentResult) return (
    <div style={overlay}>
      <div style={{ ...modal, maxWidth: 700, maxHeight: '90vh', overflowY: 'auto' }}>
        {/* Score header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ ...heading2, fontSize: '1.3rem', marginBottom: 0 }}>Q{current + 1} Result</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {currentResult.offTopic && (
              <span style={badge('#f59e0b')}>⚠ Off-Topic</span>
            )}
            <div style={{
              width: 60, height: 60, borderRadius: '50%',
              background: scoreColor(currentResult.score, true),
              border: `3px solid ${scoreColor(currentResult.score)}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexDirection: 'column'
            }}>
              <span style={{ fontWeight: 900, fontSize: '1.2rem', color: scoreColor(currentResult.score) }}>{currentResult.score}</span>
              <span style={{ fontSize: '0.6rem', color: '#94A3B8' }}>/10</span>
            </div>
          </div>
        </div>

        {/* Off topic warning */}
        {currentResult.offTopic && (
          <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 10, padding: '0.8rem 1rem', marginBottom: '1rem', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <AlertCircle size={18} color="#f59e0b" style={{ marginTop: 2, flexShrink: 0 }} />
            <p style={{ color: '#f59e0b', fontSize: '0.9rem', margin: 0 }}>Your answer should be <strong>bound to the given topic: {topic}</strong>. Unrelated answers affect your score.</p>
          </div>
        )}

        {/* Skipped */}
        {currentResult.status === 'skipped' && (
          <div style={{ background: 'rgba(148,163,184,0.08)', border: '1px solid rgba(148,163,184,0.2)', borderRadius: 10, padding: '0.8rem 1rem', marginBottom: '1rem' }}>
            <p style={{ color: '#94A3B8', fontSize: '0.9rem', margin: 0 }}>⚪ Not answered — "I don't know / No / Skip" type responses are not counted.</p>
          </div>
        )}

        {/* Your answer */}
        {currentResult.status !== 'skipped' && (
          <div style={resultBlock('#1E293B', 'rgba(255,255,255,0.06)')}>
            <p style={resultLabel}>Your Answer</p>
            <p style={{ color: '#F8FAFC', fontSize: '0.95rem', lineHeight: 1.6 }}>{currentResult.userAnswer}</p>
          </div>
        )}

        {/* What was good */}
        {currentResult.good && (
          <div style={resultBlock('rgba(34,197,94,0.06)', 'rgba(34,197,94,0.2)')}>
            <p style={resultLabel}><CheckCircle2 size={14} color="#22c55e" style={{ marginRight: 6 }} />What Was Good</p>
            <p style={{ color: '#F8FAFC', fontSize: '0.9rem', lineHeight: 1.6 }}>{currentResult.good}</p>
          </div>
        )}

        {/* What was missing */}
        {currentResult.missing && (
          <div style={resultBlock('rgba(239,68,68,0.06)', 'rgba(239,68,68,0.2)')}>
            <p style={resultLabel}><XCircle size={14} color="#ef4444" style={{ marginRight: 6 }} />What Was Missing</p>
            <p style={{ color: '#F8FAFC', fontSize: '0.9rem', lineHeight: 1.6 }}>{currentResult.missing}</p>
          </div>
        )}

        {/* Model answer */}
        <div style={resultBlock('rgba(79,70,229,0.06)', 'rgba(79,70,229,0.25)')}>
          <p style={resultLabel}><Volume2 size={14} color="#4F46E5" style={{ marginRight: 6 }} />Model Answer</p>
          <p style={{ color: '#F8FAFC', fontSize: '0.9rem', lineHeight: 1.7 }}>{currentResult.idealAnswer}</p>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
          <button onClick={handleEndInterview} style={{ ...outlineBtn, flex: 1 }}>
            End & See Report
          </button>
          <button onClick={handleNext} style={{ ...primaryBtn, flex: 2 }}>
            {current + 1 >= total ? '📊 View Full Report' : `Next Question (${current + 2}/${total}) →`}
          </button>
        </div>
      </div>
    </div>
  );

  // ─────────────────────────────────────────────────────────────────
  // REPORT SCREEN
  // ─────────────────────────────────────────────────────────────────
  if (stage === STAGES.REPORT) {
    const correct = results.filter(r => r.score >= 7).length;
    const wrong = results.filter(r => r.score > 0 && r.score < 7).length;
    const skipped = results.filter(r => r.status === 'skipped' || r.score === 0).length;
    const unattempted = total - results.length;

    return (
      <div style={overlay}>
        <div style={{ ...modal, maxWidth: 720, maxHeight: '92vh', overflowY: 'auto' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ width: 90, height: 90, borderRadius: '50%', background: scoreColor(avgScore, true), border: `3px solid ${scoreColor(avgScore)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', flexDirection: 'column' }}>
              <span style={{ fontWeight: 900, fontSize: '1.8rem', color: scoreColor(avgScore) }}>{avgScore}</span>
              <span style={{ fontSize: '0.7rem', color: '#94A3B8' }}>/10</span>
            </div>
            <h2 style={heading2}>Interview Complete!</h2>
            <p style={muted}>Topic: <strong style={{ color: '#06B6D4' }}>{topic}</strong></p>
          </div>

          {/* Summary pills */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '2rem' }}>
            <span style={pill('#22c55e')}>✓ {correct} Strong</span>
            <span style={pill('#f59e0b')}>~ {wrong} Needs Work</span>
            <span style={pill('#ef4444')}>✗ {skipped} Skipped</span>
            {unattempted > 0 && <span style={pill('#94A3B8')}>○ {unattempted} Unattempted</span>}
          </div>

          {/* Per question breakdown */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
            {results.map((r, i) => (
              <div key={i} style={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '1rem 1.2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ color: '#94A3B8', fontSize: '0.75rem', marginBottom: '0.3rem' }}>Q{i + 1}</p>
                    <p style={{ color: '#F8FAFC', fontSize: '0.9rem', fontWeight: 600 }}>{r.question}</p>
                    {r.offTopic && <p style={{ color: '#f59e0b', fontSize: '0.78rem', marginTop: '0.3rem' }}>⚠ Answer should be bound to topic: {topic}</p>}
                    {r.status === 'skipped' && <p style={{ color: '#94A3B8', fontSize: '0.78rem', marginTop: '0.3rem' }}>⚪ Not answered</p>}
                  </div>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: scoreColor(r.score, true), border: `2px solid ${scoreColor(r.score)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontWeight: 800, fontSize: '1rem', color: scoreColor(r.score) }}>{r.score}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button onClick={onClose} style={{ ...primaryBtn, width: '100%', justifyContent: 'center' }}>
            <RefreshCw size={16} /> Close & Back to Study Guide
          </button>
        </div>
      </div>
    );
  }

  return null;
};

// ─── Styles ───────────────────────────────────────────────────────
const overlay = {
  position: 'fixed', inset: 0,
  background: 'rgba(0,0,0,0.7)',
  backdropFilter: 'blur(8px)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  zIndex: 9999, padding: '1rem'
};
const modal = {
  background: '#0F172A',
  border: '1px solid rgba(79,70,229,0.25)',
  borderRadius: 20,
  padding: '2rem',
  width: '100%',
  boxShadow: '0 25px 60px rgba(0,0,0,0.5)'
};
const heading2 = { fontFamily: 'Playfair Display, serif', fontSize: '1.8rem', color: '#F8FAFC', fontWeight: 800, marginBottom: '0.5rem' };
const muted = { color: '#94A3B8', fontSize: '0.95rem' };
const primaryBtn = {
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
  padding: '13px 24px', background: '#4F46E5', color: '#fff',
  border: 'none', borderRadius: 10, fontWeight: 700, fontSize: '0.95rem',
  cursor: 'pointer', transition: 'all 0.2s'
};
const outlineBtn = {
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
  padding: '13px 24px', background: 'transparent', color: '#F8FAFC',
  border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10,
  fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer'
};
const resultBlock = (bg, border) => ({
  background: bg, border: `1px solid ${border}`,
  borderRadius: 10, padding: '1rem 1.2rem', marginBottom: '0.8rem'
});
const resultLabel = {
  color: '#94A3B8', fontSize: '0.78rem', fontWeight: 700,
  letterSpacing: 1, textTransform: 'uppercase',
  marginBottom: '0.5rem', display: 'flex', alignItems: 'center'
};
const badge = (color) => ({
  background: `${color}22`, color, border: `1px solid ${color}44`,
  padding: '3px 12px', borderRadius: 20, fontSize: '0.78rem', fontWeight: 700
});
const pill = (color) => ({
  background: `${color}18`, color, border: `1px solid ${color}44`,
  padding: '6px 18px', borderRadius: 20, fontSize: '0.88rem', fontWeight: 700
});
const scoreColor = (score, bg = false) => {
  if (score >= 7) return bg ? 'rgba(34,197,94,0.1)' : '#22c55e';
  if (score >= 4) return bg ? 'rgba(245,158,11,0.1)' : '#f59e0b';
  return bg ? 'rgba(239,68,68,0.1)' : '#ef4444';
};

export default VoiceInterview;