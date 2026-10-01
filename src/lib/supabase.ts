import { createClient, SupabaseClient } from '@supabase/supabase-js';

// 기본 환경변수
const ENV_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const ENV_SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

let cachedClient: SupabaseClient | null = null;
let currentUrl = '';
let currentKey = '';

export function getSupabaseConfig(): { url: string; key: string; isConfigured: boolean } {
  if (typeof window !== 'undefined') {
    const localUrl = localStorage.getItem('daejin_supabase_url');
    const localKey = localStorage.getItem('daejin_supabase_key');
    if (localUrl && localKey) {
      return { url: localUrl, key: localKey, isConfigured: true };
    }
  }

  const isConfigured = Boolean(ENV_SUPABASE_URL && ENV_SUPABASE_ANON_KEY);
  return {
    url: ENV_SUPABASE_URL,
    key: ENV_SUPABASE_ANON_KEY,
    isConfigured,
  };
}

export function saveSupabaseConfig(url: string, key: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('daejin_supabase_url', url.trim());
    localStorage.setItem('daejin_supabase_key', key.trim());
    cachedClient = null; // 재초기화 유도
  }
}

export function clearSupabaseConfig() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('daejin_supabase_url');
    localStorage.removeItem('daejin_supabase_key');
    cachedClient = null;
  }
}

export function getSupabaseClient(): SupabaseClient | null {
  const { url, key, isConfigured } = getSupabaseConfig();
  if (!isConfigured) return null;

  if (cachedClient && currentUrl === url && currentKey === key) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(url, key, {
      auth: { persistSession: false },
    });
    currentUrl = url;
    currentKey = key;
    return cachedClient;
  } catch (error) {
    console.error('Supabase 클라이언트 초기화 실패:', error);
    return null;
  }
}

export const SUPABASE_SCHEMA_SQL = `-- Supabase tasks 테이블 생성 SQL
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_code VARCHAR(20) NOT NULL DEFAULT '7150536',
    grade INTEGER NOT NULL,
    class_nm VARCHAR(10) NOT NULL,
    target_date DATE NOT NULL,
    period INTEGER NOT NULL,
    subject_name VARCHAR(100) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    priority VARCHAR(20) DEFAULT 'medium',
    due_date TIMESTAMPTZ,
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 검색 성능을 위한 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_tasks_lookup ON tasks (grade, class_nm, target_date);
CREATE INDEX IF NOT EXISTS idx_tasks_completion ON tasks (is_completed, due_date);

-- [가장 간편한 방법] RLS 비활성화하여 누구나 등록/조회/수정 가능하게 설정
ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;

-- 또는 RLS를 켜두고 전체 허용 정책을 적용하려면:
-- ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
-- DROP POLICY IF EXISTS "Allow all for anon" ON tasks;
-- CREATE POLICY "Allow all for anon" ON tasks FOR ALL TO anon USING (true) WITH CHECK (true);
`;
