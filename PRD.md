# 📋 [PRD] 대진전자통신고등학교 스마트 시간표 & 과제 관리 시스템

## 1. 프로젝트 개요 (Overview)
- **프로젝트명**: 대진전자통신고 스마트 시간표 & 과제 관리 시스템 (Daejin Smart Timetable & Task Manager)
- **목적**: 
  - 교육부 나이스(NEIS) 교육정보 개방 포털 Open API를 활용하여 대진전자통신고등학교의 실시간 학년/반별 시간표를 조회.
  - 시간표의 특정 교시(과목)를 클릭하여 해당 수업과 연계된 과제를 직관적으로 등록·조회·완료 관리할 수 있는 모던 웹 애플리케이션 구축.
  - 과제 데이터는 Supabase(PostgreSQL)와 실시간 연동되어 데이터 지속성 및 확장성을 보장.

---

## 2. 사용자 및 활용 시나리오 (Target Users & Use Cases)
- **대상 사용자**: 대진전자통신고등학교 학생 및 교과 담당 교사
- **주요 활용 시나리오**:
  1. 학생이 본인의 **학년(1~3학년)** 및 **반(1~n반)**, **조회 주간**을 선택하여 이번 주 시간표를 확인한다.
  2. 오늘 또는 특정 날짜의 3교시 '프로그래밍' 수업 셀을 클릭한다.
  3. 열린 과제 패널에서 "포인터 실습 과제 제출"을 새로 등록하거나, 기존 과제의 마감일/체크박스를 확인한다.
  4. 메인 상단 요약 바에서 "오늘 마감 과제" 및 "미완료 과제"를 한눈에 파악하고 완료 처리한다.

---

## 3. 핵심 시스템 아키텍처 (Architecture)

```mermaid
graph TD
    User([사용자/학생]) --> |브라우저 접속| NextApp[Next.js App Router Frontend]
    NextApp --> |시간표 조회 요청| API_Route[/api/timetable Server Route]
    API_Route --> |REST API 호출| NEIS[NEIS 교육정보 개방포털 API<br/>hisTimetable]
    NextApp --> |과제 CRUD 요청| Supabase[(Supabase PostgreSQL)]
    Supabase --> |과제 상태/데이터 반환| NextApp
```

---

## 4. 기능 요구사항 (Functional Requirements)

### 4.1. 대진전자통신고 시간표 조회 모듈 (NEIS Open API 연동)
- **학교 기본 정보 고정 및 선택 기능**:
  - 시도교육청코드: `C10` (부산광역시교육청)
  - 표준학교코드: `7150536` (대진전자통신고등학교)
  - 사용자는 **학년(1, 2, 3)**, **반(1~10반 등 선택 가능)**, **기준 주간(이전주 / 이번주 / 다음주)** 선택 가능.
- **주간 시간표 매트릭스 뷰 (Weekly Timetable View)**:
  - 월요일부터 금요일까지 1~7교시의 과목명, 교시 정보를 반응형 그리드로 렌더링.
  - 오늘 요일 및 현재 진행 중인 교시 하이라이트 효과.
  - API 미제공일(휴일, 방학 등) 및 미배정 교시에 대한 자연스러운 플레이스홀더 UI 제공.
  - NEIS API 장애 대비 캐싱 및 안내 모달 제공.

### 4.2. 교시 클릭 및 과제 관리 모듈 (Supabase 연동)
- **인터랙티브 셀 액션**:
  - 시간표 셀에 해당 수업에 등록된 미완료 과제 개수 배지(Badge) 표시.
  - 셀 클릭 시 슬라이드 패널 또는 모달 창 활성화 (해당 날짜, 요일, 교시, 과목명 자동 바인딩).
- **과제 CRUD 기능**:
  - **등록 (Create)**:
    - 과제 제목 (필수)
    - 상세 설명 / 과제 가이드 메모
    - 마감 일시 (Due Date / Time)
    - 우선순위 (보통 / 중요 / 긴급)
  - **조회 (Read)**:
    - 특정 교시별 과제 리스트
    - 전체 대시보드 뷰: '전체 과제', '오늘 마감', '완료됨' 필터링
  - **수정 & 완료 처리 (Update)**:
    - 체크박스 클릭 한 번으로 완료(is_completed) 토글
    - 제목 및 상세 내용 수정
  - **삭제 (Delete)**:
    - 과제 삭제 및 확인 컨펌 토스트

### 4.3. 대시보드 및 통계 위젯
- 이번 주 남은 과제 진행률(완료율 %) 프로그레스 바.
- D-Day 카운트다운 (마감 임박 과제 우선 정렬).

---

## 5. 데이터베이스 스키마 설계 (Supabase)

```sql
-- 과제 관리 테이블 (tasks)
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_code VARCHAR(20) NOT NULL DEFAULT '7150536',
    grade INTEGER NOT NULL,          -- 학년 (1, 2, 3)
    class_nm VARCHAR(10) NOT NULL,    -- 반 (예: '1', '2')
    target_date DATE NOT NULL,       -- 수업 일자 (YYYY-MM-DD)
    period INTEGER NOT NULL,         -- 교시 (1~7)
    subject_name VARCHAR(100) NOT NULL, -- 과목명
    title VARCHAR(200) NOT NULL,     -- 과제명
    description TEXT,                -- 과제 세부 설명
    priority VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high'
    due_date TIMESTAMPTZ,            -- 과제 마감 일시
    is_completed BOOLEAN DEFAULT FALSE, -- 완료 여부
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 검색 성능 최적화를 위한 인덱스
CREATE INDEX idx_tasks_lookup ON tasks (grade, class_nm, target_date);
CREATE INDEX idx_tasks_completion ON tasks (is_completed, due_date);
```

---

## 6. 비기능 및 디자인 요구사항 (Non-Functional Requirements)

1. **디자인 & 감성 (Aesthetics)**:
   - 다크/네이비 톤 기반의 세련된 글래스모피즘(Glassmorphism) + 포인트 네온 액센트.
   - 대진전자통신고등학교의 IT/전자 계열 정체성을 살린 사이버 테크 감성의 깔끔한 인터페이스.
   - 부드러운 트랜지션, 탭 호버 애니메이션, 마이크로 인터랙션 구현.
2. **반응형 웹 (Responsive)**:
   - 모바일 화면(스마트폰 세로 뷰)에서는 일자별 탭 슬라이드 또는 컴팩트 카드 형태로 최적화.
   - 태블릿/PC에서는 5일치 전체 주간 시간표 매트릭스 제공.
3. **환경 변수 관리 (.env.local)**:
   - `NEXT_PUBLIC_SUPABASE_URL`: Supabase 프로젝트 URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase 익명 키
   - `NEIS_API_KEY`: 나이스 Open API 키 (없을 경우 기본 오픈키 또는 샘플 데이터 폴백 처리)

---

## 7. 구현 단계 (Phases & Milestones)

| 단계 | 주요 작업 내용 |
| :--- | :--- |
| **Phase 1: 프로젝트 셋업** | Next.js (App Router, TypeScript) 프로젝트 생성, Supabase 클라이언트 SDK 구성, 글로벌 스타일 및 모던 디자인 토큰 구축 |
| **Phase 2: NEIS API 연동** | 대진전자통신고 시간표 API Route 핸들러 구축 (`/api/timetable`), 학년/반/주간 선택 컨트롤러 구현 |
| **Phase 3: 주간 시간표 UI** | 시간표 그리드 테이블, 현재 교시 하이라이팅, 과제 카운트 배지 UI 구현 |
| **Phase 4: Supabase 과제 CRUD** | 교시 클릭 시 과제 등록/수정/삭제 모달, 상태 변경 실시간 반영, 대시보드 위젯 구현 |
| **Phase 5: 폴백 및 사용성 테스트** | API 키 미입력 시 테스트용 모의(Mock) 데이터 지원, 예외 처리 및 검증 |
