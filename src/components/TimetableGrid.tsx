'use client';

import React from 'react';
import { WeekDayInfo, PERIOD_TIMES } from '@/lib/dateUtils';
import { Task, TimetableItem } from '@/types';
import { Clock, Plus, CheckCircle, AlertCircle, FileText } from 'lucide-react';

interface TimetableGridProps {
  weekDays: WeekDayInfo[];
  timetableData: TimetableItem[];
  tasks: Task[];
  onSelectCell: (day: WeekDayInfo, period: number, subjectName: string) => void;
  isLoading: boolean;
}

export default function TimetableGrid({
  weekDays,
  timetableData,
  tasks,
  onSelectCell,
  isLoading,
}: TimetableGridProps) {
  const periods = [1, 2, 3, 4, 5, 6, 7];

  // (날짜, 교시)별 시간표 과목 매핑
  const timetableMap: Record<string, string> = {};
  timetableData.forEach((item) => {
    // ALL_TI_YMD는 YYYYMMDD 포맷
    const key = `${item.ALL_TI_YMD}_${item.PERIO}`;
    timetableMap[key] = item.ITRT_CNTNT || item.ITRT_CNT || '';
  });

  // (날짜, 교시)별 과제 매핑
  const getCellTasks = (dateDash: string, period: number) => {
    return tasks.filter((t) => t.target_date === dateDash && t.period === period);
  };

  return (
    <div className="w-full overflow-x-auto pb-4">
      <div className="min-w-[800px] bg-slate-900/40 rounded-3xl border border-slate-800/80 p-3 sm:p-5 backdrop-blur-xl shadow-2xl">
        {/* 요일 헤더 */}
        <div className="grid grid-cols-[100px_repeat(5,1fr)] gap-3 mb-3">
          {/* 교시 헤더 코너 */}
          <div className="flex flex-col items-center justify-center p-2 rounded-2xl bg-slate-800/40 border border-slate-800 text-slate-400">
            <Clock className="w-4 h-4 mb-1 text-cyan-400" />
            <span className="text-[11px] font-medium">교시 / 시간</span>
          </div>

          {/* 월~금 헤더 */}
          {weekDays.map((day) => (
            <div
              key={day.date}
              className={`flex flex-col items-center justify-center py-2.5 px-3 rounded-2xl border transition-all ${
                day.isToday
                  ? 'bg-gradient-to-b from-cyan-500/20 to-indigo-500/10 border-cyan-500/50 shadow-lg shadow-cyan-500/10'
                  : 'bg-slate-800/40 border-slate-800/70'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span
                  className={`text-sm font-bold ${
                    day.isToday ? 'text-cyan-300' : 'text-slate-200'
                  }`}
                >
                  {day.dayName}요일
                </span>
                {day.isToday && (
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                )}
              </div>
              <span
                className={`text-xs ${
                  day.isToday ? 'text-cyan-200/80 font-semibold' : 'text-slate-400'
                }`}
              >
                {day.dateFormatted}
              </span>
            </div>
          ))}
        </div>

        {/* 교시별 행 (1~4교시) */}
        {periods.slice(0, 4).map((period) => (
          <div
            key={period}
            className="grid grid-cols-[100px_repeat(5,1fr)] gap-3 mb-2.5 items-stretch"
          >
            {/* 좌측 교시 인덱스 */}
            <div className="flex flex-col items-center justify-center p-2 rounded-2xl bg-slate-800/30 border border-slate-800/60 text-center">
              <span className="text-sm font-bold text-slate-200">{period}교시</span>
              <span className="text-[10px] text-slate-400 tracking-tighter">
                {PERIOD_TIMES[period]}
              </span>
            </div>

            {/* 요일별 셀 */}
            {weekDays.map((day) => {
              const subjectKey = `${day.ymd}_${period}`;
              const subjectName = timetableMap[subjectKey] || '';
              const cellTasks = getCellTasks(day.date, period);
              const pendingCount = cellTasks.filter((t) => !t.is_completed).length;
              const hasCompleted = cellTasks.length > 0 && pendingCount === 0;

              return (
                <button
                  key={`${day.date}_${period}`}
                  type="button"
                  onClick={() => onSelectCell(day, period, subjectName || '자율학습')}
                  className={`group relative text-left p-3.5 rounded-2xl border transition-all duration-200 flex flex-col justify-between min-h-[92px] cursor-pointer ${
                    day.isToday
                      ? 'bg-slate-800/60 hover:bg-slate-800/90 border-cyan-500/25 hover:border-cyan-400/60 shadow-sm shadow-cyan-950/20'
                      : 'bg-slate-900/60 hover:bg-slate-800/70 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* 상단: 과목명 */}
                  <div>
                    {subjectName ? (
                      <span className="font-bold text-sm text-slate-100 group-hover:text-cyan-300 transition-colors line-clamp-2">
                        {subjectName}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400 italic">
                        {isLoading ? '조회 중...' : '미편성'}
                      </span>
                    )}
                  </div>

                  {/* 하단: 과제 배지 또는 추가 유도 */}
                  <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-800/60">
                    {cellTasks.length > 0 ? (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {pendingCount > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[11px] font-semibold">
                            <AlertCircle className="w-3 h-3 text-rose-400" />
                            과제 {pendingCount}
                          </span>
                        ) : hasCompleted ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-medium">
                            <CheckCircle className="w-3 h-3 text-emerald-400" />
                            완료 {cellTasks.length}
                          </span>
                        ) : null}
                      </div>
                    ) : (
                      <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 text-[11px] text-cyan-400 transition-opacity">
                        <Plus className="w-3 h-3" />
                        <span>과제 등록</span>
                      </div>
                    )}

                    <span className="text-[10px] text-slate-400 group-hover:text-slate-400">
                      {period}교시
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        ))}

        {/* 점심시간 구분 배너 */}
        <div className="my-3 py-2 px-4 rounded-xl bg-gradient-to-r from-cyan-950/30 via-slate-900/60 to-indigo-950/30 border border-cyan-500/10 flex items-center justify-center gap-2 text-xs text-cyan-300/80">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-semibold">점심시간 (12:50 ~ 13:40) & 휴식</span>
        </div>

        {/* 교시별 행 (5~7교시) */}
        {periods.slice(4).map((period) => (
          <div
            key={period}
            className="grid grid-cols-[100px_repeat(5,1fr)] gap-3 mb-2.5 items-stretch"
          >
            {/* 좌측 교시 인덱스 */}
            <div className="flex flex-col items-center justify-center p-2 rounded-2xl bg-slate-800/30 border border-slate-800/60 text-center">
              <span className="text-sm font-bold text-slate-200">{period}교시</span>
              <span className="text-[10px] text-slate-400 tracking-tighter">
                {PERIOD_TIMES[period]}
              </span>
            </div>

            {/* 요일별 셀 */}
            {weekDays.map((day) => {
              const subjectKey = `${day.ymd}_${period}`;
              const subjectName = timetableMap[subjectKey] || '';
              const cellTasks = getCellTasks(day.date, period);
              const pendingCount = cellTasks.filter((t) => !t.is_completed).length;
              const hasCompleted = cellTasks.length > 0 && pendingCount === 0;

              return (
                <button
                  key={`${day.date}_${period}`}
                  type="button"
                  onClick={() => onSelectCell(day, period, subjectName || '자율학습')}
                  className={`group relative text-left p-3.5 rounded-2xl border transition-all duration-200 flex flex-col justify-between min-h-[92px] cursor-pointer ${
                    day.isToday
                      ? 'bg-slate-800/60 hover:bg-slate-800/90 border-cyan-500/25 hover:border-cyan-400/60 shadow-sm shadow-cyan-950/20'
                      : 'bg-slate-900/60 hover:bg-slate-800/70 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div>
                    {subjectName ? (
                      <span className="font-bold text-sm text-slate-100 group-hover:text-cyan-300 transition-colors line-clamp-2">
                        {subjectName}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400 italic">
                        {isLoading ? '조회 중...' : '미편성'}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-800/60">
                    {cellTasks.length > 0 ? (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {pendingCount > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[11px] font-semibold">
                            <AlertCircle className="w-3 h-3 text-rose-400" />
                            과제 {pendingCount}
                          </span>
                        ) : hasCompleted ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-medium">
                            <CheckCircle className="w-3 h-3 text-emerald-400" />
                            완료 {cellTasks.length}
                          </span>
                        ) : null}
                      </div>
                    ) : (
                      <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 text-[11px] text-cyan-400 transition-opacity">
                        <Plus className="w-3 h-3" />
                        <span>과제 등록</span>
                      </div>
                    )}

                    <span className="text-[10px] text-slate-400 group-hover:text-slate-400">
                      {period}교시
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
