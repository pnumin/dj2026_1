'use client';

import React from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  RotateCw,
  Sparkles,
  Info
} from 'lucide-react';
import { WeekDayInfo } from '@/lib/dateUtils';

interface WeekNavigatorProps {
  weekDays: WeekDayInfo[];
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onTodayWeek: () => void;
  onRefresh: () => void;
  isLoading: boolean;
  source: string;
}

export default function WeekNavigator({
  weekDays,
  onPrevWeek,
  onNextWeek,
  onTodayWeek,
  onRefresh,
  isLoading,
  source,
}: WeekNavigatorProps) {
  if (weekDays.length === 0) return null;

  const startDay = weekDays[0];
  const endDay = weekDays[weekDays.length - 1];

  const isCurrentWeek = weekDays.some((d) => d.isToday);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6 bg-slate-900/60 border border-slate-800 p-3 rounded-2xl backdrop-blur-md">
      {/* 주간 네비게이션 버튼들 */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onPrevWeek}
          className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all cursor-pointer"
          title="이전 주"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={onTodayWeek}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
            isCurrentWeek
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
              : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white'
          }`}
        >
          이번 주
        </button>

        <button
          type="button"
          onClick={onNextWeek}
          className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all cursor-pointer"
          title="다음 주"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* 날짜 범위 표시 */}
        <div className="flex items-center gap-2 ml-2 text-sm font-semibold text-slate-200">
          <Calendar className="w-4 h-4 text-cyan-400" />
          <span>
            {startDay.date.slice(0, 4)}년 {startDay.dateFormatted} (월) ~ {endDay.dateFormatted} (금)
          </span>
        </div>
      </div>

      {/* 우측 정보 & 새로고침 */}
      <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
        {source === 'NEIS_API' ? (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>나이스 실시간</span>
          </div>
        ) : (
          <div 
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs"
            title="방학/공휴일 또는 미등록 기간으로 대진전자통신고 표준 시간표가 적용되었습니다."
          >
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span>대진 표준 시간표</span>
          </div>
        )}

        <button
          type="button"
          onClick={onRefresh}
          disabled={isLoading}
          className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all disabled:opacity-50 cursor-pointer"
          title="시간표 및 과제 새로고침"
        >
          <RotateCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
        </button>
      </div>
    </div>
  );
}
