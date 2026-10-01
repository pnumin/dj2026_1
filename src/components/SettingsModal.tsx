'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Database, 
  Key, 
  Copy, 
  Check, 
  ExternalLink, 
  Save, 
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { 
  getSupabaseConfig, 
  saveSupabaseConfig, 
  clearSupabaseConfig, 
  SUPABASE_SCHEMA_SQL,
  getSupabaseClient
} from '@/lib/supabase';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigUpdated: () => void;
}

export default function SettingsModal({
  isOpen,
  onClose,
  onConfigUpdated,
}: SettingsModalProps) {
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseKey, setSupabaseKey] = useState('');
  const [neisApiKey, setNeisApiKey] = useState('');
  const [copiedSql, setCopiedSql] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const config = getSupabaseConfig();
      setSupabaseUrl(config.url || '');
      setSupabaseKey(config.key || '');
      if (typeof window !== 'undefined') {
        const neis = localStorage.getItem('daejin_neis_key') || '';
        setNeisApiKey(neis);
      }
      setStatusMessage(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SCHEMA_SQL);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const handleSave = async () => {
    setIsTesting(true);
    setStatusMessage(null);

    // NEIS 키 저장
    if (typeof window !== 'undefined') {
      if (neisApiKey.trim()) {
        localStorage.setItem('daejin_neis_key', neisApiKey.trim());
      } else {
        localStorage.removeItem('daejin_neis_key');
      }
    }

    if (!supabaseUrl.trim() || !supabaseKey.trim()) {
      clearSupabaseConfig();
      setStatusMessage({ text: '설정이 로컬 모드로 전환되었습니다.', type: 'info' });
      setIsTesting(false);
      onConfigUpdated();
      return;
    }

    saveSupabaseConfig(supabaseUrl, supabaseKey);

    // Supabase 접속 테스트
    try {
      const client = getSupabaseClient();
      if (!client) throw new Error('클라이언트 초기화 실패');

      const { error } = await client.from('tasks').select('id').limit(1);

      if (error && error.code !== 'PGRST116') {
        setStatusMessage({
          text: `Supabase 연결 완료 (주의: tasks 테이블이 없으면 아래 SQL을 실행해주세요: ${error.message})`,
          type: 'info',
        });
      } else {
        setStatusMessage({ text: '✅ Supabase 연결 및 통신에 성공했습니다!', type: 'success' });
      }
    } catch (e: any) {
      setStatusMessage({ text: `연결 테스트 경고: ${e.message || '접속 확인 필요'}`, type: 'error' });
    } finally {
      setIsTesting(false);
      onConfigUpdated();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="glass-modal w-full max-w-xl rounded-3xl p-6 relative max-h-[90vh] flex flex-col shadow-2xl border border-cyan-500/25"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-5 pr-8">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Database className="w-5 h-5 text-cyan-400" />
            <span>서비스 연동 설정</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Supabase DB 및 나이스(NEIS) Open API 연동 정보를 설정합니다.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {/* 상태 알림 */}
          {statusMessage && (
            <div
              className={`p-3 rounded-xl text-xs font-semibold border ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : statusMessage.type === 'error'
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                  : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300'
              }`}
            >
              {statusMessage.text}
            </div>
          )}

          {/* Supabase 설정 */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
                <Database className="w-4 h-4 text-emerald-400" />
                Supabase 연동 정보
              </span>
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                <span>대시보드 이동</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Project URL
              </label>
              <input
                type="text"
                placeholder="https://your-project.supabase.co"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Anon Public API Key
              </label>
              <input
                type="password"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                value={supabaseKey}
                onChange={(e) => setSupabaseKey(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
          </div>

          {/* Supabase 테이블 생성 SQL 쿼리 복사 */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                Supabase 설정 SQL
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText('ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;');
                    alert('RLS 해제 쿼리가 복사되었습니다! Supabase SQL Editor에서 실행해주세요.');
                  }}
                  className="px-2 py-1 rounded-lg bg-rose-600/30 hover:bg-rose-600/50 text-rose-200 border border-rose-500/40 text-[11px] font-semibold transition-all cursor-pointer"
                  title="과제 등록이 차단될 때 실행하는 보안 정책 해제 쿼리"
                >
                  RLS 해제 SQL 복사
                </button>
                <button
                  type="button"
                  onClick={handleCopySql}
                  className="px-2.5 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-[11px] font-semibold flex items-center gap-1 transition-all cursor-pointer"
                >
                  {copiedSql ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedSql ? '복사됨!' : '전체 테이블 SQL 복사'}</span>
                </button>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mb-2">
              과제 등록 시 권한 에러(42501 / Unauthorized)가 발생하면 **[RLS 해제 SQL 복사]** 후 Supabase SQL Editor에서 실행하시면 즉시 해결됩니다.
            </p>
            <pre className="p-2.5 rounded-xl bg-slate-950 text-[11px] text-slate-400 overflow-x-auto max-h-28 border border-slate-800 font-mono">
              {SUPABASE_SCHEMA_SQL}
            </pre>
          </div>

          {/* NEIS Open API Key 설정 */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-amber-400" />
                나이스(NEIS) Open API 인증키 (선택)
              </span>
              <a
                href="https://open.neis.go.kr/portal/data/service/selectServicePage.do?infId=OPEN18620200826103326268120"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                <span>인증키 발급</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <input
              type="text"
              placeholder="미입력 시에도 대진전자통신고 표준 시간표가 자동 지원됩니다"
              value={neisApiKey}
              onChange={(e) => setNeisApiKey(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        {/* 하단 저장 버튼 */}
        <div className="pt-4 border-t border-slate-800 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer"
          >
            닫기
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isTesting}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-cyan-500/20 disabled:opacity-50 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            {isTesting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>설정 저장 & 테스트</span>
          </button>
        </div>
      </div>
    </div>
  );
}
