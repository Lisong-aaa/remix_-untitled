/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Camera, LayoutDashboard, User } from 'lucide-react';
import { useCalorieApp } from './hooks/useCalorieApp';
import { Scanner } from './components/Scanner';
import { Dashboard } from './components/Dashboard';
import { Profile } from './components/Profile';

export default function App() {
  const { profile, setProfile, records, todayRecord, addFoodItem, removeFoodItem, updateFoodWeight, addExercise, removeExercise } = useCalorieApp();
  const [activeTab, setActiveTab] = useState<'scanner' | 'dashboard' | 'profile'>('dashboard');

  return (
    <div className="min-h-screen bg-[#F9FAF6] text-[#2D3325] font-sans pb-24 selection:bg-[#E2E8D8]">
      <header className="bg-white border-b border-[#E2E8D8] px-6 py-4 sticky top-0 z-10 flex justify-between items-center">
        <h1 className="text-xl font-serif font-medium text-[#1A2016] tracking-tight flex items-center">
          <span className="w-8 h-8 rounded-full bg-[#7C9070] text-white flex justify-center items-center mr-2 text-sm italic">C</span>

          CalorieAI 智能饮食热量管理系统App
        </h1>
        <div className="w-8 h-8 rounded-full bg-[#F3F5EF] text-[#7C9070] flex items-center justify-center font-bold text-sm">
          {Math.round(todayRecord.totalCalories)}
        </div>
      </header>

      <main className="p-6">
        <div className="max-w-2xl mx-auto">
          {activeTab === 'scanner' && <Scanner onAddFood={addFoodItem} />}
          {activeTab === 'dashboard' && (
            <Dashboard
              todayRecord={todayRecord}
              profile={profile}
              onRemoveFood={removeFoodItem}
              onUpdateFoodWeight={updateFoodWeight}
              onAddExercise={addExercise}
              onRemoveExercise={removeExercise}
              historyRecords={Object.values(records)}
            />
          )}
          {activeTab === 'profile' && <Profile profile={profile} onSave={setProfile} />}
        </div>
      </main>

      <nav className="fixed bottom-0 left-0 w-full bg-white border-t border-[#E2E8D8] pb-safe z-20">
        <div className="flex justify-around items-center h-20 max-w-md mx-auto">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center justify-center w-20 transition-colors ${activeTab === 'dashboard' ? 'text-[#7C9070]' : 'text-[#A3AD91] hover:text-[#7C9070]'}`}
          >
            <LayoutDashboard className={`w-6 h-6 mb-1 ${activeTab === 'dashboard' ? 'fill-[#E2E8D8]' : ''}`} />
            <span className="text-xs font-medium">今日概览</span>
          </button>

          <button
            onClick={() => setActiveTab('scanner')}
            className="-mt-8 bg-[#7C9070] hover:bg-[#5D6B54] outline-none text-white p-4 rounded-xl shadow-lg shadow-[#7C907033] transition-all transform hover:scale-105 flex items-center justify-center"
          >
            <Camera className="w-7 h-7" />
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`flex flex-col items-center justify-center w-20 transition-colors ${activeTab === 'profile' ? 'text-[#7C9070]' : 'text-[#A3AD91] hover:text-[#7C9070]'}`}
          >
            <User className={`w-6 h-6 mb-1 ${activeTab === 'profile' ? 'fill-[#E2E8D8]' : ''}`} />
            <span className="text-xs font-medium">个人信息</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
