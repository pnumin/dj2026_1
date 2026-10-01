import { Task } from '@/types';
import { getSupabaseClient } from './supabase';

const LOCAL_STORAGE_KEY = 'daejin_tasks_storage';

function getLocalTasks(): Task[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('로컬 과제 데이터 파싱 실패:', e);
    return [];
  }
}

function saveLocalTasks(tasks: Task[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(tasks));
  } catch (e) {
    console.error('로컬 과제 데이터 저장 실패:', e);
  }
}

/**
 * 특정 학년, 반, 일자 범위의 과제 조회
 */
export async function fetchTasks(
  grade: number,
  classNm: string,
  startDate: string,
  endDate: string
): Promise<{ tasks: Task[]; source: 'supabase' | 'local' }> {
  const supabase = getSupabaseClient();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('school_code', '7150536')
        .eq('grade', grade)
        .eq('class_nm', classNm)
        .gte('target_date', startDate)
        .lte('target_date', endDate)
        .order('period', { ascending: true });

      if (!error && data) {
        return { tasks: data as Task[], source: 'supabase' };
      }
      console.warn('Supabase 조회 실패, 로컬 스토리지로 전환:', error?.message);
    } catch (err) {
      console.warn('Supabase 요청 에러, 로컬 스토리지로 전환:', err);
    }
  }

  // Fallback to local storage
  const local = getLocalTasks();
  const filtered = local.filter(
    (t) =>
      t.grade === grade &&
      t.class_nm === classNm &&
      t.target_date >= startDate &&
      t.target_date <= endDate
  );
  return { tasks: filtered, source: 'local' };
}

/**
 * 모든 과제 조회 (대시보드 모아보기용)
 */
export async function fetchAllTasks(
  grade: number,
  classNm: string
): Promise<{ tasks: Task[]; source: 'supabase' | 'local' }> {
  const supabase = getSupabaseClient();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('school_code', '7150536')
        .eq('grade', grade)
        .eq('class_nm', classNm)
        .order('due_date', { ascending: true, nullsFirst: false });

      if (!error && data) {
        return { tasks: data as Task[], source: 'supabase' };
      }
    } catch (err) {
      console.warn('Supabase fetchAllTasks 에러:', err);
    }
  }

  const local = getLocalTasks();
  const filtered = local.filter((t) => t.grade === grade && t.class_nm === classNm);
  return { tasks: filtered, source: 'local' };
}

/**
 * 새 과제 등록
 */
export async function addTask(
  taskData: Omit<Task, 'id' | 'created_at' | 'updated_at'>
): Promise<{ success: boolean; task?: Task; source: 'supabase' | 'local'; errorMessage?: string }> {
  const newTask: Task = {
    ...taskData,
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const supabase = getSupabaseClient();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([newTask])
        .select()
        .single();

      if (!error && data) {
        return { success: true, task: data as Task, source: 'supabase' };
      }
      
      console.error('Supabase 과제 추가 실패:', error);
      if (error) {
        let msg = error.message;
        if (error.code === '42501') {
          msg = 'Supabase RLS(Row Level Security) 정책 위반입니다. 아래 설정에서 RLS 해제 SQL을 실행해 주세요.';
        }
        return { success: false, source: 'supabase', errorMessage: msg };
      }
    } catch (err: any) {
      console.error('Supabase insert 예외 발생:', err);
      return { success: false, source: 'supabase', errorMessage: err?.message || 'DB 연결 오류가 발생했습니다.' };
    }
  }

  const local = getLocalTasks();
  local.push(newTask);
  saveLocalTasks(local);
  return { success: true, task: newTask, source: 'local' };
}

/**
 * 과제 완료 상태 토글
 */
export async function toggleTaskCompletion(
  taskId: string,
  isCompleted: boolean
): Promise<{ success: boolean; source: 'supabase' | 'local' }> {
  const supabase = getSupabaseClient();

  if (supabase) {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({
          is_completed: isCompleted,
          updated_at: new Date().toISOString(),
        })
        .eq('id', taskId);

      if (!error) {
        return { success: true, source: 'supabase' };
      }
    } catch (err) {
      console.warn('Supabase toggle error:', err);
    }
  }

  const local = getLocalTasks();
  const updated = local.map((t) =>
    t.id === taskId ? { ...t, is_completed: isCompleted, updated_at: new Date().toISOString() } : t
  );
  saveLocalTasks(updated);
  return { success: true, source: 'local' };
}

/**
 * 과제 삭제
 */
export async function deleteTask(taskId: string): Promise<{ success: boolean; source: 'supabase' | 'local' }> {
  const supabase = getSupabaseClient();

  if (supabase) {
    try {
      const { error } = await supabase.from('tasks').delete().eq('id', taskId);
      if (!error) {
        return { success: true, source: 'supabase' };
      }
    } catch (err) {
      console.warn('Supabase delete error:', err);
    }
  }

  const local = getLocalTasks();
  const filtered = local.filter((t) => t.id !== taskId);
  saveLocalTasks(filtered);
  return { success: true, source: 'local' };
}
