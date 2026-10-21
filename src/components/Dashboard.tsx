import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Flame, Info, Trash2, TrendingUp, Sparkles, Loader2, Activity, Plus, Calculator } from 'lucide-react';
import type { DailyRecord, UserProfile, ExerciseItem, ExerciseType, FoodItem } from '../types';
import { getDietaryAdvice } from '../api';

const MACRO_COLORS = ['#7C9070', '#A3AD91', '#C2C9B6']; // Primary, Secondary, Highlight

const FoodItemRow = ({ item, onRemoveFood, onUpdateFoodWeight }: { item: FoodItem, onRemoveFood: (id: string) => void, onUpdateFoodWeight: (id: string, weight: number) => void }) => {
  const [weight, setWeight] = useState<number>(item.weightGrams || 100);

  const handleCalculate = () => {
    onUpdateFoodWeight(item.id, weight);
  };

  const calPer100g = item.caloriesPer100g || item.calories || 0;
  const factor = (item.weightGrams || 0) / 100;
  const displayCal = Math.round(calPer100g * factor);
  const isCalculated = item.weightGrams > 0;

  return (
    <div className="bg-white p-4 rounded-[20px] shadow-sm border border-[#E2E8D8] flex flex-col space-y-3">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-medium text-[#2D3325] capitalize text-base">{item.foodName}</h4>
          <div className="text-xs text-[#A3AD91] mt-0.5">{Math.round(calPer100g)} kcal / 100g</div>
        </div>
        <button 
          onClick={() => onRemoveFood(item.id)}
          className="p-2 text-[#A3AD91] hover:text-[#D55F5A] transition-colors hover:bg-red-50 rounded-full"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      
      <div className="flex items-center justify-between border-t border-[#F3F5EF] pt-3 mt-1">
        <div className="flex items-center bg-[#F3F5EF] rounded-xl p-1 w-fit border border-transparent focus-within:border-[#7C9070] transition-colors">
          <input 
            type="number"
            value={weight || ''}
            onChange={(e) => setWeight(parseInt(e.target.value) || 0)}
            className="w-16 bg-transparent text-center font-semibold text-[#2D3325] focus:outline-none"
          />
          <span className="text-xs text-[#7C9070] pr-3 font-medium">克 (g)</span>
        </div>
        <div className="flex items-center gap-3">
          {isCalculated && (
            <div className="text-sm font-bold text-[#7C9070]">{displayCal} kcal</div>
          )}
          <button 
            onClick={handleCalculate}
            className="bg-[#7C9070] text-white text-[11px] font-bold px-3 py-2 rounded-xl shadow-md shadow-[#7C907033] hover:bg-[#5D6B54] transition-colors flex items-center gap-1"
          >
            <Calculator className="w-3 h-3" />
            {isCalculated ? '重新计算' : '计入概况'}
          </button>
        </div>
      </div>
    </div>
  );
};

export function Dashboard({ 
  todayRecord, 
  profile, 
  onRemoveFood,
  onUpdateFoodWeight,
  onAddExercise,
  onRemoveExercise,
  historyRecords
}: { 
  todayRecord: DailyRecord; 
  profile: UserProfile;
  onRemoveFood: (id: string) => void;
  onUpdateFoodWeight: (id: string, weightGrams: number) => void;
  onAddExercise: (ex: Omit<ExerciseItem, 'id' | 'time'>) => void;
  onRemoveExercise: (id: string) => void;
  historyRecords: DailyRecord[];
}) {
  const { totalCalories, totalProtein, totalCarbs, totalFat, items, exercises = [] } = todayRecord;
  const calPercent = Math.min(100, Math.max(0, Math.round((totalCalories / profile.targetCalories) * 100)));
  
  const macroData = [
    { name: 'Protein', value: totalProtein },
    { name: 'Carbs', value: totalCarbs },
    { name: 'Fat', value: totalFat },
  ].filter(d => d.value > 0);

  const [adviceData, setAdviceData] = useState<any>(null);
  const [loadingAdvice, setLoadingAdvice] = useState(false);
  const [showExerciseForm, setShowExerciseForm] = useState(false);
  const [exerciseType, setExerciseType] = useState<ExerciseType>('跑步');
  const [exerciseDuration, setExerciseDuration] = useState<string>('30');

  const totalIntake = items.reduce((acc, item) => {
    const factor = (item.weightGrams || 0) / 100;
    const cals = item.caloriesPer100g || item.calories || 0;
    return acc + (cals * factor);
  }, 0);
  const totalBurned = exercises.reduce((acc, ex) => acc + (ex.caloriesBurned || 0), 0);

  useEffect(() => {
    if (items.length === 0 && exercises.length === 0) return;
    const timer = setTimeout(() => {
      setLoadingAdvice(true);
      getDietaryAdvice(profile, todayRecord, historyRecords)
        .then(setAdviceData)
        .catch(err => console.error(err))
        .finally(() => setLoadingAdvice(false));
    }, 1500);
    return () => clearTimeout(timer);
  }, [items.length, exercises.length, todayRecord.totalCalories]); 

  const handleAddExercise = (e: React.FormEvent) => {
    e.preventDefault();
    const duration = parseInt(exerciseDuration) || 0;
    if (duration <= 0) return;
    
    // Rough estimation of calories burned based on type
    let calPerMin = 10;
    if (exerciseType === '跑步') calPerMin = 10;
    else if (exerciseType === '骑行') calPerMin = 8;
    else if (exerciseType === '爬楼梯') calPerMin = 12;
    else calPerMin = 6;
    
    onAddExercise({
      exerciseName: exerciseType,
      durationMinutes: duration,
      caloriesBurned: duration * calPerMin,
    });
    setShowExerciseForm(false);
  };

  return (
    <div className="w-full max-w-lg mx-auto space-y-8 pb-20">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-serif font-medium text-[#1A2016]">今日概览</h2>
          <p className="text-[#7C9070] text-sm mt-1">{todayRecord.date}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-[32px] shadow-sm border border-[#E2E8D8] flex flex-col items-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-[#F3F5EF]">
          <div 
            className="h-full bg-[#7C9070] transition-all duration-1000 ease-out"
            style={{ width: `${calPercent}%` }}
          />
        </div>
        
        <div className="relative w-40 h-40 flex items-center justify-center mt-2">
          <svg className="w-full h-full transform -rotate-90">
             <circle cx="80" cy="80" r="70" className="stroke-[#F3F5EF]" strokeWidth="12" fill="none" />
             <circle 
               cx="80" cy="80" r="70" 
               className="stroke-[#7C9070] transition-all duration-1000 ease-out" 
               strokeWidth="12" 
               fill="none" 
               strokeLinecap="round"
               strokeDasharray={439.8}
               strokeDashoffset={439.8 - (calPercent / 100) * 439.8}
             />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="text-3xl font-bold text-[#2D3325] tracking-tight mt-2">{Math.round(totalCalories)}</span>
            <span className="text-[10px] text-[#A3AD91] uppercase tracking-widest mt-1">净卡路里</span>
          </div>
        </div>

        <div className="flex w-full items-center justify-center gap-8 mt-6 z-10">
          <div className="flex flex-col items-center">
            <span className="text-lg font-bold text-[#2D3325]">{Math.round(totalIntake)}</span>
            <span className="text-[10px] text-[#A3AD91] uppercase tracking-widest mt-1">饮食摄入</span>
          </div>
          <div className="w-px h-8 bg-[#E2E8D8]"></div>
          <div className="flex flex-col items-center">
            <span className="text-lg font-bold text-[#7C9070]">-{Math.round(totalBurned)}</span>
            <span className="text-[10px] text-[#A3AD91] uppercase tracking-widest mt-1">运动消耗</span>
          </div>
        </div>
        
        <p className="text-xs text-[#A3AD91] mt-6 font-medium uppercase tracking-widest text-center">
          剩余可摄入: {Math.max(0, profile.targetCalories - Math.round(totalCalories))} kcal
        </p>

        {macroData.length > 0 && (
          <div className="w-full mt-8 pt-6 border-t border-[#F3F5EF]">
            <h3 className="font-bold mb-4 flex items-center gap-2 text-[#2D3325]">营养分布</h3>
            <div className="flex items-center">
              <div className="w-32 h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={macroData} innerRadius={25} outerRadius={45} paddingAngle={5} dataKey="value" stroke="none">
                      {macroData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={MACRO_COLORS[index % MACRO_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-3 pl-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-[#7C9070]" />
                    <span className="text-[#5D6B54]">蛋白质</span>
                  </div>
                  <span className="font-semibold text-[#2D3325]">{Math.round(totalProtein)}g</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-[#A3AD91]" />
                    <span className="text-[#5D6B54]">碳水</span>
                  </div>
                  <span className="font-semibold text-[#2D3325]">{Math.round(totalCarbs)}g</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-[#C2C9B6]" />
                    <span className="text-[#5D6B54]">脂肪</span>
                  </div>
                  <span className="font-semibold text-[#2D3325]">{Math.round(totalFat)}g</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {(loadingAdvice || adviceData) && (
        <div className="bg-[#2D3325] text-white p-8 rounded-[40px] shadow-sm border border-[#ffffff1a] flex flex-col">
          <div className="flex items-center space-x-2 mb-6">
            <div className="w-6 h-6 bg-[#7C9070] rounded-full flex items-center justify-center">
              <span className="text-[10px]">AI</span>
            </div>
            <h3 className="text-sm font-medium">智能建议方案</h3>
          </div>
          {loadingAdvice ? (
            <div className="flex items-center space-x-3 text-[#A3AD91] py-4">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm font-medium">正在分析您的饮食记录...</span>
            </div>
          ) : (
            <div className="space-y-6">
              <section>
                <h4 className="text-[#A3AD91] text-[10px] uppercase tracking-widest mb-3">饮食总结</h4>
                <p className="text-sm leading-relaxed font-light">{adviceData.summary}</p>
              </section>
              
              <section>
                <h4 className="text-[#A3AD91] text-[10px] uppercase tracking-widest mb-3">下一步建议</h4>
                <div className="p-4 bg-[#ffffff0d] rounded-2xl border border-[#ffffff1a]">
                  <p className="text-xs mb-2">体重影响评估:</p>
                  <p className="text-sm font-bold text-white mb-2">{adviceData.weightImpact}</p>
                  <p className="text-xs mb-1">建议方案:</p>
                  <p className="text-sm font-bold text-[#7C9070]">{adviceData.advice}</p>
                </div>
              </section>
            </div>
          )}
        </div>
      )}

      <div>
        <h3 className="font-bold flex items-center gap-2 mb-4 px-1 text-[#2D3325] uppercase tracking-widest text-[11px]">
          <span className="w-2 h-2 bg-[#7C9070] rounded-full"></span>
          饮食清单 ({items.length})
        </h3>
        {items.length === 0 ? (
          <div className="text-center py-10 bg-[#F3F5EF] rounded-xl border border-[#E2E8D8] border-dashed">
            <p className="text-[#5D6B54] text-sm font-medium">今日暂无饮食记录</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <FoodItemRow 
                key={item.id} 
                item={item} 
                onRemoveFood={onRemoveFood} 
                onUpdateFoodWeight={onUpdateFoodWeight} 
              />
            ))}
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-4 px-1">
          <h3 className="font-bold flex items-center gap-2 text-[#2D3325] uppercase tracking-widest text-[11px]">
            <span className="w-2 h-2 bg-[#C2C9B6] rounded-full"></span>
            运动消耗 ({exercises.length})
          </h3>
          <button 
            onClick={() => setShowExerciseForm(!showExerciseForm)}
            className="text-xs font-bold text-[#7C9070] bg-[#E8EDE0] px-3 py-1.5 rounded-full hover:bg-[#D4DDD0] transition-colors flex items-center gap-1"
          >
            <Plus className="w-3 h-3" /> 添加运动
          </button>
        </div>

        {showExerciseForm && (
          <form onSubmit={handleAddExercise} className="bg-white p-5 rounded-[24px] shadow-sm border border-[#E2E8D8] mb-4 space-y-4 animate-in fade-in zoom-in-95">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] text-[#A3AD91] uppercase tracking-widest font-semibold block mb-2">运动类型</label>
                <select 
                  value={exerciseType} 
                  onChange={(e) => setExerciseType(e.target.value as ExerciseType)}
                  className="w-full bg-[#F3F5EF] p-3 rounded-xl font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#7C9070]"
                >
                  <option value="跑步">跑步</option>
                  <option value="骑行">骑行</option>
                  <option value="爬楼梯">爬楼梯</option>
                  <option value="其他">其他</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] text-[#A3AD91] uppercase tracking-widest font-semibold block mb-2">时长 (分钟)</label>
                <input 
                  type="number" 
                  value={exerciseDuration} 
                  onChange={(e) => setExerciseDuration(e.target.value)}
                  className="w-full bg-[#F3F5EF] p-3 rounded-xl font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#7C9070]"
                  min="1"
                />
              </div>
            </div>
            <button type="submit" className="w-full bg-[#7C9070] text-white font-bold py-3 rounded-xl shadow-lg shadow-[#7C907033] hover:bg-[#5D6B54] transition-colors text-sm">
              记录运动
            </button>
          </form>
        )}

        {exercises.length === 0 ? (
          <div className="text-center py-10 bg-[#F3F5EF] rounded-xl border border-[#E2E8D8] border-dashed">
            <p className="text-[#5D6B54] text-sm font-medium">今日暂无运动记录</p>
          </div>
        ) : (
          <div className="space-y-3">
            {exercises.map((ex) => (
              <div key={ex.id} className="bg-white p-4 rounded-[20px] shadow-sm border border-[#E2E8D8] flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#E8EDE0] flex items-center justify-center text-[#7C9070]">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-medium text-[#2D3325] text-sm">{ex.exerciseName}</h4>
                    <span className="text-xs text-[#A3AD91]">{ex.durationMinutes} 分钟</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-bold text-[#7C9070] text-sm">-{ex.caloriesBurned} kcal</span>
                  <button 
                    onClick={() => onRemoveExercise(ex.id)}
                    className="p-2 text-[#A3AD91] hover:text-[#D55F5A] transition-colors hover:bg-red-50 rounded-full"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
