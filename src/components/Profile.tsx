import React, { useState } from 'react';
import { Save, User, Target, Activity, Ruler, Weight } from 'lucide-react';
import type { UserProfile } from '../types';

export function Profile({ profile, onSave }: { profile: UserProfile; onSave: (p: UserProfile) => void }) {
  const [formData, setFormData] = useState<UserProfile>(profile);
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'activityLevel' ? value : Number(value)
    }));
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-serif font-medium text-[#1A2016]">个人档案</h2>
        <p className="text-sm text-[#A3AD91] mt-1">设置您的身体数据和每日目标。</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="bg-white p-6 rounded-[32px] shadow-sm border border-[#E2E8D8] space-y-5">
          
          <div>
            <label className="flex items-center text-[10px] uppercase tracking-widest text-[#A3AD91] font-semibold mb-3">
              <Ruler className="w-4 h-4 mr-2" /> 身高 (cm)
            </label>
            <input
              type="number" 
              name="heightCm" 
              value={formData.heightCm} 
              onChange={handleChange}
              className="w-full px-4 py-3 bg-[#F3F5EF] border-2 border-transparent rounded-xl focus:border-[#7C9070] focus:bg-white outline-none transition-all font-bold text-sm text-[#2D3325]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center text-[10px] uppercase tracking-widest text-[#A3AD91] font-semibold mb-3">
                <Weight className="w-4 h-4 mr-2" /> 体重 (kg)
              </label>
              <input 
                type="number" 
                name="weightKg" 
                value={formData.weightKg} 
                onChange={handleChange}
                className="w-full px-4 py-3 bg-[#F3F5EF] border-2 border-transparent rounded-xl focus:border-[#7C9070] focus:bg-white outline-none transition-all font-bold text-sm text-[#2D3325]"
              />
            </div>
            <div>
              <label className="flex items-center text-[10px] uppercase tracking-widest text-[#A3AD91] font-semibold mb-3">
                <Target className="w-4 h-4 mr-2" /> 目标体重 (kg)
              </label>
              <input 
                type="number" 
                name="goalWeightKg" 
                value={formData.goalWeightKg || ''} 
                onChange={handleChange}
                className="w-full px-4 py-3 bg-[#F3F5EF] border-2 border-transparent rounded-xl focus:border-[#7C9070] focus:bg-white outline-none transition-all font-bold text-sm text-[#2D3325]"
              />
            </div>
          </div>

          <div>
            <label className="flex items-center text-[10px] uppercase tracking-widest text-[#A3AD91] font-semibold mb-3">
              <Activity className="w-4 h-4 mr-2" /> 日常活动量
            </label>
            <select 
              name="activityLevel" 
              value={formData.activityLevel} 
              onChange={handleChange}
              className="w-full px-4 py-3 bg-[#F3F5EF] border-2 border-transparent rounded-xl focus:border-[#7C9070] focus:bg-white outline-none transition-all appearance-none font-bold text-sm text-[#2D3325]"
            >
              <option value="sedentary">久坐 (几乎不运动)</option>
              <option value="lightly_active">轻度活动 (每周1-3天)</option>
              <option value="moderately_active">中度活动 (每周3-5天)</option>
              <option value="very_active">高度活动 (每周6-7天)</option>
            </select>
          </div>

          <div>
            <label className="flex items-center text-[10px] uppercase tracking-widest text-[#7C9070] font-semibold mb-3">
              <Flame className="w-4 h-4 mr-2" /> 每日目标卡路里
            </label>
            <input 
              type="number" 
              name="targetCalories" 
              value={formData.targetCalories} 
              onChange={handleChange}
              className="w-full px-4 py-3 bg-[#E8EDE0] border-2 border-transparent text-[#7C9070] font-bold rounded-xl focus:border-[#7C9070] outline-none transition-all"
            />
          </div>

        </div>

        <button 
          type="submit"
          className="w-full py-4 bg-[#7C9070] hover:bg-[#5D6B54] text-white rounded-xl font-bold flex items-center justify-center space-x-2 transition-colors relative shadow-lg shadow-[#7C907033]"
        >
          {saved ? (
             <span className="text-[#C2C9B6] font-semibold">已保存!</span>
          ) : (
            <>
              <Save className="w-5 h-5" />
              <span>保存档案</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}

// Ensure Flame icon is available in Profile by importing it or using Lucide
import { Flame } from 'lucide-react';
