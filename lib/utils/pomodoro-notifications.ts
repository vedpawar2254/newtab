export async function notifySessionComplete(isBreak: boolean): Promise<void> {
  const title = 'Pomodoro';
  const message = isBreak
    ? 'Break is over. Ready to focus?'
    : 'Work session complete. Time for a break!';

  playChime();

  try {
    if (typeof chrome !== 'undefined' && chrome.notifications) {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: chrome.runtime.getURL('icon/128.png'),
        title,
        message,
      });
    }
  } catch (err) {
    console.error('Could not send notification. Check extension permissions.', err);
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
