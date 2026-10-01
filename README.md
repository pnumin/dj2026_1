# 🎓 대진전자통신고등학교 스마트 시간표 & 과제 매니저

> **NEIS 교육정보 개방포털 Open API**와 **Supabase(PostgreSQL)**를 연동한 대진전자통신고등학교 맞춤형 시간표 및 교시별 과제 관리 웹 애플리케이션입니다.

---

## 🌟 주요 기능

1. **대진전자통신고 실시간 시간표 조회 (NEIS Open API)**
   - 부산광역시교육청(`C10`), 대진전자통신고등학교(`7150536`) 자동 연동
   - 1학년, 2학년, 3학년 및 1~8반 선택 지원
   - 주간 네비게이터 (이전 주, 이번 주, 다음 주)
   - 방학/공휴일 또는 미등록 기간에도 대진전자통신고 전문계 표준 교육과정 시간표 자동 제공

2. **교시 클릭 기반 과제 관리 (Supabase 연동 CRUD)**
   - 시간표의 특정 교시(과목)를 클릭하면 해당 수업에 대한 과제 관리 모달 활성화
   - 과제명, 상세 가이드, 마감 일시, 우선순위(보통/중요/긴급) 설정 및 등록
   - 체크박스로 완료/진행 중 실시간 토글
   - 각 교시 셀에 미완료 과제 개수 배지 및 완료 상태 인디케이터 표시

3. **과제 대시보드 & 통계**
   - 전체 과제 진행률(완료율 %) 프로그레스 바
   - '전체', '진행 중', '완료됨' 필터 및 D-Day 카운트다운

4. **하이브리드 데이터베이스 (Supabase + LocalStorage Fallback)**
   - Supabase 클라우드 DB 연결 지원 (원클릭 SQL 테이블 생성 제공)
   - Supabase 미연동 시에도 브라우저 로컬 스토리지를 통해 끊김 없이 사용 가능

---

## 🚀 빠른 시작 가이드

### 1. 의존성 설치 및 실행
```bash
# 개발 서버 구동 (기본 포트: 3000)
npm run dev

# 프로덕션 빌드
npm run build
```

브라우저에서 `http://localhost:3000`으로 접속합니다.

---

## 🛠 Supabase 설정 방법

1. [Supabase](https://supabase.com/dashboard)에서 새 프로젝트를 생성합니다.
2. 웹 애플리케이션 우측 상단의 **[설정(톱니바퀴)]** 아이콘을 클릭합니다.
3. **[SQL 복사]** 버튼을 눌러 생성 쿼리를 복사한 뒤, Supabase 대시보드의 **SQL Editor**에 붙여넣고 `Run`을 실행합니다.
4. Supabase의 `Project URL`과 `anon public key`를 모달에 입력하고 **[설정 저장 & 테스트]**를 클릭하면 즉시 클라우드 DB와 연동됩니다.

### SQL 스키마
```sql
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

CREATE INDEX IF NOT EXISTS idx_tasks_lookup ON tasks (grade, class_nm, target_date);
CREATE INDEX IF NOT EXISTS idx_tasks_completion ON tasks (is_completed, due_date);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read-write for demo" ON tasks
    FOR ALL
    TO anon
    USING (true)
    WITH CHECK (true);
```
