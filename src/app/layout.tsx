import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '대진전자통신고 시간표 & 과제 매니저 | Smart Timetable',
  description: '대진전자통신고등학교 실시간 NEIS 시간표 조회 및 과목별 과제 관리 시스템 (Supabase 연동)',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
        />
      </head>
      <body className="antialiased min-h-screen bg-[#080c14] text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200">
        {children}
      </body>
    </html>
  );
}
