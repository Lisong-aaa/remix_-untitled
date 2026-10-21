import type { UserProfile, DailyRecord } from './types';

export const analyzeFoodImage = async (imageBase64: string) => {
  const res = await fetch('/api/analyze-food', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64 })
  });
  if (!res.ok) {
    throw new Error('Failed to analyze food image');
  }
  return res.json();
};

export const getDietaryAdvice = async (profile: UserProfile, todayIntake: DailyRecord, history: DailyRecord[]) => {
  const res = await fetch('/api/dietary-advice', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ profile, todayIntake, history })
  });
  if (!res.ok) {
    throw new Error('Failed to get dietary advice');
  }
  return res.json();
};
