export async function notifySessionComplete(isBreak: boolean): Promise<void> {
  const title = 'Pomodoro';
  const message = isBreak
    ? 'Break is over. Ready to focus?'
    : 'Work session complete. Time for a break!';

  playChime();

  try {
    // Try Chrome extension notifications API first
    if (typeof chrome !== 'undefined' && chrome.notifications?.create) {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: chrome.runtime.getURL('icon/128.png'),
        title,
        message,
      });
      return;
    }
  } catch {
    // Fall through to Web Notification API
  }

  // Fallback: Web Notification API
  try {
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(title, { body: message });
      } else if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          new Notification(title, { body: message });
        }
      }
    }
  } catch {
    // Notifications unavailable
  }
}

export function playChime(): void {
  try {
    const audio = new Audio(chrome.runtime.getURL('chime.mp3'));
    audio.volume = 0.5;
    audio.play().catch(() => {
      // Autoplay may be blocked; silently fail
    });
  } catch {
    // Audio not available in test environment
  }
}
