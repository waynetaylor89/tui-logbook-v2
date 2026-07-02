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
