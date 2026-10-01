'use client';

import React, { useState } from 'react';
import { Task } from '@/types';
import { 
  X, 
  Check, 
  Trash2, 
  Calendar, 
  Clock, 
  BookOpen, 
  CheckCircle2, 
  AlertCircle,
  Filter,
  BarChart3
} from 'lucide-react';

interface DashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  grade: number;
  classNm: string;
  onToggleTask: (taskId: string, isCompleted: boolean) => Promise<void>;
  onDeleteTask: (taskId: string) => Promise<void>;
}

export default function DashboardModal({
  isOpen,
  onClose,
  tasks,
  grade,
  classNm,
  onToggleTask,
  onDeleteTask,
}: DashboardModalProps) {
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  if (!isOpen) return null;

  const totalCount = tasks.length;
  const completedCount = tasks.filter((t) => t.is_completed).length;
  const pendingCount = totalCount - completedCount;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'pending') return !t.is_completed;
    if (filter === 'completed') return t.is_completed;
    return true;
  });

  const getDDay = (dueDateStr?: string) => {
    if (!dueDateStr) return null;
    const due = new Date(dueDateStr).getTime();
    const now = new Date().getTime();
    const diffDays = Math.ceil((due - now) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return <span className="px-2 py-0.5 rounded-md bg-rose-950 text-rose-300 border border-rose-800 text-[10px] font-bold">마감 지남</span>;
    }
    if (diffDays === 0) {
      return <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-bold animate-pulse">오늘 마감 (D-Day)</span>;
    }
    return <span className="px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 text-[10px] font-semibold">D-{diffDays}</span>;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="glass-modal w-full max-w-2xl rounded-3xl p-6 relative max-h-[90vh] flex flex-col shadow-2xl border border-cyan-500/25"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 상단 닫기 */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 헤더 */}
        <div className="mb-5 pr-8">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30">
              {grade}학년 {classNm}반 전체 과제
            </span>
          </div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            <span>과제 현황 대시보드</span>
          </h2>
        </div>

        {/* 요약 카드 & 진행률 바 */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/60 text-center">
            <span className="text-xs text-slate-400 block mb-1">전체 과제</span>
            <span className="text-xl font-bold text-slate-100">{totalCount}개</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/60 text-center">
            <span className="text-xs text-slate-400 block mb-1">미완료</span>
            <span className="text-xl font-bold text-rose-400">{pendingCount}개</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/60 text-center">
            <span className="text-xs text-slate-400 block mb-1">달성률</span>
            <span className="text-xl font-bold text-emerald-400">{progressPercent}%</span>
          </div>
        </div>

        {/* 프로그레스 바 */}
        <div className="mb-4 bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
          <div className="flex justify-between text-xs text-slate-300 mb-1.5 font-medium">
            <span>과제 완수 진행도</span>
            <span>{completedCount} / {totalCount} 완료</span>
          </div>
          <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* 필터 탭 */}
        <div className="flex gap-2 p-1 bg-slate-900/80 rounded-xl border border-slate-800 mb-3">
          {(['all', 'pending', 'completed'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setFilter(mode)}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                filter === mode
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {mode === 'all' && `전체 (${totalCount})`}
              {mode === 'pending' && `진행 중 (${pendingCount})`}
              {mode === 'completed' && `완료됨 (${completedCount})`}
            </button>
          ))}
        </div>

        {/* 과제 목록 */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
          {filteredTasks.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              선택한 조건의 과제가 없습니다.
            </div>
          ) : (
            filteredTasks.map((task) => (
              <div
                key={task.id}
                className={`p-3.5 rounded-2xl border transition-all ${
                  task.is_completed
                    ? 'bg-slate-900/40 border-slate-800/60 opacity-65'
                    : 'bg-slate-800/40 border-slate-700/60 hover:border-cyan-500/30'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <button
                      type="button"
                      onClick={() => onToggleTask(task.id, !task.is_completed)}
                      className={`w-5 h-5 rounded-lg border flex items-center justify-center mt-0.5 transition-all cursor-pointer ${
                        task.is_completed
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : 'border-slate-600 hover:border-cyan-400 bg-slate-800'
                      }`}
                    >
                      {task.is_completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5 mb-1">
                        <span className="text-[11px] font-semibold text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
                          {task.subject_name}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {task.target_date} ({task.period}교시)
                        </span>
                        {getDDay(task.due_date)}
                      </div>
                      <h4
                        className={`text-sm font-semibold text-slate-100 break-words ${
                          task.is_completed ? 'line-through text-slate-400' : ''
                        }`}
                      >
                        {task.title}
                      </h4>
                      {task.description && (
                        <p className="text-xs text-slate-400 mt-1 whitespace-pre-wrap">
                          {task.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onDeleteTask(task.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
