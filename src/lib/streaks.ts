interface EmotionLog {
  emotion: string;
  timestamp: number;
}

const STREAK_KEY = 'aangan_emotion_streak';

export const getEmotionStreak = (): { emotion: string; streak: number } => {
  const data = localStorage.getItem(STREAK_KEY);
  if (!data) {
    return { emotion: '', streak: 0 };
  }

  try {
    const logs: EmotionLog[] = JSON.parse(data);
    if (logs.length === 0) {
      return { emotion: '', streak: 0 };
    }

    const lastLog = logs[logs.length - 1];
    let streak = 0;
    let currentEmotion = lastLog.emotion;

    for (let i = logs.length - 1; i >= 0; i--) {
      const log = logs[i];
      const logDate = new Date(log.timestamp);
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - (logs.length - 1 - i));

      if (
        log.emotion === currentEmotion &&
        logDate.getFullYear() === yesterday.getFullYear() &&
        logDate.getMonth() === yesterday.getMonth() &&
        logDate.getDate() === yesterday.getDate()
      ) {
        streak++;
      } else {
        break;
      }
    }

    return { emotion: currentEmotion, streak };
  } catch (error) {
    console.error('Error parsing emotion streak data:', error);
    return { emotion: '', streak: 0 };
  }
};

export const updateEmotionStreak = (emotion: string) => {
  const data = localStorage.getItem(STREAK_KEY);
  let logs: EmotionLog[] = [];

  if (data) {
    try {
      logs = JSON.parse(data);
    } catch (error) {
      console.error('Error parsing emotion streak data:', error);
    }
  }

  const today = new Date();
  const lastLog = logs[logs.length - 1];

  if (
    lastLog &&
    new Date(lastLog.timestamp).getFullYear() === today.getFullYear() &&
    new Date(lastLog.timestamp).getMonth() === today.getMonth() &&
    new Date(lastLog.timestamp).getDate() === today.getDate()
  ) {
    // Already logged an emotion today, do nothing
    return;
  }

  logs.push({ emotion, timestamp: Date.now() });
  localStorage.setItem(STREAK_KEY, JSON.stringify(logs));
};
