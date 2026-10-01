export interface WeekDayInfo {
  date: string; // YYYY-MM-DD
  ymd: string; // YYYYMMDD
  dateFormatted: string; // MM.DD
  dayName: string; // 월, 화, 수, 목, 금
  isToday: boolean;
}

export const PERIOD_TIMES: Record<number, string> = {
  1: '09:00 ~ 09:50',
  2: '10:00 ~ 10:50',
  3: '11:00 ~ 11:50',
  4: '12:00 ~ 12:50',
  5: '13:40 ~ 14:30',
  6: '14:40 ~ 15:30',
  7: '15:40 ~ 16:30',
};

export function formatDateToYMD(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}${m}${d}`;
}

export function formatDateToDash(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * 기준 날짜가 포함된 주의 월~금 정보 배열 반환
 */
export function getWeekDates(baseDate: Date): WeekDayInfo[] {
  const current = new Date(baseDate);
  const day = current.getDay(); // 0(일) ~ 6(토)

  // 월요일로 이동
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(current);
  monday.setDate(current.getDate() + diffToMonday);

  const days: WeekDayInfo[] = [];
  const dayNames = ['월', '화', '수', '목', '금'];
  const todayStr = formatDateToDash(new Date());

  for (let i = 0; i < 5; i++) {
    const target = new Date(monday);
    target.setDate(monday.getDate() + i);

    const dateDash = formatDateToDash(target);
    const m = String(target.getMonth() + 1).padStart(2, '0');
    const d = String(target.getDate()).padStart(2, '0');

    days.push({
      date: dateDash,
      ymd: formatDateToYMD(target),
      dateFormatted: `${m}.${d}`,
      dayName: dayNames[i],
      isToday: dateDash === todayStr,
    });
  }

  return days;
}

export function formatKoreanDate(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  return `${parts[0]}년 ${parseInt(parts[1], 10)}월 ${parseInt(parts[2], 10)}일`;
}
