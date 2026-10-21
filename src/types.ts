export interface FoodItem {
  id: string;
  foodName: string;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  weightGrams: number;
  description: string;
  time: number; // timestamp
}

export type ExerciseType = '跑步' | '骑行' | '爬楼梯' | '其他';

export interface ExerciseItem {
  id: string;
  exerciseName: ExerciseType;
  durationMinutes: number;
  caloriesBurned: number;
  time: number;
}

export interface UserProfile {
  targetCalories: number;
  heightCm: number;
  weightKg: number;
  goalWeightKg?: number;
  activityLevel: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active';
}

export interface DailyRecord {
  date: string; // YYYY-MM-DD
  items: FoodItem[];
  exercises: ExerciseItem[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}
