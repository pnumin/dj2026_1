export interface TimetableItem {
  ATPT_OFCDC_SC_CODE: string;
  ATPT_OFCDC_SC_NM: string;
  SD_SCHUL_CODE: string;
  SCHUL_NM: string;
  AY: string;
  SEM: string;
  ALL_TI_YMD: string; // YYYYMMDD
  DGHT_CRSE_SC_NM: string;
  ORD_SC_NM: string;
  DDDEP_NM: string;
  GRADE: string;
  CLASS_NM: string;
  PERIO: string; // 교시
  ITRT_CNT?: string; // 수업내용(과목명)
  ITRT_CNTNT?: string; // NEIS 고등학교 시간표 공식 과목명 필드
  LOAD_DTM: string;
}

export type Priority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  school_code: string;
  grade: number;
  class_nm: string;
  target_date: string; // YYYY-MM-DD
  period: number; // 1~7
  subject_name: string;
  title: string;
  description?: string;
  priority: Priority;
  due_date?: string; // YYYY-MM-DDTHH:mm
  is_completed: boolean;
  created_at: string;
  updated_at?: string;
}

export interface DaySchedule {
  date: string; // YYYY-MM-DD
  dateFormatted: string; // MM/DD
  dayOfWeek: string; // 월, 화, 수, 목, 금
  isToday: boolean;
  periods: {
    [period: number]: {
      subject: string;
      raw?: TimetableItem;
    };
  };
}
