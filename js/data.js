// 2026년 대한민국 법정 공휴일 (대체공휴일 포함, 출처: 관공서의 공휴일에 관한 규정 기준 목록)
const KR_HOLIDAYS_2026 = [
  { date: '2026-01-01', name: '신정' },
  { date: '2026-02-16', name: '설날 연휴' },
  { date: '2026-02-17', name: '설날' },
  { date: '2026-02-18', name: '설날 연휴' },
  { date: '2026-03-01', name: '삼일절' },
  { date: '2026-03-02', name: '대체공휴일 (삼일절)' },
  { date: '2026-05-05', name: '어린이날' },
  { date: '2026-05-24', name: '부처님오신날' },
  { date: '2026-05-25', name: '대체공휴일 (부처님오신날)' },
  { date: '2026-06-06', name: '현충일' },
  { date: '2026-07-17', name: '제헌절' }, // 2026-05-11부터 공휴일 재지정 (대통령령 제36290호)
  { date: '2026-08-15', name: '광복절' },
  { date: '2026-08-17', name: '대체공휴일 (광복절)' },
  { date: '2026-09-24', name: '추석 연휴' },
  { date: '2026-09-25', name: '추석' },
  { date: '2026-09-26', name: '추석 연휴' },
  { date: '2026-10-03', name: '개천절' },
  { date: '2026-10-05', name: '대체공휴일 (개천절)' },
  { date: '2026-10-09', name: '한글날' },
  { date: '2026-12-25', name: '크리스마스' },
];

function pad2(n) { return String(n).padStart(2, '0'); }
function toISODate(y, m, d) { return `${y}-${pad2(m + 1)}-${pad2(d)}`; }
function isWeekend(dateObj) { const day = dateObj.getDay(); return day === 0 || day === 6; }
function parseISODate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

const AppState = {
  year: 2026,
  totalLeave: 15,
  today: '2026-07-11',
  holidayMap: new Map(KR_HOLIDAYS_2026.map(h => [h.date, h.name])),
  holidayList: KR_HOLIDAYS_2026,
  customHolidayMap: new Map(), // 사용자가 추가한 나만의 공휴일
  // 더미: 이미 신청된 연차 (신정 다음날, 어린이날 앞 브릿지데이)
  usedDates: new Set(['2026-01-02', '2026-05-04']),
  _listeners: [],

  onChange(fn) { this._listeners.push(fn); },
  _emit() { this._listeners.forEach(fn => fn()); },

  isOfficialHoliday(dateStr) { return this.holidayMap.has(dateStr); },
  isCustomHoliday(dateStr) { return this.customHolidayMap.has(dateStr); },
  isHoliday(dateStr) { return this.isOfficialHoliday(dateStr) || this.isCustomHoliday(dateStr); },
  holidayName(dateStr) { return this.holidayMap.get(dateStr) || this.customHolidayMap.get(dateStr); },
  isUsed(dateStr) { return this.usedDates.has(dateStr); },

  toggleDate(dateStr, dateObj) {
    if (this.isHoliday(dateStr) || isWeekend(dateObj)) return;
    if (this.usedDates.has(dateStr)) {
      this.usedDates.delete(dateStr);
    } else {
      if (this.usedDates.size >= this.totalLeave) {
        alert('남은 연차가 없습니다.');
        return;
      }
      this.usedDates.add(dateStr);
    }
    this._emit();
  },

  addCustomHoliday(dateStr, name) {
    if (this.isOfficialHoliday(dateStr)) {
      alert('이미 공휴일로 지정된 날짜예요.');
      return false;
    }
    if (this.isCustomHoliday(dateStr)) {
      alert('이미 추가한 날짜예요.');
      return false;
    }
    this.usedDates.delete(dateStr); // 연차로 써둔 날이면 취소하고 공휴일로 전환
    this.customHolidayMap.set(dateStr, name || '개인 공휴일');
    this._emit();
    return true;
  },

  removeCustomHoliday(dateStr) {
    this.customHolidayMap.delete(dateStr);
    this._emit();
  },

  resetAll() {
    this.usedDates.clear();
    this.customHolidayMap.clear();
    this._emit();
  },

  setTotalLeave(n) {
    if (!Number.isInteger(n) || n < 0) {
      alert('연차 일수는 0 이상의 정수로 입력해주세요.');
      return false;
    }
    if (n < this.usedDates.size) {
      alert(`이미 사용한 연차가 ${this.usedDates.size}일이라 그보다 적게 설정할 수 없어요.`);
      return false;
    }
    this.totalLeave = n;
    this._emit();
    return true;
  },
};
