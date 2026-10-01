'use client';

import React, { useState } from 'react';
import { WeekDayInfo } from '@/lib/dateUtils';
import { Task, Priority } from '@/types';
import { 
  X, 
  Check, 
  Trash2, 
  Plus, 
  Calendar, 
  Clock, 
  BookOpen, 
  AlertTriangle,
  Flag,
  Sparkles,
  Database
} from 'lucide-react';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  dayInfo: WeekDayInfo | null;
  period: number | null;
  subjectName: string;
  grade: number;
  classNm: string;
  tasks: Task[];
  onAddTask: (task: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => Promise<{ success: boolean; errorMessage?: string }>;
  onToggleTask: (taskId: string, isCompleted: boolean) => Promise<void>;
  onDeleteTask: (taskId: string) => Promise<void>;
  isSupabaseConfigured: boolean;
}

export default function TaskModal({
  isOpen,
  onClose,
  dayInfo,
  period,
  subjectName,
  grade,
  classNm,
  tasks,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  isSupabaseConfigured,
}: TaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'list' | 'create'>('list');
  const [formError, setFormError] = useState<string | null>(null);

  if (!isOpen || !dayInfo || period === null) return null;

  // 현재 교시에 해당하는 과제 필터링
  const cellTasks = tasks.filter(
    (t) => t.target_date === dayInfo.date && t.period === period
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setFormError(null);

    try {
      setIsSubmitting(true);
      const res = await onAddTask({
        school_code: '7150536',
        grade,
        class_nm: classNm,
        target_date: dayInfo.date,
        period,
        subject_name: subjectName,
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        due_date: dueDate || undefined,
        is_completed: false,
      });

      if (res && !res.success) {
        setFormError(res.errorMessage || '과제 등록 중 오류가 발생했습니다.');
        return;
      }

      // 폼 리셋 & 목록 탭으로 복귀
      setTitle('');
      setDescription('');
      setDueDate('');
      setPriority('medium');
      setFormError(null);
      setActiveTab('list');
    } catch (err: any) {
      console.error('과제 추가 실패:', err);
      setFormError(err?.message || '과제 등록 실패');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPriorityBadge = (p: Priority) => {
    switch (p) {
      case 'high':
        return (
          <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[11px] font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" /> 긴급
          </span>
        );
      case 'medium':
        return (
          <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> 중요
          </span>
        );
      case 'low':
      default:
        return (
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> 보통
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="glass-modal w-full max-w-lg rounded-3xl p-6 relative max-h-[90vh] flex flex-col shadow-2xl border border-cyan-500/25"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 상단 닫기 버튼 */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 모달 헤더: 선택된 교시 상세 */}
        <div className="mb-4 pr-8">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30">
              {grade}학년 {classNm}반
            </span>
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {dayInfo.date} ({dayInfo.dayName})
            </span>
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {period}교시
            </span>
          </div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-cyan-400" />
            <span>{subjectName}</span>
            <span className="text-sm font-normal text-slate-400">과제 관리</span>
          </h2>
        </div>

        {/* 탭 네비게이션: 과제 목록 vs 새 과제 등록 */}
        <div className="flex gap-2 p-1 bg-slate-900/80 rounded-xl border border-slate-800 mb-4">
          <button
            type="button"
            onClick={() => setActiveTab('list')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'list'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>등록된 과제</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px]">
              {cellTasks.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('create')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'create'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>새 과제 등록</span>
          </button>
        </div>

        {/* 탭 내용 영역 (스크롤 가능) */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-3">
          {activeTab === 'list' ? (
            cellTasks.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-500 mb-3">
                  <Sparkles className="w-6 h-6 text-cyan-400/60" />
                </div>
                <p className="text-sm font-semibold text-slate-300 mb-1">
                  등록된 과제가 없습니다
                </p>
                <p className="text-xs text-slate-500 max-w-xs mb-4">
                  해당 교시의 실습, 보고서, 예습 등 숙제를 등록하고 마감일을 관리해보세요.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('create')}
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-cyan-600/25 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  첫 과제 등록하기
                </button>
              </div>
            ) : (
              cellTasks.map((task) => (
                <div
                  key={task.id}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    task.is_completed
                      ? 'bg-slate-900/40 border-slate-800/60 opacity-60'
                      : 'bg-slate-800/50 border-slate-700/70 hover:border-cyan-500/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    {/* 체크박스 & 과제 제목 */}
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
                        <h4
                          className={`text-sm font-semibold text-slate-100 break-words ${
                            task.is_completed ? 'line-through text-slate-400' : ''
                          }`}
                        >
                          {task.title}
                        </h4>
                        {task.description && (
                          <p className="text-xs text-slate-400 mt-1 whitespace-pre-wrap break-words">
                            {task.description}
                          </p>
                        )}
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          {getPriorityBadge(task.priority)}
                          {task.due_date && (
                            <span className="text-[11px] text-slate-400 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-cyan-400" />
                              마감: {task.due_date.replace('T', ' ')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* 삭제 버튼 */}
                    <button
                      type="button"
                      onClick={() => onDeleteTask(task.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800/80 transition-colors cursor-pointer"
                      title="과제 삭제"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )
          ) : (
            /* 새 과제 등록 폼 */
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs font-semibold flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p>{formError}</p>
                    <p className="text-[11px] text-rose-400 font-normal">
                      💡 Supabase 대시보드 SQL Editor에서 <code>ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;</code> 를 실행하면 즉시 해결됩니다.
                    </p>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  과제 제목 <span className="text-cyan-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="예: 전자회로 3장 실습 보고서 작성"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  세부 내용 및 제출 가이드
                </label>
                <textarea
                  rows={3}
                  placeholder="과제 내용, 준비물, 제출 방법(구글 클래스룸 또는 실습실 제출) 등을 입력하세요"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 마감 일시 */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    마감 일시
                  </label>
                  <input
                    type="datetime-local"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                {/* 우선순위 */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    우선순위
                  </label>
                  <div className="flex gap-1.5">
                    {(['low', 'medium', 'high'] as Priority[]).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPriority(p)}
                        className={`flex-1 py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                          priority === p
                            ? p === 'high'
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500'
                              : p === 'medium'
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500'
                              : 'bg-emerald-500/20 text-emerald-300 border-emerald-500'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {p === 'high' ? '긴급' : p === 'medium' ? '중요' : '보통'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 저장 위치 안내 배지 */}
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400">
                <Database className="w-4 h-4 text-cyan-400" />
                <span>
                  {isSupabaseConfigured
                    ? '과제가 Supabase 데이터베이스에 실시간 영구 보관됩니다.'
                    : '현재 로컬 스토리지에 저장됩니다 (상단 설정에서 Supabase 연동 가능).'}
                </span>
              </div>

              {/* 버튼 그룹 */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('list')}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !title.trim()}
                  className="flex-[2] py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-cyan-500/20 disabled:opacity-50 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  {isSubmitting ? '저장 중...' : '과제 등록하기'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
