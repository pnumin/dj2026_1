import { NextRequest, NextResponse } from 'next/server';
import { TimetableItem } from '@/types';

// 대진전자통신고등학교 실제 전공 및 기초 교과목 목록 (Fallback용)
const DAEJIN_SUBJECT_POOL: Record<number, string[][]> = {
  1: [
    ['국어', '수학', '영어', '한국사', '통합사회', '통합과학', '체육'],
    ['프로그래밍', '프로그래밍', '수학', '영어', '정보', '진로활동', '자율활동'],
    ['공업일반', '공업일반', '기초제도', '기초제도', '국어', '체육', '동아리'],
    ['수학', '영어', '통합과학', '통합과학', '프로그래밍', '음악', '미술'],
    ['전기전자회로', '전기전자회로', '국어', '한국사', '체육', '진로활동', '자율활동'],
  ],
  2: [
    ['전자회로', '전자회로', '전자캐드(CAD)', '전자캐드(CAD)', '문학', '수학I', '영어I'],
    ['정보통신네트워크', '정보통신네트워크', '프로그래밍실무', '프로그래밍실무', '체육', '한국사', '진로'],
    ['디지털논리회로', '디지털논리회로', '마이크로프로세서', '마이크로프로세서', '성공적인직업생활', '수학I', '동아리'],
    ['영어I', '문학', '전자회로', '전자회로', '정보통신네트워크', '체육', '자율활동'],
    ['네트워크실무', '네트워크실무', '전자캐드(CAD)', '수학I', '문학', '진로활동', '체육'],
  ],
  3: [
    ['임베디드시스템', '임베디드시스템', '전자응용기기', '전자응용기기', '실용국어', '실용영어', '체육'],
    ['스마트IoT실무', '스마트IoT실무', '정보통신시스템', '정보통신시스템', '직업윤리', '취업실무', '자율'],
    ['통신선로공사', '통신선로공사', '전자CAD응용', '전자CAD응용', '실용수학', '체육', '동아리'],
    ['프로젝트실습', '프로젝트실습', '프로젝트실습', '임베디드시스템', '스마트IoT실무', '실용영어', '자율'],
    ['전자응용기기', '전자응용기기', '취업포트폴리오', '실용수학', '체육', '진로상담', '종합평가'],
  ],
};

function generateFallbackTimetable(
  grade: number,
  classNm: string,
  fromYmd: string,
  toYmd: string
): TimetableItem[] {
  const items: TimetableItem[] = [];
  const scheduleMatrix = DAEJIN_SUBJECT_POOL[grade] || DAEJIN_SUBJECT_POOL[2];

  // fromYmd부터 toYmd까지 날짜 순회
  const start = new Date(
    parseInt(fromYmd.slice(0, 4)),
    parseInt(fromYmd.slice(4, 6)) - 1,
    parseInt(fromYmd.slice(6, 8))
  );
  const end = new Date(
    parseInt(toYmd.slice(0, 4)),
    parseInt(toYmd.slice(4, 6)) - 1,
    parseInt(toYmd.slice(6, 8))
  );

  let current = new Date(start);
  while (current <= end) {
    const day = current.getDay(); // 0: 일, 1: 월, ..., 5: 금, 6: 토
    if (day >= 1 && day <= 5) {
      const dayIndex = day - 1; // 0: 월 ~ 4: 금
      const subjects = scheduleMatrix[dayIndex];
      const ymdStr =
        current.getFullYear().toString() +
        String(current.getMonth() + 1).padStart(2, '0') +
        String(current.getDate()).padStart(2, '0');

      subjects.forEach((subject, idx) => {
        items.push({
          ATPT_OFCDC_SC_CODE: 'C10',
          ATPT_OFCDC_SC_NM: '부산광역시교육청',
          SD_SCHUL_CODE: '7150536',
          SCHUL_NM: '대진전자통신고등학교',
          AY: current.getFullYear().toString(),
          SEM: current.getMonth() + 1 >= 8 ? '2' : '1',
          ALL_TI_YMD: ymdStr,
          DGHT_CRSE_SC_NM: '주간',
          ORD_SC_NM: '전문계',
          DDDEP_NM: '전자통신계열',
          GRADE: String(grade),
          CLASS_NM: String(classNm),
          PERIO: String(idx + 1),
          ITRT_CNT: subject,
          LOAD_DTM: new Date().toISOString(),
        });
      });
    }
    current.setDate(current.getDate() + 1);
  }

  return items;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const grade = parseInt(searchParams.get('grade') || '2', 10);
  const classNm = searchParams.get('classNm') || '1';
  const fromYmd = searchParams.get('fromYmd') || '';
  const toYmd = searchParams.get('toYmd') || '';
  const customKey = searchParams.get('apiKey') || '';

  if (!fromYmd || !toYmd) {
    return NextResponse.json(
      { error: 'fromYmd and toYmd are required (YYYYMMDD)' },
      { status: 400 }
    );
  }

  const apiKey = customKey || process.env.NEIS_API_KEY || '';
  const neisUrl = `https://open.neis.go.kr/hub/hisTimetable?KEY=${apiKey}&Type=json&pIndex=1&pSize=100&ATPT_OFCDC_SC_CODE=C10&SD_SCHUL_CODE=7150597&GRADE=${grade}&CLASS_NM=${encodeURIComponent(
    classNm
  )}&TI_FROM_YMD=${fromYmd}&TI_TO_YMD=${toYmd}`;

  try {
    const res = await fetch(neisUrl, { next: { revalidate: 3600 } });
    if (res.ok) {
      const data = await res.json();

      if (data?.hisTimetable && data.hisTimetable[1]?.row) {
        const rows: TimetableItem[] = data.hisTimetable[1].row.map((item: any) => ({
          ...item,
          // 고등학교 시간표는 ITRT_CNTNT, 중/초등은 ITRT_CNT
          ITRT_CNT: item.ITRT_CNTNT || item.ITRT_CNT || '자율',
          ITRT_CNTNT: item.ITRT_CNTNT || item.ITRT_CNT || '자율',
        }));
        return NextResponse.json({
          source: 'NEIS_API',
          count: rows.length,
          data: rows,
        });
      }

      // 방학/학기 미시작/데이터 없음 코드 (INFO-200 등)
      if (data?.RESULT?.CODE && data.RESULT.CODE !== 'INFO-000') {
        console.info(`NEIS 메시지: ${data.RESULT.MESSAGE} -> 샘플 데이터 제공`);
      }
    }
  } catch (error) {
    console.error('NEIS API 호출 중 예외 발생:', error);
  }

  // 데이터가 없거나 API 키 미제공 시 대진전자통신고 커리큘럼 기반 폴백 제공
  const fallbackData = generateFallbackTimetable(grade, classNm, fromYmd, toYmd);
  return NextResponse.json({
    source: 'DAEJIN_MOCK_FALLBACK',
    count: fallbackData.length,
    message: '공공데이터 미제공(방학/주말/인증키)으로 대진전자통신고 표준 시간표가 표시됩니다.',
    data: fallbackData,
  });
}
