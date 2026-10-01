'use client';

import React from 'react';
import { 
  GraduationCap, 
  Settings, 
  CheckCircle2, 
  Database, 
  ListTodo,
  Layers
} from 'lucide-react';

interface HeaderProps {
  grade: number;
  setGrade: (grade: number) => void;
  classNm: string;
  setClassNm: (classNm: string) => void;
  isSupabaseConfigured: boolean;
  onOpenSettings: () => void;
  onOpenDashboard: () => void;
  totalTaskCount: number;
  pendingTaskCount: number;
}

export default function Header({
  grade,
  setGrade,
  classNm,
  setClassNm,
  isSupabaseConfigured,
  onOpenSettings,
  onOpenDashboard,
  totalTaskCount,
  pendingTaskCount,
}: HeaderProps) {
  return (
    <header className="glass-panel sticky top-0 z-30 px-4 lg:px-8 py-3.5 mb-6 border-b border-cyan-500/10">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* 학교 로고 & 타이틀 */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-white">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                NEIS 연동
              </span>
              <span className="text-xs text-slate-400">부산광역시교육청</span>
            </div>
            <h1 className="text-lg md:text-xl font-bold bg-gradient-to-r from-white via-slate-100 to-cyan-200 bg-clip-text text-transparent">
              대진전자통신고등학교 시간표 & 과제
            </h1>
          </div>
        </div>

        {/* 학년/반 셀렉터 & 컨트롤 */}
        <div className="flex flex-wrap items-center justify-between md:justify-end gap-2.5 w-full md:w-auto">
          <div className="flex items-center bg-slate-900/80 border border-slate-700/60 rounded-xl p-1 gap-1 shadow-inner">
            {/* 학년 선택 */}
            <div className="flex items-center px-2 py-1">
              <span className="text-xs text-slate-400 mr-2 font-medium">학년</span>
              <div className="flex gap-1">
                {[1, 2, 3].map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGrade(g)}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                      grade === g
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/25'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    {g}학년
                  </button>
                ))}
              </div>
            </div>

            <div className="h-4 w-[1px] bg-slate-700 mx-0.5" />

            {/* 반 선택 */}
            <div className="flex items-center px-2 py-1">
              <span className="text-xs text-slate-400 mr-2 font-medium">반</span>
              <select
                value={classNm}
                onChange={(e) => setClassNm(e.target.value)}
                className="bg-slate-800 text-cyan-300 font-semibold text-xs rounded-lg px-2.5 py-1 border border-slate-700 focus:outline-none focus:border-cyan-500 cursor-pointer"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((c) => (
                  <option key={c} value={String(c)}>
                    {c}반
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 과제 대시보드 버튼 */}
          <button
            type="button"
            onClick={onOpenDashboard}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-cyan-500/40 text-xs font-medium text-slate-200 transition-all shadow-sm"
          >
            <ListTodo className="w-4 h-4 text-cyan-400" />
            <span>과제 현황</span>
            {pendingTaskCount > 0 ? (
              <span className="px-1.5 py-0.2 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[11px] font-bold">
                {pendingTaskCount}
              </span>
            ) : (
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px]">
                {totalTaskCount}
              </span>
            )}
          </button>

          {/* Supabase 상태 & 설정 버튼 */}
          <button
            type="button"
            onClick={onOpenSettings}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-all ${
              isSupabaseConfigured
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                : 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
            }`}
            title={isSupabaseConfigured ? 'Supabase 연동 중' : '로컬 모드 (Supabase 미연동)'}
          >
            <Database className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {isSupabaseConfigured ? 'Supabase' : '로컬모드'}
            </span>
            <Settings className="w-3 h-3 opacity-70 ml-0.5" />
          </button>
        </div>
      </div>
    </header>
  );
}
