'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import WeekNavigator from '@/components/WeekNavigator';
import TimetableGrid from '@/components/TimetableGrid';
import TaskModal from '@/components/TaskModal';
import DashboardModal from '@/components/DashboardModal';
import SettingsModal from '@/components/SettingsModal';
import { getWeekDates, WeekDayInfo } from '@/lib/dateUtils';
import { TimetableItem, Task } from '@/types';
import { getSupabaseConfig } from '@/lib/supabase';
import { 
  fetchTasks, 
  fetchAllTasks, 
  addTask, 
  toggleTaskCompletion, 
  deleteTask 
} from '@/lib/taskService';
import { 
  GraduationCap, 
  Sparkles, 
  Info, 
  CheckCircle2, 
  AlertCircle,
  Database
} from 'lucide-react';

export default function HomePage() {
  // 학년 및 반
  const [grade, setGrade] = useState<number>(2);
  const [classNm, setClassNm] = useState<string>('1');

  // 기준 날짜 및 주간 정보
  const [baseDate, setBaseDate] = useState<Date>(new Date());
  const [weekDays, setWeekDays] = useState<WeekDayInfo[]>([]);

  // 시간표 및 과제 데이터
  const [timetableData, setTimetableData] = useState<TimetableItem[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [isLoadingTimetable, setIsLoadingTimetable] = useState(false);
  const [source, setSource] = useState<string>('DAEJIN_MOCK_FALLBACK');

  // 모달 상태
  const [selectedCell, setSelectedCell] = useState<{
    day: WeekDayInfo;
    period: number;
    subjectName: string;
  } | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Supabase 설정 상태
  const [isSupabaseConfigured, setIsSupabaseConfigured] = useState(false);

  // 알림 토스트
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // 주간 일자 갱신
  useEffect(() => {
    const days = getWeekDates(baseDate);
    setWeekDays(days);
  }, [baseDate]);

  // Supabase 설정 확인
  const checkSupabaseStatus = useCallback(() => {
    const config = getSupabaseConfig();
    setIsSupabaseConfigured(config.isConfigured);
  }, []);

  useEffect(() => {
    checkSupabaseStatus();
  }, [checkSupabaseStatus]);

  // 시간표 불러오기
  const loadTimetable = useCallback(async () => {
    if (weekDays.length === 0) return;
    setIsLoadingTimetable(true);

    try {
      const fromYmd = weekDays[0].ymd;
      const toYmd = weekDays[weekDays.length - 1].ymd;

      let apiKey = '';
      if (typeof window !== 'undefined') {
        apiKey = localStorage.getItem('daejin_neis_key') || '';
      }

      const res = await fetch(
        `/api/timetable?grade=${grade}&classNm=${encodeURIComponent(
          classNm
        )}&fromYmd=${fromYmd}&toYmd=${toYmd}&apiKey=${encodeURIComponent(apiKey)}`
      );

      if (res.ok) {
        const json = await res.json();
        setTimetableData(json.data || []);
        setSource(json.source || 'DAEJIN_MOCK_FALLBACK');
      }
    } catch (e) {
      console.error('시간표 로딩 실패:', e);
    } finally {
      setIsLoadingTimetable(false);
    }
  }, [weekDays, grade, classNm]);

  // 과제 목록 불러오기
  const loadTasks = useCallback(async () => {
    if (weekDays.length === 0) return;
    const startDate = weekDays[0].date;
    const endDate = weekDays[weekDays.length - 1].date;

    const [weekResult, allResult] = await Promise.all([
      fetchTasks(grade, classNm, startDate, endDate),
      fetchAllTasks(grade, classNm),
    ]);

    setTasks(weekResult.tasks);
    setAllTasks(allResult.tasks);
  }, [weekDays, grade, classNm]);

  useEffect(() => {
    if (weekDays.length > 0) {
      loadTimetable();
      loadTasks();
    }
  }, [loadTimetable, loadTasks]);

  // 주간 이동 핸들러
  const handlePrevWeek = () => {
    setBaseDate((prev) => {
      const next = new Date(prev);
      next.setDate(next.getDate() - 7);
      return next;
    });
  };

  const handleNextWeek = () => {
    setBaseDate((prev) => {
      const next = new Date(prev);
      next.setDate(next.getDate() + 7);
      return next;
    });
  };

  const handleTodayWeek = () => {
    setBaseDate(new Date());
  };

  // 시간표 셀 클릭 시
  const handleSelectCell = (day: WeekDayInfo, period: number, subjectName: string) => {
    setSelectedCell({ day, period, subjectName });
    setIsTaskModalOpen(true);
  };

  // 과제 생성
  const handleAddTask = async (newTaskData: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => {
    const res = await addTask(newTaskData);
    if (res.success) {
      showToast('과제가 성공적으로 등록되었습니다.');
      await loadTasks();
      return { success: true };
    } else {
      showToast(`과제 등록 실패: ${res.errorMessage || '확인 필요'}`);
      return { success: false, errorMessage: res.errorMessage };
    }
  };

  // 과제 상태 토글
  const handleToggleTask = async (taskId: string, isCompleted: boolean) => {
    const res = await toggleTaskCompletion(taskId, isCompleted);
    if (res.success) {
      showToast(isCompleted ? '과제를 완료 처리했습니다! 🎉' : '과제를 진행 중으로 변경했습니다.');
      await loadTasks();
    }
  };

  // 과제 삭제
  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('이 과제를 정말 삭제하시겠습니까?')) return;
    const res = await deleteTask(taskId);
    if (res.success) {
      showToast('과제가 삭제되었습니다.');
      await loadTasks();
    }
  };

  const pendingTaskCount = allTasks.filter((t) => !t.is_completed).length;

  return (
    <div className="min-h-screen flex flex-col pb-16">
      {/* 토스트 알림 */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl bg-cyan-950/90 text-cyan-200 border border-cyan-500/40 shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* 헤더 */}
      <Header
        grade={grade}
        setGrade={setGrade}
        classNm={classNm}
        setClassNm={setClassNm}
        isSupabaseConfigured={isSupabaseConfigured}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenDashboard={() => setIsDashboardOpen(true)}
        totalTaskCount={allTasks.length}
        pendingTaskCount={pendingTaskCount}
      />

      {/* 메인 컨테이너 */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8">
        {/* 안내 배너 */}
        <div className="mb-5 p-3.5 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-slate-900/60 to-indigo-950/30 border border-cyan-500/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-200">
                시간표의 원하는 교시를 클릭하면 해당 수업의 과제를 손쉽게 등록하고 관리할 수 있습니다.
              </p>
              <p className="text-[11px] text-slate-400">
                대진전자통신고(부산 C10, 코드 7150536) NEIS 시간표 자동 연동 및 Supabase 클라우드 DB 지원
              </p>
            </div>
          </div>

          {!isSupabaseConfigured && (
            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              className="text-xs font-semibold text-amber-300 hover:text-amber-200 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-xl transition-all self-start sm:self-auto cursor-pointer"
            >
              Supabase 클라우드 연동하기 →
            </button>
          )}
        </div>

        {/* 주간 네비게이터 */}
        <WeekNavigator
          weekDays={weekDays}
          onPrevWeek={handlePrevWeek}
          onNextWeek={handleNextWeek}
          onTodayWeek={handleTodayWeek}
          onRefresh={() => {
            loadTimetable();
            loadTasks();
            showToast('시간표와 과제 데이터를 새로고침했습니다.');
          }}
          isLoading={isLoadingTimetable}
          source={source}
        />

        {/* 주간 시간표 매트릭스 그리드 */}
        <TimetableGrid
          weekDays={weekDays}
          timetableData={timetableData}
          tasks={tasks}
          onSelectCell={handleSelectCell}
          isLoading={isLoadingTimetable}
        />
      </main>

      {/* 교시별 과제 모달 */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        dayInfo={selectedCell?.day || null}
        period={selectedCell?.period ?? null}
        subjectName={selectedCell?.subjectName || ''}
        grade={grade}
        classNm={classNm}
        tasks={tasks}
        onAddTask={handleAddTask}
        onToggleTask={handleToggleTask}
        onDeleteTask={handleDeleteTask}
        isSupabaseConfigured={isSupabaseConfigured}
      />

      {/* 전체 과제 대시보드 모달 */}
      <DashboardModal
        isOpen={isDashboardOpen}
        onClose={() => setIsDashboardOpen(false)}
        tasks={allTasks}
        grade={grade}
        classNm={classNm}
        onToggleTask={handleToggleTask}
        onDeleteTask={handleDeleteTask}
      />

      {/* 서비스 연동 설정 모달 */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onConfigUpdated={() => {
          checkSupabaseStatus();
          loadTasks();
          loadTimetable();
          showToast('연동 설정이 업데이트되었습니다.');
        }}
      />
    </div>
  );
}
