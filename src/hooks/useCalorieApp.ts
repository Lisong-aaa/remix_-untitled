import { useState, useEffect } from 'react';
import type { FoodItem, UserProfile, DailyRecord, ExerciseItem } from '../types';
import { format } from 'date-fns';

const createEmptyRecord = (date: string): DailyRecord => ({
  date,
  items: [],
  exercises: [],
  totalCalories: 0,
  totalProtein: 0,
  totalCarbs: 0,
  totalFat: 0,
});

const calculateTotals = (rec: DailyRecord): DailyRecord => {
  const items = rec.items || [];
  const exercises = rec.exercises || [];

  let totalCaloriesIn = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;

  items.forEach(item => {
    const factor = Math.max(0, item.weightGrams || 0) / 100;
    const cals = item.caloriesPer100g || item.calories || 0;
    const p = item.proteinPer100g || item.protein || 0;
    const c = item.carbsPer100g || item.carbs || 0;
    const f = item.fatPer100g || item.fat || 0;

    totalCaloriesIn += cals * factor;
    totalProtein += p * factor;
    totalCarbs += c * factor;
    totalFat += f * factor;
  });

  let totalCaloriesBurned = 0;
  exercises.forEach(ex => {
    totalCaloriesBurned += (ex.caloriesBurned || 0);
  });

  return {
    ...rec,
    items,
    exercises,
    totalCalories: Math.max(0, totalCaloriesIn - totalCaloriesBurned),
    totalProtein,
    totalCarbs,
    totalFat,
  };
};

export function useCalorieApp() {
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('cal_profile');
    if (saved) return JSON.parse(saved);
    return {
      targetCalories: 2000,
      heightCm: 170,
      weightKg: 70,
      goalWeightKg: 65,
      activityLevel: 'sedentary',
    };
  });

  const [records, setRecords] = useState<Record<string, DailyRecord>>(() => {
    const saved = localStorage.getItem('cal_records');
    if (saved) return JSON.parse(saved);
    return {};
  });

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const todayRecord = calculateTotals(records[todayStr] || createEmptyRecord(todayStr));

  useEffect(() => {
    localStorage.setItem('cal_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('cal_records', JSON.stringify(records));
  }, [records]);

  const addFoodItem = (item: Omit<FoodItem, 'id' | 'time'>) => {
    const newItem: FoodItem = { ...item, id: crypto.randomUUID(), time: Date.now() };
    setRecords((prev) => {
      const rec = prev[todayStr] || createEmptyRecord(todayStr);
      return { ...prev, [todayStr]: calculateTotals({ ...rec, items: [...(rec.items || []), newItem] }) };
    });
  };

  const removeFoodItem = (id: string) => {
    setRecords((prev) => {
      const rec = prev[todayStr];
      if (!rec) return prev;
      return { ...prev, [todayStr]: calculateTotals({ ...rec, items: rec.items.filter(i => i.id !== id) }) };
    });
  };

  const updateFoodWeight = (id: string, weightGrams: number) => {
    setRecords((prev) => {
      const rec = prev[todayStr];
      if (!rec) return prev;
      return {
        ...prev, 
        [todayStr]: calculateTotals({
          ...rec, 
          items: rec.items.map(i => i.id === id ? { ...i, weightGrams } : i)
        })
      };
    });
  };

  const addExercise = (item: Omit<ExerciseItem, 'id' | 'time'>) => {
    const newItem: ExerciseItem = { ...item, id: crypto.randomUUID(), time: Date.now() };
    setRecords((prev) => {
      const rec = prev[todayStr] || createEmptyRecord(todayStr);
      return { ...prev, [todayStr]: calculateTotals({ ...rec, exercises: [...(rec.exercises || []), newItem] }) };
    });
  };

  const removeExercise = (id: string) => {
    setRecords((prev) => {
      const rec = prev[todayStr];
      if (!rec) return prev;
      return { ...prev, [todayStr]: calculateTotals({ ...rec, exercises: rec.exercises.filter(i => i.id !== id) }) };
    });
  };

  return { profile, setProfile, records, todayRecord, addFoodItem, removeFoodItem, updateFoodWeight, addExercise, removeExercise };
}
