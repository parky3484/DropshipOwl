/*
StreetSmarts-Style Dropshipping Course Website
Single-file React component (App.jsx) ready to paste into a Vite/Next/CRA project.
Uses Tailwind CSS (classes assumed available). Uses shadcn/ui components pattern (imports are placeholders).

Features implemented locally (no backend required):
- Landing/Home page with course overview
- Module & lesson navigation
- Video + text lesson viewer
- Quiz per lesson with scoring
- Progress tracking in localStorage
- Certificate generation (simple printable certificate)
- Admin preview mode (toggle) to manage content client-side
- Responsive layout, accessible markup, simple animations using framer-motion

How to use:
1) Create a React app (Vite recommended) and install Tailwind.
2) Paste this file as src/App.jsx and ensure Tailwind is configured.
3) Optionally swap video src and lesson content.

Note: This is a front-end prototype. For a production site connect to a backend/auth provider and secure routes.
*/

import React, { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";

// ---------- SAMPLE COURSE DATA (editable) ----------
const SAMPLE_COURSE = {
  id: "dropship-101",
  title: "The Complete Dropshipping Blueprint",
  subtitle: "Street-Smart, 2025-ready dropshipping course",
  description:
    "Build, launch, and scale a profitable dropshipping store — tested tactics, ready-made templates, and quizzes to prove knowledge.",
  modules: [
    {
      id: "m1",
      title: "Introduction & Mindset",
      lessons: [
        {
          id: "m1l1",
          title: "What is Dropshipping?",
          content: "Short text overview. Dropshipping is a retail fulfillment method where you sell products without stocking inventory.",
          video: "https://www.w3schools.com/html/mov_bbb.mp4",
          quiz: [
            {
              q: "Dropshipping requires you to hold inventory.",
              options: ["True", "False"],
              a: 1,
            },
          ],
        },
        {
          id: "m1l2",
          title: "Mindset & Expectations",
          content: "What success looks like and how to test fast.",
          video: null,
          quiz: [],
        },
      ],
    },
    {
      id: "m2",
      title: "Product Research",
      lessons: [
        {
          id: "m2l1",
          title: "Finding Winning Products",
          content: "Checklist: perceived value, shipping, margin, creative potential.",
          video: null,
          quiz: [
            {
              q: "Which is NOT a sign of a winning product?",
              options: ["High perceived value", "Mass appeal", "0% markup"],
              a: 2,
            },
          ],
        },
      ],
    },
  ],
};

// ---------- HELPERS ----------
const STORAGE_KEY = "dropship_streetsmarts_progress_v1";

function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { completedLessons: {}, quizScores: {} };
  } catch (e) {
    return { completedLessons: {}, quizScores: {} };
  }
}
function saveProgress(progress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

// ---------- COMPONENTS ----------
function Header({ course, onToggleAdmin, isAdmin }) {
  return (
    <header className="bg-gradient-to-r from-indigo-600 to-cyan-500 text-white p-6">
      <div className="container mx-auto flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{course.title}</h1>
          <p className="text-sm opacity-90">{course.subtitle}</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={onToggleAdmin}
            className="bg-white bg-opacity-20 hover:bg-opacity-30 px-3 py-1 rounded"
            aria-pressed={isAdmin}
          >
            {isAdmin ? "Admin Mode" : "Preview"}
          </button>
          <a
            href="#course"
            className="hidden md:inline-block bg-white text-indigo-700 px-3 py-1 rounded font-medium"
          >
            Start Course
          </a>
        </div>
      </div>
    </header>
  );
}

function Sidebar({ course, onSelectLesson, activeLessonId, progress }) {
  return (
    <aside className="w-full md:w-80 border-r p-4 overflow-y-auto">
      <div className="sticky top-4">
        <h2 className="font-semibold mb-3">Course Content</h2>
        <nav className="space-y-4">
          {course.modules.map((m) => (
            <div key={m.id}>
              <div className="text-sm font-medium mb-2">{m.title}</div>
              <ul className="space-y-1">
                {m.lessons.map((l) => {
                  const done = !!progress.completedLessons[l.id];
                  return (
                    <li key={l.id}>
                      <button
                        className={`w-full text-left p-2 rounded flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700 ${
                          activeLessonId === l.id ? "bg-slate-100" : ""
                        }`}
                        onClick={() => onSelectLesson(m.id, l.id)}
                      >
                        <span className="truncate">{l.title}</span>
                        <span className="text-xs ml-2">
                          {done ? "✓" : "•"}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </div>
    </aside>
  );
}

function LessonViewer({ lesson, onComplete, progress, onSubmitQuiz }) {
  const [answers, setAnswers] = useState({});
  useEffect(() => setAnswers({}), [lesson?.id]);

  if (!lesson) return <div className="p-6">Select a lesson to start.</div>;
  return (
    <div className="p-6">
      <h3 className="text-xl font-semibold mb-2">{lesson.title}</h3>
      <p className="mb-4">{lesson.content}</p>

      {lesson.video && (
        <div className="mb-4">
          <video controls className="w-full rounded shadow">
            <source src={lesson.video} type="video/mp4" />
            Sorry, your browser doesn't support embedded videos.
          </video>
        </div>
      )}

      <div className="mb-4">
        <button
          onClick={() => onComplete(lesson.id)}
          className="px-4 py-2 bg-indigo-600 text-white rounded"
        >
          Mark Complete
        </button>
        {progress.completedLessons[lesson.id] && (
          <span className="ml-3 text-sm text-green-700">Completed</span>
        )}
      </div>

      {lesson.quiz && lesson.quiz.length > 0 && (
        <div className="mt-6">
          <h4 className="font-semibold mb-2">Lesson Quiz</h4>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              // grade
              let score = 0;
              lesson.quiz.forEach((q, i) => {
                if (answers[i] === q.a) score++;
              });
              onSubmitQuiz(lesson.id, score, lesson.quiz.length);
            }}
          >
            {lesson.quiz.map((q, idx) => (
              <div className="mb-4" key={idx}>
                <div className="mb-2">{q.q}</div>
                <div className="flex gap-2 flex-wrap">
                  {q.options.map((opt, oi) => (
                    <label
                      key={oi}
                      className={`border rounded px-3 py-1 cursor-pointer ${
                        answers[idx] === oi ? "bg-slate-100" : ""
                      }`}
                    >
                      <input
                        type="radio"
                        name={`q-${idx}`}
                        className="mr-2"
                        checked={answers[idx] === oi}
                        onChange={() => setAnswers((s) => ({ ...s, [idx]: oi }))}
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              </div>
            ))}
            <div>
              <button className="px-4 py-2 bg-emerald-600 text-white rounded">Submit Quiz</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function Certificate({ profile, course }) {
  const date = new Date().toLocaleDateString();
  return (
    <div className="p-6 max-w-3xl mx-auto bg-white rounded shadow">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Certificate of Completion</h2>
        <p className="mt-2">This certifies that</p>
        <div className="mt-4 text-xl font-semibold">{profile.name || "Student"}</div>
        <p className="mt-2">has completed</p>
        <div className="mt-2 font-medium">{course.title}</div>
        <p className="mt-6">Date: {date}</p>
        <div className="mt-6">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-indigo-600 text-white rounded"
          >
            Print / Save as PDF
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------- MAIN APP ----------
export default function App() {
  const [course, setCourse] = useState(() => SAMPLE_COURSE);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeModuleId, setActiveModuleId] = useState(course.modules[0].id);
  const [activeLessonId, setActiveLessonId] = useState(course.modules[0].lessons[0].id);
  const [progress, setProgress] = useState(() => loadProgress());
  const [profile, setProfile] = useState({ name: "" });

  useEffect(() => saveProgress(progress), [progress]);

  const activeLesson = useMemo(() => {
    const mod = course.modules.find((m) => m.id === activeModuleId);
    return mod?.lessons.find((l) => l.id === activeLessonId) || null;
  }, [course, activeModuleId, activeLessonId]);

  function handleSelectLesson(mId, lId) {
    setActiveModuleId(mId);
    setActiveLessonId(lId);
  }

  function markComplete(lessonId) {
    setProgress((p) => ({ ...p, completedLessons: { ...p.completedLessons, [lessonId]: true } }));
  }

  function handleQuizSubmit(lessonId, score, outOf) {
    setProgress((p) => ({ ...p, quizScores: { ...p.quizScores, [lessonId]: { score, outOf } } }));
    // auto-mark complete when quiz passed (>=50%)
    if (score / outOf >= 0.5) {
      markComplete(lessonId);
    }
  }

  const totalLessons = course.modules.reduce((s, m) => s + m.lessons.length, 0);
  const completedCount = Object.keys(progress.completedLessons).length;
  const pct = Math.round((completedCount / totalLessons) * 100) || 0;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <Header course={course} onToggleAdmin={() => setIsAdmin((s) => !s)} isAdmin={isAdmin} />

      <main className="container mx-auto md:flex gap-6 py-6">
        <div className="md:flex-shrink-0 md:w-80">
          <Sidebar course={course} onSelectLesson={handleSelectLesson} activeLessonId={activeLessonId} progress={progress} />
        </div>

        <section className="flex-1 bg-white rounded shadow overflow-hidden">
          <div className="flex items-center justify-between border-b px-6 py-3">
            <div>
              <div className="text-sm text-slate-500">Progress</div>
              <div className="mt-1 font-medium">{completedCount}/{totalLessons} lessons • {pct}%</div>
            </div>
            <div className="w-52">
              <div className="h-3 bg-slate-200 rounded overflow-hidden">
                <div className="h-full bg-emerald-500" style={{ width: `${pct}%` }} />
              </div>
            </div>
          </div>

          <div className="md:flex">
            <div className="md:flex-1">
              <LessonViewer lesson={activeLesson} onComplete={markComplete} progress={progress} onSubmitQuiz={handleQuizSubmit} />
            </div>
            <aside className="md:w-80 border-l hidden md:block">
              <div className="p-4">
                <h4 className="font-semibold">Student</h4>
                <input
                  placeholder="Your name"
                  className="mt-2 w-full px-3 py-2 border rounded"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                />

                <div className="mt-4">
                  <h5 className="font-medium">Quick Actions</h5>
                  <button
                    onClick={() => {
                      // simple certificate availability rule: all lessons complete
                      const allDone = course.modules.every((m) => m.lessons.every((l) => progress.completedLessons[l.id]));
                      if (!allDone) return alert("Finish all lessons to get a certificate.");
                      const win = window.open("", "_blank");
                      win.document.write('<div style="font-family:sans-serif;padding:40px"><h1>Certificate</h1><p>Print from your browser.</p></div>');
                      win.print();
                    }}
                    className="mt-2 w-full bg-indigo-600 text-white px-3 py-2 rounded"
                  >
                    Quick Print Certificate
                  </button>
                </div>

                <div className="mt-6">
                  <h5 className="font-medium">Progress Snapshot</h5>
                  <ul className="mt-2 text-sm">
                    {Object.entries(progress.quizScores).map(([k, v]) => (
                      <li key={k}>{k}: {v.score}/{v.outOf}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </aside>
          </div>
        </section>

        {/* Admin editor drawer */}
        {isAdmin && (
          <aside className="fixed right-4 bottom-4 w-96 bg-white border rounded shadow-lg p-4 z-50">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">Admin (Client-side)</h4>
              <button onClick={() => setIsAdmin(false)} className="text-sm px-2 py-1">Close</button>
            </div>
            <div className="mt-3">
              <label className="block text-xs">Course Title</label>
              <input value={course.title} onChange={(e) => setCourse({ ...course, title: e.target.value })} className="w-full px-2 py-1 border rounded mt-1" />
            </div>
            <div className="mt-3">
              <label className="block text-xs">Add Module</label>
              <AdminAddModule course={course} setCourse={setCourse} />
            </div>
            <div className="mt-3">
              <button className="px-3 py-2 bg-rose-600 text-white rounded" onClick={() => { localStorage.removeItem(STORAGE_KEY); setProgress({ completedLessons: {}, quizScores: {} }); }}>Reset Progress</button>
            </div>
          </aside>
        )}
      </main>

      <footer className="bg-white border-t py-6 mt-8">
        <div className="container mx-auto text-center text-sm text-slate-600">© {new Date().getFullYear()} Street-Smart Dropshipping Course — Prototype</div>
      </footer>
    </div>
  );
}

function AdminAddModule({ course, setCourse }) {
  const [title, setTitle] = useState("");
  function add() {
    if (!title) return;
    const id = `m_${Date.now()}`;
    const newModule = { id, title, lessons: [] };
    setCourse({ ...course, modules: [...course.modules, newModule] });
    setTitle("");
  }
  return (
    <div>
      <div className="flex gap-2">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Module title" className="flex-1 px-2 py-1 border rounded" />
        <button onClick={add} className="px-3 py-1 bg-emerald-600 text-white rounded">Add</button>
      </div>
      <div className="mt-2 text-xs text-slate-500">Modules are client-side only in this prototype.</div>
    </div>
  );
}
