export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.log('This browser does not support desktop notification');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};

const REMINDER_STATE_KEY = "logbook-reminder-engine-v1";

export const defaultReminderPreferences = {
  enabled: true,
  periodDays: 7,
  reminders: {
    shiftStart: true,
    break: true,
    endShift: true,
    incompleteJob: true,
    unfinishedNotes: true,
    exportReminder: true,
    dailySummary: true,
    weeklySummary: true,
    shiftStartTime: "06:00",
    breakAfterMinutes: 180,
    endShiftTime: "18:00",
    incompleteJobMinutes: 45,
    exportReminderTime: "19:00",
    dailySummaryTime: "20:30",
    weeklySummaryDay: 1,
    weeklySummaryTime: "20:30",
  },
};

export const normalizeNotificationPreferences = (preferences) => {
  const source = preferences && typeof preferences === "object" ? preferences : {};
  return {
    ...defaultReminderPreferences,
    ...source,
    reminders: {
      ...defaultReminderPreferences.reminders,
      ...(source.reminders && typeof source.reminders === "object" ? source.reminders : {}),
    },
  };
};

const readReminderState = () => {
  try {
    const raw = localStorage.getItem(REMINDER_STATE_KEY);
    if (!raw) return { sent: {} };
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : { sent: {} };
  } catch {
    return { sent: {} };
  }
};

const writeReminderState = (state) => {
  try {
    localStorage.setItem(REMINDER_STATE_KEY, JSON.stringify(state));
  } catch {
    // Ignore local storage failures.
  }
};

const isTimeReached = (timeValue, now) => {
  const [hours, minutes] = String(timeValue || "00:00").split(":").map((part) => Number(part || 0));
  const marker = new Date(now);
  marker.setHours(hours || 0, minutes || 0, 0, 0);
  return now.getTime() >= marker.getTime();
};

const daysBetween = (left, right) => {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.floor((left.getTime() - right.getTime()) / msPerDay);
};

const deriveJobDate = (job) => {
  const stamp = job.completedAt || job.startedAt || job.claimedAt || job.updatedAt || "";
  return String(stamp).slice(0, 10);
};

const parseTurnaroundMinutes = (value) => {
  if (typeof value === "number") return value;
  const match = String(value || "").match(/\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : 0;
};

const buildNotification = ({ title, body, tag, requireInteraction = false }) => ({
  title,
  options: {
    body,
    icon: "/favicon.ico",
    tag,
    requireInteraction,
  },
  key: tag,
});

const shouldSend = (state, key, cadence, now) => {
  const sent = state.sent || {};
  const previous = sent[key];
  if (!previous) return true;

  const previousDate = new Date(previous);
  if (!Number.isFinite(previousDate.getTime())) return true;

  if (cadence === "daily") {
    return previousDate.toISOString().slice(0, 10) !== now.toISOString().slice(0, 10);
  }

  if (cadence === "weekly") {
    const currentWeek = getIsoWeek(now);
    const previousWeek = getIsoWeek(previousDate);
    return `${currentWeek.year}-${currentWeek.week}` !== `${previousWeek.year}-${previousWeek.week}`;
  }

  if (typeof cadence === "number") {
    return now.getTime() - previousDate.getTime() >= cadence * 60 * 1000;
  }

  return true;
};

const markSent = (state, reminders, nowIso) => {
  if (!reminders.length) return;
  const next = { ...state, sent: { ...(state.sent || {}) } };
  reminders.forEach((reminder) => {
    next.sent[reminder.key] = nowIso;
  });
  writeReminderState(next);
};

export const evaluateReminderEngine = ({
  shiftJobs,
  historyEntries,
  preferences,
  username,
  notificationMeta,
}) => {
  const pref = normalizeNotificationPreferences(preferences);
  if (!pref.enabled) return [];

  const remindersPref = pref.reminders;
  const now = new Date();
  const nowIso = now.toISOString();
  const today = nowIso.slice(0, 10);
  const state = readReminderState();
  const list = [];

  const jobs = (shiftJobs || []).filter(Boolean);
  const todayJobs = jobs.filter((job) => deriveJobDate(job) === today);
  const openJobs = todayJobs.filter((job) => String(job.jobState || job.status || "").toLowerCase() !== "completed");
  const inProgressJobs = todayJobs.filter((job) => String(job.jobState || job.status || "").toLowerCase() === "in progress");
  const completedJobs = todayJobs.filter((job) => String(job.jobState || job.status || "").toLowerCase() === "completed");

  const entriesToday = (historyEntries || []).filter((entry) => entry?.date === today);
  const hasActivityToday = entriesToday.length > 0 || todayJobs.length > 0;

  if (
    remindersPref.shiftStart &&
    hasActivityToday &&
    todayJobs.length > 0 &&
    !todayJobs.some((job) => Boolean(job.startedAt || job.started)) &&
    isTimeReached(remindersPref.shiftStartTime, now) &&
    shouldSend(state, "shift-start", "daily", now)
  ) {
    list.push(
      buildNotification({
        title: "Shift Start Reminder",
        body: `You have ${todayJobs.length} shift jobs queued. Start your first job when ready.`,
        tag: "shift-start",
      })
    );
  }

  if (remindersPref.break && inProgressJobs.length > 0) {
    const breakDue = inProgressJobs.some((job) => {
      const start = new Date(job.startedAt || job.claimedAt || job.updatedAt || 0);
      if (!Number.isFinite(start.getTime())) return false;
      const elapsedMinutes = (now.getTime() - start.getTime()) / (1000 * 60);
      return elapsedMinutes >= Number(remindersPref.breakAfterMinutes || 180);
    });

    if (breakDue && shouldSend(state, "break-reminder", 120, now)) {
      list.push(
        buildNotification({
          title: "Break Reminder",
          body: "You have been active for an extended period. Consider taking a short break.",
          tag: "break-reminder",
        })
      );
    }
  }

  if (
    remindersPref.endShift &&
    isTimeReached(remindersPref.endShiftTime, now) &&
    openJobs.length > 0 &&
    shouldSend(state, "end-shift", "daily", now)
  ) {
    list.push(
      buildNotification({
        title: "End Shift Reminder",
        body: `${openJobs.length} jobs are still open. Review and close your shift before sign-off.`,
        tag: "end-shift",
      })
    );
  }

  if (remindersPref.incompleteJob && openJobs.length > 0) {
    const stale = openJobs.filter((job) => {
      const base = new Date(job.startedAt || job.claimedAt || job.updatedAt || 0);
      if (!Number.isFinite(base.getTime())) return false;
      const elapsedMinutes = (now.getTime() - base.getTime()) / (1000 * 60);
      return elapsedMinutes >= Number(remindersPref.incompleteJobMinutes || 45);
    });

    if (stale.length > 0 && shouldSend(state, "incomplete-job", 60, now)) {
      list.push(
        buildNotification({
          title: "Incomplete Job Reminder",
          body: `${stale.length} jobs have been open longer than expected.`,
          tag: "incomplete-job",
        })
      );
    }
  }

  if (
    remindersPref.unfinishedNotes &&
    completedJobs.some((job) => !Array.isArray(job.notes) || job.notes.length === 0) &&
    shouldSend(state, "unfinished-notes", "daily", now)
  ) {
    list.push(
      buildNotification({
        title: "Unfinished Notes Reminder",
        body: "One or more completed jobs are missing notes. Add notes before ending shift.",
        tag: "unfinished-notes",
      })
    );
  }

  const exportedToday = String(notificationMeta?.lastExportAt || "").slice(0, 10) === today;
  if (
    remindersPref.exportReminder &&
    hasActivityToday &&
    !exportedToday &&
    isTimeReached(remindersPref.exportReminderTime, now) &&
    shouldSend(state, "export-reminder", "daily", now)
  ) {
    list.push(
      buildNotification({
        title: "Export Reminder",
        body: "You have activity today. Export your data for end-of-day handover.",
        tag: "export-reminder",
      })
    );
  }

  if (
    remindersPref.dailySummary &&
    isTimeReached(remindersPref.dailySummaryTime, now) &&
    shouldSend(state, "daily-summary", "daily", now)
  ) {
    const aircraftCount = new Set(entriesToday.map((entry) => entry.aircraft).filter(Boolean)).size;
    const totalTurnaround = completedJobs
      .map((job) => parseTurnaroundMinutes(job.turnaroundTime))
      .filter((value) => value > 0);
    const avgTurnaround = totalTurnaround.length
      ? (totalTurnaround.reduce((sum, value) => sum + value, 0) / totalTurnaround.length).toFixed(1)
      : "0.0";

    list.push(
      buildNotification({
        title: "Daily Summary Notification",
        body: `${username}: ${todayJobs.length} jobs, ${entriesToday.length} movements, ${aircraftCount} aircraft, avg turnaround ${avgTurnaround}m.`,
        tag: "daily-summary",
      })
    );
  }

  const weeklyDay = Number(remindersPref.weeklySummaryDay || 1);
  const dayMatches = ((now.getDay() + 6) % 7) + 1 === weeklyDay;
  if (
    remindersPref.weeklySummary &&
    dayMatches &&
    isTimeReached(remindersPref.weeklySummaryTime, now) &&
    shouldSend(state, "weekly-summary", "weekly", now)
  ) {
    const weekWindow = new Date(now);
    weekWindow.setDate(now.getDate() - 7);

    const weekJobs = jobs.filter((job) => {
      const stamp = new Date(job.completedAt || job.startedAt || job.claimedAt || 0);
      return Number.isFinite(stamp.getTime()) && stamp >= weekWindow;
    }).length;

    const weekEntries = (historyEntries || []).filter((entry) => {
      const stamp = new Date(`${entry.date || ""}T00:00:00`);
      return Number.isFinite(stamp.getTime()) && daysBetween(now, stamp) <= 7;
    }).length;

    list.push(
      buildNotification({
        title: "Weekly Summary Notification",
        body: `${username}: Last 7 days delivered ${weekJobs} jobs and ${weekEntries} movement records.`,
        tag: "weekly-summary",
      })
    );
  }

  markSent(state, list, nowIso);
  return list;
};

export const dispatchReminderNotifications = (reminders) => {
  if (!Array.isArray(reminders) || reminders.length === 0) return 0;
  if (!("Notification" in window) || Notification.permission !== "granted") return 0;

  reminders.forEach((reminder) => {
    new Notification(reminder.title, reminder.options);
  });

  return reminders.length;
};

function getIsoWeek(dateInput) {
  const date = new Date(Date.UTC(dateInput.getFullYear(), dateInput.getMonth(), dateInput.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const week = Math.ceil((((date - yearStart) / 86400000) + 1) / 7);
  return { year: date.getUTCFullYear(), week };
}

export const checkInactivityNotification = (userHistory, periodDays = 7) => {
  if (!userHistory || userHistory.length === 0) {
    return false;
  }

  const lastEntry = userHistory[0];
  const lastEntryDate = new Date(lastEntry.date);
  const now = new Date();
  const daysSinceLastEntry = (now - lastEntryDate) / (1000 * 60 * 60 * 24);

  return daysSinceLastEntry >= periodDays;
};

export const sendInactivityNotification = (username, periodDays = 7) => {
  if (Notification.permission === 'granted') {
    new Notification('TUI Logbook - No Recent Activity', {
      body: `You haven't recorded any aircraft movements in the last ${periodDays} days, ${username}. Time to log some movements!`,
      icon: '/favicon.ico',
      tag: 'inactivity-reminder',
    });
  }
};

export const checkAndNotifyInactivity = (userHistory, username, preferences = { enabled: true, periodDays: 7 }) => {
  if (!preferences.enabled) return false;
  if (checkInactivityNotification(userHistory, preferences.periodDays)) {
    sendInactivityNotification(username, preferences.periodDays);
    return true;
  }
  return false;
};

export const checkUpcomingInactivityWarning = (userHistory) => {
  if (!userHistory || userHistory.length === 0) {
    return false;
  }

  const lastEntry = userHistory[0];
  const lastEntryDate = new Date(lastEntry.date);
  const now = new Date();
  const daysSinceLastEntry = (now - lastEntryDate) / (1000 * 60 * 60 * 24);

  // Check if exactly 23 days since last entry (7 days before 30 days)
  return daysSinceLastEntry >= 23 && daysSinceLastEntry < 24;
};

export const sendUpcomingInactivityWarning = (username) => {
  if (Notification.permission === 'granted') {
    new Notification('TUI Logbook - Upcoming Inactivity Warning', {
      body: `Warning: You have 7 days before reaching 30 days of inactivity, ${username}. Please log some aircraft movements soon!`,
      icon: '/favicon.ico',
      tag: 'upcoming-inactivity-warning',
      requireInteraction: true,
    });
  }
};

export const checkAndNotifyUpcomingInactivity = (userHistory, username, preferences = { enabled: true, periodDays: 7 }) => {
  if (!preferences.enabled) return false;
  
  if (checkUpcomingInactivityWarning(userHistory)) {
    sendUpcomingInactivityWarning(username);
    return true;
  }
  return false;
};
