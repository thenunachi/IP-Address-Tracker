import React, { useEffect, useMemo, useState } from "react";
import { Link, Route, Routes, useLocation, useNavigate } from "react-router-dom";

const MOODS = [
  { id: "very_happy", label: "Very happy", emoji: "😊" },
  { id: "happy", label: "Happy", emoji: "🙂" },
  { id: "neutral", label: "Neutral", emoji: "😐" },
  { id: "sad", label: "Sad", emoji: "🙁" },
  { id: "very_sad", label: "Very sad", emoji: "😢" }
];

const STORAGE_KEY = "mood-tracker-entries-v1";
const USER_KEY = "mood-tracker-user-v1";

function stripTime(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function isFutureDate(date) {
  const today = stripTime(new Date());
  const target = stripTime(date);
  return target.getTime() > today.getTime();
}

function formatDateKey(date) {
  return stripTime(date).toISOString().slice(0, 10);
}

function parseDateKey(key) {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function loadUser() {
  try {
    const raw = window.localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveUser(user) {
  try {
    if (user) {
      window.localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      window.localStorage.removeItem(USER_KEY);
    }
  } catch {
    // ignore
  }
}

function loadEntries() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveEntries(entries) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // ignore
  }
}

function getUserScopedEntries(entries, userId) {
  if (!userId) return {};
  return entries[userId] || {};
}

function setUserScopedEntries(entries, userId, userEntries) {
  if (!userId) return entries;
  return {
    ...entries,
    [userId]: userEntries
  };
}

function computeWeeklyAndStreaks(userEntries) {
  const today = stripTime(new Date());
  const todayKey = formatDateKey(today);

  // Last 7 days (including today)
  const last7 = [];
  for (let i = 6; i >= 0; i -= 1) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = formatDateKey(d);
    last7.push({
      key,
      date: d,
      entry: userEntries[key] || null
    });
  }

  // Current logging streak (any data for the day)
  let loggingStreak = 0;
  let cursor = new Date(today);
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const key = formatDateKey(cursor);
    if (userEntries[key]) {
      loggingStreak += 1;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }

  // Current positive mood streak (happy or very_happy)
  let positiveStreak = 0;
  cursor = new Date(today);
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const key = formatDateKey(cursor);
    const entry = userEntries[key];
    if (entry && (entry.mood === "happy" || entry.mood === "very_happy")) {
      positiveStreak += 1;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }

  // Longest logging streak overall
  const allKeys = Object.keys(userEntries).sort();
  let longest = 0;
  let current = 0;
  let prevDate = null;
  allKeys.forEach((key) => {
    const date = parseDateKey(key);
    if (!prevDate) {
      current = 1;
    } else {
      const diff =
        (stripTime(date).getTime() - stripTime(prevDate).getTime()) /
        (1000 * 60 * 60 * 24);
      if (diff === 1) {
        current += 1;
      } else {
        if (current > longest) longest = current;
        current = 1;
      }
    }
    prevDate = date;
  });
  if (current > longest) longest = current;

  return {
    last7,
    loggingStreak,
    positiveStreak,
    longestLoggingStreak: longest
  };
}

function useChatbot(monthlyStats, weeklyStats) {
  const [messages, setMessages] = useState(() => [
    {
      from: "bot",
      text: "Hi, I’m your sleep & mood coach. Tell me how your days have felt lately, and I’ll suggest gentle tweaks."
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = (text) => {
    if (!text.trim()) return;
    const userMessage = { from: "user", text: text.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    const reply = buildCoachReply(text.trim(), monthlyStats, weeklyStats);
    setIsTyping(true);
    window.setTimeout(() => {
      setMessages((prev) => [...prev, { from: "bot", text: reply }]);
      setIsTyping(false);
    }, 450);
  };

  return {
    messages,
    input,
    isTyping,
    setInput,
    sendMessage
  };
}

function buildCoachReply(userText, monthlyStats, weeklyStats) {
  const lower = userText.toLowerCase();
  const hints = [];

  const avg = monthlyStats.avgSleep;
  if (avg != null && avg < 7) {
    hints.push(
      `You’re averaging about ${avg.toFixed(
        1
      )} hours of sleep. Most adults feel best closer to 7–9 hours — try shifting your wind‑down routine 20–30 minutes earlier for a week.`
    );
  } else if (avg != null && avg >= 7 && avg <= 9) {
    hints.push(
      `Your sleep duration looks pretty solid. To keep it that way, protect a consistent bedtime and avoid screens in the last 45–60 minutes.`
    );
  }

  if (weeklyStats.positiveStreak >= 3) {
    hints.push(
      `You’ve had a ${weeklyStats.positiveStreak}-day run of happier moods. Notice what’s been supporting that — routines, people, or activities — and intentionally repeat them.`
    );
  }

  if (weeklyStats.loggingStreak >= 5) {
    hints.push(
      `You’ve logged ${weeklyStats.loggingStreak} days in a row. That consistency is powerful — it makes it easier to spot patterns and small wins.`
    );
  }

  if (lower.includes("tired") || lower.includes("exhausted")) {
    hints.push(
      "Feeling constantly tired? Try a 7‑day experiment: fixed wake time, 10–15 minute daylight exposure in the morning, and limit caffeine after mid‑afternoon."
    );
  }

  if (
    lower.includes("anxious") ||
    lower.includes("anxiety") ||
    lower.includes("overwhelmed")
  ) {
    hints.push(
      "For anxious nights, short grounding rituals can help: 3 slow breaths (4s in, 6s out), list 3 things you’re grateful for, and keep a worry notebook away from the bed."
    );
  }

  if (
    lower.includes("sad") ||
    lower.includes("low") ||
    lower.includes("down") ||
    lower.includes("depressed")
  ) {
    hints.push(
      "Seeing many low‑mood days can be heavy. If it persists, consider talking with a mental‑health professional, and add one gentle daily action: a short walk, a call with a friend, or 5 minutes of journaling."
    );
  }

  if (!hints.length) {
    hints.push(
      "A useful starting point is rhythm: pick roughly the same sleep/wake times every day, add 10–15 minutes of light movement, and keep evenings a little quieter and dimmer."
    );
  }

  return hints.join(" ");
}

function App() {
  const [user, setUser] = useState(() => loadUser());
  const [allEntries, setAllEntries] = useState(() => loadEntries());
  const location = useLocation();
  const navigate = useNavigate();

  const userEntries = useMemo(
    () => getUserScopedEntries(allEntries, user?.id),
    [allEntries, user?.id]
  );

  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [activeMonth, setActiveMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const selectedKey = formatDateKey(selectedDate);
  const selectedEntry = userEntries[selectedKey] || null;

  const [mood, setMood] = useState(selectedEntry?.mood || "happy");
  const [sleepHours, setSleepHours] = useState(
    selectedEntry?.sleepHours != null ? String(selectedEntry.sleepHours) : ""
  );
  const [authEmail, setAuthEmail] = useState(user?.email || "");
  const [authName, setAuthName] = useState(user?.name || "");
  const [authError, setAuthError] = useState("");
  const [formError, setFormError] = useState("");
  const [fitbitStatus, setFitbitStatus] = useState("");

  useEffect(() => {
    saveEntries(allEntries);
  }, [allEntries]);

  useEffect(() => {
    saveUser(user);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const key = formatDateKey(selectedDate);
    const entry = userEntries[key];
    setMood(entry?.mood || "happy");
    setSleepHours(entry?.sleepHours != null ? String(entry.sleepHours) : "");
  }, [selectedDate, userEntries, user]);

  useEffect(() => {
    if (!user) return;
    const todayKey = formatDateKey(new Date());
    if (!userEntries[todayKey]) {
      setSelectedDate(new Date());
      setActiveMonth(
        new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      );
    }
  }, [user, userEntries]);

  const handleAuthSubmit = (e) => {
    e.preventDefault();
    setAuthError("");
    const trimmedEmail = authEmail.trim();
    const trimmedName = authName.trim();

    if (!trimmedEmail) {
      setAuthError("Please enter an email to continue.");
      return;
    }

    const id = trimmedEmail.toLowerCase();
    const finalName = trimmedName || "Guest";
    const nextUser = { id, email: trimmedEmail, name: finalName };
    setUser(nextUser);
  };

  const handleLogout = () => {
    setUser(null);
    setAuthEmail("");
    setAuthName("");
    navigate("/");
  };

  const handleSaveEntry = (e) => {
    e.preventDefault();
    setFormError("");

    if (!user) {
      setFormError("Log in to save your mood.");
      return;
    }

    if (isFutureDate(selectedDate)) {
      setFormError("You can only log for today or past days.");
      return;
    }

    const hours = sleepHours.trim() === "" ? null : Number(sleepHours);
    if (hours !== null && (Number.isNaN(hours) || hours < 0 || hours > 16)) {
      setFormError("Enter a valid sleep duration between 0 and 16 hours.");
      return;
    }

    const key = selectedKey;
    const userEntriesNext = {
      ...userEntries,
      [key]: {
        ...(userEntries[key] || {}),
        mood,
        sleepHours: hours
      }
    };

    setAllEntries((prev) =>
      setUserScopedEntries(prev, user.id, userEntriesNext)
    );
  };

  const handleMonthChange = (delta) => {
    const next = new Date(activeMonth);
    next.setMonth(next.getMonth() + delta);
    setActiveMonth(new Date(next.getFullYear(), next.getMonth(), 1));
  };

  const daysInMonth = useMemo(() => {
    const year = activeMonth.getFullYear();
    const month = activeMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const firstWeekday = firstDay.getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    const cells = [];
    for (let i = 0; i < firstWeekday; i += 1) {
      cells.push(null);
    }
    for (let d = 1; d <= totalDays; d += 1) {
      cells.push(new Date(year, month, d));
    }
    return cells;
  }, [activeMonth]);

  const monthlyStats = useMemo(() => {
    if (!user) {
      return {
        avgSleep: null,
        moodCounts: {},
        totalDays: 0,
        nonEmptyDays: 0
      };
    }

    const year = activeMonth.getFullYear();
    const month = activeMonth.getMonth();

    let sleepSum = 0;
    let sleepCount = 0;
    const moodCounts = {};

    Object.entries(userEntries).forEach(([key, value]) => {
      const date = parseDateKey(key);
      if (date.getFullYear() === year && date.getMonth() === month) {
        if (value.sleepHours != null) {
          sleepSum += value.sleepHours;
          sleepCount += 1;
        }
        if (value.mood) {
          moodCounts[value.mood] = (moodCounts[value.mood] || 0) + 1;
        }
      }
    });

    const totalDays = new Date(year, month + 1, 0).getDate();
    const nonEmptyDays = Object.keys(moodCounts).reduce(
      (acc, moodKey) => acc + moodCounts[moodKey],
      0
    );

    return {
      avgSleep: sleepCount > 0 ? sleepSum / sleepCount : null,
      moodCounts,
      totalDays,
      nonEmptyDays
    };
  }, [activeMonth, user, userEntries]);

  const weeklyAndStreaks = useMemo(
    () => computeWeeklyAndStreaks(userEntries),
    [userEntries]
  );

  const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const getMoodClass = (moodId) => {
    switch (moodId) {
      case "very_happy":
        return "mood-very-happy";
      case "happy":
        return "mood-happy";
      case "neutral":
        return "mood-neutral";
      case "sad":
        return "mood-sad";
      case "very_sad":
        return "mood-very-sad";
      default:
        return "";
    }
  };

  const todayKey = formatDateKey(new Date());
  const avgSleepDisplay =
    monthlyStats.avgSleep != null
      ? `${monthlyStats.avgSleep.toFixed(1)} h`
      : "–";

  const moodLevelScore = (() => {
    const weights = {
      very_happy: 1,
      happy: 0.6,
      neutral: 0.4,
      sad: 0.25,
      very_sad: 0.15
    };
    const { moodCounts, nonEmptyDays } = monthlyStats;
    if (!nonEmptyDays) return 0;
    let weighted = 0;
    Object.entries(moodCounts).forEach(([moodId, count]) => {
      const weight = weights[moodId] || 0;
      weighted += weight * count;
    });
    return Math.min(1, Math.max(0, weighted / nonEmptyDays));
  })();

  const sleepLevelScore = (() => {
    const avg = monthlyStats.avgSleep;
    if (avg == null) return 0;
    const lower = 5.5;
    const upper = 8.5;
    if (avg <= lower) return 0.1;
    if (avg >= upper) return 1;
    return (avg - lower) / (upper - lower);
  })();

  const wellbeingComposite = Math.round(
    (0.6 * moodLevelScore + 0.4 * sleepLevelScore) * 100
  );

  const chatbot = useChatbot(monthlyStats, weeklyAndStreaks);

  const allUserLogsSorted = useMemo(() => {
    const keys = Object.keys(userEntries).sort().reverse();
    return keys.map((key) => ({
      key,
      date: parseDateKey(key),
      entry: userEntries[key]
    }));
  }, [userEntries]);

  const handleMockFitbitImport = () => {
    if (!user) {
      setFitbitStatus("Log in to connect Fitbit.");
      return;
    }
    const today = stripTime(new Date());
    const userEntriesNext = { ...userEntries };
    for (let i = 0; i < 7; i += 1) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = formatDateKey(d);
      const base = userEntriesNext[key] || {};
      if (base.sleepHours == null) {
        const simulated = 6 + Math.random() * 2.5;
        userEntriesNext[key] = { ...base, sleepHours: Number(simulated.toFixed(1)) };
      }
    }
    setAllEntries((prev) =>
      setUserScopedEntries(prev, user.id, userEntriesNext)
    );
    setFitbitStatus("Simulated Fitbit sleep imported for the last 7 days.");
    window.setTimeout(() => setFitbitStatus(""), 2600);
  };

  const onSelectDay = (date) => {
    if (isFutureDate(date)) {
      return;
    }
    setSelectedDate(date);
  };

  const isFutureSelected = isFutureDate(selectedDate);

  const isOnProfile = location.pathname.startsWith("/profile");

  return (
    <div className="app-shell">
      <div className="app-surface">
        <div className="ambient-orbit ambient-orbit-1" />
        <div className="ambient-orbit ambient-orbit-2" />

        <header className="app-header">
          <div className="app-title-block">
            <div className="app-title">
              <span className="app-logo-orb" />
              <span>Glow Journal</span>
              <span className="app-pill">Mood &amp; sleep tracker</span>
            </div>
            <p className="app-subtitle">
              Log how you feel, sync sleep, and let animated insights show how your days
              are really going.
            </p>
          </div>
          {user && (
            <div className="profile-chip">
              <div className="profile-avatar">
                <div className="profile-avatar-inner">
                  {user.name?.[0]?.toUpperCase() || "U"}
                </div>
              </div>
              <div className="profile-meta">
                <span className="profile-name">{user.name}</span>
                <span className="profile-email">{user.email}</span>
              </div>
              <button type="button" className="profile-logout" onClick={handleLogout}>
                Log out
              </button>
            </div>
          )}
        </header>

        <nav className="app-nav">
          <Link
            to="/"
            className={`app-nav-item ${!isOnProfile ? "active" : ""}`}
          >
            Journal
          </Link>
          <Link
            to="/profile"
            className={`app-nav-item ${isOnProfile ? "active" : ""}`}
          >
            Profile &amp; settings
          </Link>
        </nav>

        <Routes>
          <Route
            path="/"
            element={
              <>
                {!user && (
                  <section className="auth-card card-animated">
                    <div className="auth-copy">
                      <h2>Start your mood journal</h2>
                      <p>
                        Create a simple profile so your mood and sleep history stay in
                        sync across sessions on this browser.
                      </p>
                      <div className="auth-highlights">
                        <span className="auth-chip">Private to this device</span>
                        <span className="auth-chip">
                          Track mood &amp; sleep together
                        </span>
                        <span className="auth-chip">
                          Animated calendar and insights
                        </span>
                      </div>
                    </div>
                    <form className="auth-form" onSubmit={handleAuthSubmit}>
                      <label className="field-label" htmlFor="name">
                        <span>Name</span>
                        <span>Optional</span>
                      </label>
                      <input
                        id="name"
                        className="field-input"
                        type="text"
                        placeholder="How should we call you?"
                        value={authName}
                        onChange={(e) => setAuthName(e.target.value)}
                      />

                      <label className="field-label" htmlFor="email">
                        <span>Email</span>
                        <span>Used to separate profiles</span>
                      </label>
                      <input
                        id="email"
                        className="field-input"
                        type="email"
                        placeholder="you@example.com"
                        value={authEmail}
                        onChange={(e) => setAuthEmail(e.target.value)}
                      />

                      {authError && <div className="error-text">{authError}</div>}

                      <button type="submit" className="primary-button">
                        Continue
                      </button>
                    </form>
                  </section>
                )}

                <hr className="divider" />

                <main className="content-grid">
                  <section className="card card-animated">
                    <div className="card-header">
                      <div>
                        <div className="card-title">
                          Calendar · Mood &amp; sleep
                        </div>
                        <div className="card-subtitle">
                          Tap any past or today cell to review or fill in how you felt
                          and slept.
                        </div>
                      </div>
                      <div className="card-header-right">
                        <span className="badge-pill">
                          {user ? "Your private log" : "Log in to save"}
                        </span>
                      </div>
                    </div>

                    <div className="calendar-header">
                      <span className="month-label">
                        {activeMonth.toLocaleString(undefined, {
                          month: "long",
                          year: "numeric"
                        })}
                      </span>
                      <div className="calendar-nav">
                        <button
                          type="button"
                          className="icon-button"
                          onClick={() => handleMonthChange(-1)}
                        >
                          ‹
                        </button>
                        <button
                          type="button"
                          className="icon-button"
                          onClick={() => {
                            const now = new Date();
                            setActiveMonth(
                              new Date(now.getFullYear(), now.getMonth(), 1)
                            );
                            setSelectedDate(now);
                          }}
                        >
                          ●
                        </button>
                        <button
                          type="button"
                          className="icon-button"
                          onClick={() => handleMonthChange(1)}
                        >
                          ›
                        </button>
                      </div>
                    </div>

                    <div className="calendar-grid">
                      {weekdayLabels.map((day) => (
                        <div key={day} className="weekday">
                          {day}
                        </div>
                      ))}
                      {daysInMonth.map((date, idx) => {
                        if (!date) {
                          return (
                            <div key={`empty-${idx}`} className="day-cell empty" />
                          );
                        }

                        const key = formatDateKey(date);
                        const entry = userEntries[key];
                        const isToday = key === todayKey;
                        const isSelected = key === selectedKey;
                        const isFuture = isFutureDate(date);

                        return (
                          <button
                            key={key}
                            type="button"
                            className={`day-cell ${
                              isSelected ? "selected" : ""
                            } ${isFuture ? "future" : ""}`}
                            disabled={isFuture}
                            onClick={() => onSelectDay(date)}
                          >
                            <span className="day-number">{date.getDate()}</span>
                            {isToday && <span className="today-indicator" />}
                            {entry?.mood && (
                              <div
                                className={`mood-dot ${getMoodClass(entry.mood)}`}
                              />
                            )}
                            {entry?.sleepHours != null && (
                              <span className="sleep-badge">
                                {entry.sleepHours.toFixed(1)}h
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    <div className="day-legend">
                      {MOODS.map((m) => (
                        <span key={m.id} className="legend-item">
                          <span
                            className={`legend-dot ${getMoodClass(m.id)}`}
                          />
                          <span>{m.label}</span>
                        </span>
                      ))}
                    </div>
                  </section>

                  <section className="card card-animated">
                    <div className="card-header">
                      <div>
                        <div className="card-title">
                          {selectedDate.toLocaleDateString(undefined, {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                            year: "numeric"
                          })}
                        </div>
                        <div className="card-subtitle">
                          Choose your mood and sleep for this day.
                        </div>
                      </div>
                      <div className="card-header-right">
                        <span className="subtle-pill">
                          <span className="subtle-pill-dot" />
                          {user
                            ? "Autosaves locally"
                            : "Won&apos;t be saved yet"}
                        </span>
                      </div>
                    </div>

                    {isFutureSelected && (
                      <p className="future-warning">
                        You can only log for today or past days. Pick a different day
                        on the calendar.
                      </p>
                    )}

                    <form className="mood-form" onSubmit={handleSaveEntry}>
                      <div>
                        <div className="field-label">
                          <span>Mood</span>
                          <span>How did the day feel?</span>
                        </div>
                        <div className="mood-options">
                          {MOODS.map((m) => (
                            <button
                              key={m.id}
                              type="button"
                              className={`mood-chip ${
                                mood === m.id ? "active" : ""
                              }`}
                              onClick={() => setMood(m.id)}
                              disabled={isFutureSelected}
                            >
                              <span className="mood-chip-emoji">{m.emoji}</span>
                              <span>{m.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <div className="field-label">
                          <span>Sleep</span>
                          <span>Optional</span>
                        </div>
                        <div className="sleep-row">
                          <input
                            className="field-input"
                            type="number"
                            min="0"
                            max="16"
                            step="0.25"
                            placeholder="e.g. 7.5"
                            value={sleepHours}
                            onChange={(e) => setSleepHours(e.target.value)}
                            disabled={isFutureSelected}
                          />
                          <span className="sleep-hint">hours of sleep</span>
                        </div>
                        <p className="small-hint">
                          You can leave this empty if you don&apos;t track sleep that
                          day.
                        </p>
                      </div>

                      {formError && <div className="error-text">{formError}</div>}

                      <button
                        type="submit"
                        className="primary-button"
                        disabled={isFutureSelected}
                      >
                        Save for this day
                      </button>
                    </form>

                    {!user && (
                      <p className="empty-state">
                        To keep your entries, scroll up and create a quick profile.
                      </p>
                    )}
                  </section>
                </main>

                <section className="card card-animated stats-section">
                  <div className="card-header">
                    <div>
                      <div className="card-title">Animated insights</div>
                      <div className="card-subtitle">
                        Month snapshot, last 7 days, and your current streaks.
                      </div>
                    </div>
                  </div>

                  <div className="stats-grid stats-grid-wide">
                    <div className="stat-card">
                      <div className="stat-label">Average sleep this month</div>
                      <div className="stat-value">{avgSleepDisplay}</div>
                      <div className="stat-sub">
                        {monthlyStats.avgSleep != null
                          ? "Based on days where you logged sleep."
                          : "Start tracking sleep to see averages."}
                      </div>
                      <div className="trend-bar">
                        <div
                          className="trend-fill"
                          style={{ width: `${sleepLevelScore * 100}%` }}
                        />
                      </div>
                      <div className="trend-label-row">
                        <span>Low</span>
                        <span>Rested</span>
                      </div>
                    </div>

                    <div className="stat-card">
                      <div className="stat-label">Overall glow</div>
                      <div className="stat-value">{wellbeingComposite}%</div>
                      <div className="stat-sub">
                        Blend of mood and sleep for this month.
                      </div>
                      <div className="trend-bar">
                        <div
                          className="trend-fill trend-fill-glow"
                          style={{
                            width: `${wellbeingComposite}%`
                          }}
                        />
                      </div>
                      <div className="trend-label-row">
                        <span>Softer days</span>
                        <span>Brighter days</span>
                      </div>
                    </div>

                    <div className="stat-card weekly-card">
                      <div className="stat-label">Last 7 days · mood &amp; sleep</div>
                      <div className="weekly-bars">
                        {weeklyAndStreaks.last7.map(({ key, date, entry }) => {
                          const weekday = date.toLocaleDateString(undefined, {
                            weekday: "short"
                          });
                          const isToday = key === todayKey;
                          const moodClass = entry?.mood
                            ? getMoodClass(entry.mood)
                            : "";
                          const sleep = entry?.sleepHours ?? null;
                          const height = sleep != null ? 20 + sleep * 4 : 12;
                          return (
                            <div key={key} className="weekly-bar-column">
                              <div
                                className={`weekly-bar ${moodClass} ${
                                  isToday ? "is-today" : ""
                                }`}
                                style={{ height: `${height}px` }}
                              >
                                {sleep != null && (
                                  <span className="weekly-bar-sleep">
                                    {sleep.toFixed(1)}h
                                  </span>
                                )}
                              </div>
                              <span className="weekly-bar-label">
                                {weekday.slice(0, 2)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                      <div className="stat-sub">
                        Bars are colored by mood and animated to highlight your recent
                        rhythm.
                      </div>
                    </div>

                    <div className="stat-card streak-card">
                      <div className="stat-label">Streaks</div>
                      <div className="streak-row">
                        <span>Current logging streak</span>
                        <span className="streak-value">
                          {weeklyAndStreaks.loggingStreak} day
                          {weeklyAndStreaks.loggingStreak === 1 ? "" : "s"}
                        </span>
                      </div>
                      <div className="streak-row">
                        <span>Current positive mood streak</span>
                        <span className="streak-value">
                          {weeklyAndStreaks.positiveStreak} day
                          {weeklyAndStreaks.positiveStreak === 1 ? "" : "s"}
                        </span>
                      </div>
                      <div className="streak-row">
                        <span>Longest logging streak</span>
                        <span className="streak-value">
                          {weeklyAndStreaks.longestLoggingStreak} day
                          {weeklyAndStreaks.longestLoggingStreak === 1 ? "" : "s"}
                        </span>
                      </div>
                      <p className="small-hint">
                        Streaks encourage consistency, not perfection. A missed day is
                        just a new place to start.
                      </p>
                    </div>
                  </div>
                </section>

                <section className="card card-animated chatbot-card">
                  <div className="card-header">
                    <div>
                      <div className="card-title">Sleep &amp; mood coach</div>
                      <div className="card-subtitle">
                        Chat about your sleep, mood swings, and patterns you&apos;d like
                        to improve.
                      </div>
                    </div>
                  </div>

                  <div className="chatbot-body">
                    <div className="chatbot-messages">
                      {chatbot.messages.map((m, idx) => (
                        <div
                          key={`${m.from}-${idx}`}
                          className={`chatbot-message ${
                            m.from === "bot" ? "bot" : "user"
                          }`}
                        >
                          <div className="chat-bubble">{m.text}</div>
                        </div>
                      ))}
                      {chatbot.isTyping && (
                        <div className="chatbot-message bot">
                          <div className="chat-bubble typing">
                            <span className="typing-dot" />
                            <span className="typing-dot" />
                            <span className="typing-dot" />
                          </div>
                        </div>
                      )}
                    </div>
                    <form
                      className="chatbot-input-row"
                      onSubmit={(e) => {
                        e.preventDefault();
                        chatbot.sendMessage(chatbot.input);
                      }}
                    >
                      <input
                        type="text"
                        className="field-input chatbot-input"
                        placeholder="Ask about better sleep, low energy days, or mood swings..."
                        value={chatbot.input}
                        onChange={(e) => chatbot.setInput(e.target.value)}
                      />
                      <button type="submit" className="primary-button chatbot-send">
                        Send
                      </button>
                    </form>
                  </div>
                </section>
              </>
            }
          />

          <Route
            path="/profile"
            element={
              <section className="card card-animated profile-card">
                <div className="card-header">
                  <div>
                    <div className="card-title">Profile &amp; daily logs</div>
                    <div className="card-subtitle">
                      Review your history, moods, and sleep, and prepare for Fitbit sync.
                    </div>
                  </div>
                </div>

                {!user && (
                  <p className="empty-state">
                    Create a profile on the Journal tab to see your logs here.
                  </p>
                )}

                {user && (
                  <>
                    <div className="profile-summary-row">
                      <div className="profile-summary-block">
                        <div className="stat-label">Current month average sleep</div>
                        <div className="stat-value">{avgSleepDisplay}</div>
                        <div className="stat-sub">
                          Scroll below to see each day&apos;s details.
                        </div>
                      </div>
                      <div className="profile-summary-block">
                        <div className="stat-label">Current logging streak</div>
                        <div className="stat-value">
                          {weeklyAndStreaks.loggingStreak} day
                          {weeklyAndStreaks.loggingStreak === 1 ? "" : "s"}
                        </div>
                        <div className="stat-sub">
                          The more you log, the smarter your trends become.
                        </div>
                      </div>
                    </div>

                    <div className="fitbit-panel">
                      <div className="fitbit-header">
                        <span className="fitbit-pill">Fitbit sync</span>
                        <span className="fitbit-sub">
                          Planned: securely connect your Fitbit to auto‑import sleep.
                        </span>
                      </div>
                      <p className="small-hint">
                        In a full integration you&apos;d authorize Glow Journal with your
                        Fitbit account, and we&apos;d pull your nightly sleep duration
                        into these logs. For now, you can simulate that import to see how
                        it will behave.
                      </p>
                      <div className="fitbit-actions">
                        <button
                          type="button"
                          className="secondary-button"
                          onClick={handleMockFitbitImport}
                        >
                          Simulate Fitbit sleep import (last 7 days)
                        </button>
                        {fitbitStatus && (
                          <span className="fitbit-status">{fitbitStatus}</span>
                        )}
                      </div>
                    </div>

                    <div className="logs-list">
                      {allUserLogsSorted.length === 0 ? (
                        <p className="empty-state">
                          No logs yet. Once you start logging on the Journal tab, your
                          days will appear here with mood and sleep.
                        </p>
                      ) : (
                        allUserLogsSorted.map(({ key, date, entry }) => {
                          const moodMeta =
                            MOODS.find((m) => m.id === entry.mood) || null;
                          return (
                            <div key={key} className="log-row">
                              <div className="log-main">
                                <div className="log-date">
                                  {date.toLocaleDateString(undefined, {
                                    weekday: "short",
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric"
                                  })}
                                </div>
                                <div className="log-sub">
                                  {moodMeta ? (
                                    <>
                                      <span
                                        className={`log-mood-dot ${getMoodClass(
                                          moodMeta.id
                                        )}`}
                                      />
                                      <span className="log-mood-text">
                                        {moodMeta.emoji} {moodMeta.label}
                                      </span>
                                    </>
                                  ) : (
                                    <span className="log-mood-text">No mood logged</span>
                                  )}
                                </div>
                              </div>
                              <div className="log-meta">
                                {entry.sleepHours != null ? (
                                  <span className="log-sleep">
                                    {entry.sleepHours.toFixed(1)}h sleep
                                  </span>
                                ) : (
                                  <span className="log-sleep log-sleep-empty">
                                    No sleep data
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </>
                )}
              </section>
            }
          />
        </Routes>
      </div>
    </div>
  );
}

export default App;

