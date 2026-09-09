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
function todayISODate() {
  const now = new Date();
  return toISODate(now.getFullYear(), now.getMonth(), now.getDate());
}
function isPastDate(dateObj) {
  return dateObj < parseISODate(AppState.today);
}
// 연차 일수는 반차(0.5일) 단위까지 다루므로, 부동소수점 오차를 피하기 위해
// 내부적으로는 0.5일 = 1 유닛인 정수 단위로 계산한다.
function toUnits(days) { return Math.round(days * 2); }
function fromUnits(units) { return units / 2; }
function isHalfStep(n) { return Math.abs(n * 2 - Math.round(n * 2)) < 1e-9; }

const STORAGE_KEY = 'yeonchaPlanner_state_v1';

const AppState = {
  year: 2026,
  totalLeave: 15,
  today: todayISODate(),
  holidayMap: new Map(KR_HOLIDAYS_2026.map(h => [h.date, h.name])),
  holidayList: KR_HOLIDAYS_2026,
  customHolidayMap: new Map(), // 사용자가 추가한 나만의 공휴일
  usedDates: new Map(), // dateStr -> 'full' | 'half'
  manualUsedLeave: 0, // 캘린더에 표시되지 않은, 직접 입력한 기사용 연차(일 단위, 0.5 단위 가능)
  memoMap: new Map(), // dateStr -> 메모 텍스트
  _listeners: [],

  onChange(fn) { this._listeners.push(fn); },
  _emit() { this.save(); this._listeners.forEach(fn => fn()); },

  // 브라우저(이 기기의 이 브라우저)에만 저장 — 서버로 전송되지 않는다.
  save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        totalLeave: this.totalLeave,
        manualUsedLeave: this.manualUsedLeave,
        usedDates: Array.from(this.usedDates.entries()),
        customHolidayMap: Array.from(this.customHolidayMap.entries()),
        memoMap: Array.from(this.memoMap.entries()),
      }));
    } catch (e) {
      // 시크릿 모드 등으로 localStorage를 쓸 수 없는 경우 조용히 무시한다.
    }
  },

  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      if (typeof data.totalLeave === 'number') this.totalLeave = data.totalLeave;
      if (typeof data.manualUsedLeave === 'number') this.manualUsedLeave = data.manualUsedLeave;
      if (Array.isArray(data.usedDates)) this.usedDates = new Map(data.usedDates);
      if (Array.isArray(data.customHolidayMap)) this.customHolidayMap = new Map(data.customHolidayMap);
      if (Array.isArray(data.memoMap)) this.memoMap = new Map(data.memoMap);
    } catch (e) {
      // 저장된 데이터가 손상된 경우 무시하고 기본값으로 시작한다.
    }
  },

  isOfficialHoliday(dateStr) { return this.holidayMap.has(dateStr); },
  isCustomHoliday(dateStr) { return this.customHolidayMap.has(dateStr); },
  isHoliday(dateStr) { return this.isOfficialHoliday(dateStr) || this.isCustomHoliday(dateStr); },
  holidayName(dateStr) { return this.holidayMap.get(dateStr) || this.customHolidayMap.get(dateStr); },
  isUsed(dateStr) { return this.usedDates.has(dateStr); },
  usedType(dateStr) { return this.usedDates.get(dateStr); },

  // 달력에서 클릭으로 표시한 연차만 유닛으로 환산 (연차=2유닛, 반차=1유닛)
  calendarUsedUnits() {
    let units = 0;
    this.usedDates.forEach(type => { units += type === 'half' ? 1 : 2; });
    return units;
  },
  usedUnitsTotal() { return this.calendarUsedUnits() + toUnits(this.manualUsedLeave); },
  usedTotal() { return fromUnits(this.usedUnitsTotal()); },
  remainingUnits() { return toUnits(this.totalLeave) - this.usedUnitsTotal(); },
  remaining() { return fromUnits(this.remainingUnits()); },

  // 평일 클릭 시 '없음 → 연차 → 반차 → 없음' 순으로 전환된다.
  toggleDate(dateStr, dateObj) {
    if (this.isHoliday(dateStr) || isWeekend(dateObj)) return;
    if (isPastDate(dateObj)) return;

    const current = this.usedDates.get(dateStr);
    if (current === 'full') {
      this.usedDates.set(dateStr, 'half');
    } else if (current === 'half') {
      this.usedDates.delete(dateStr);
    } else {
      if (this.remainingUnits() < 2) {
        alert('남은 연차가 없습니다.');
        return;
      }
      this.usedDates.set(dateStr, 'full');
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
    this.memoMap.clear();
    this.manualUsedLeave = 0;
    this._emit();
  },

  getMemo(dateStr) { return this.memoMap.get(dateStr) || ''; },
  setMemo(dateStr, text) {
    const trimmed = (text || '').trim().slice(0, 30);
    if (!trimmed) return;
    this.memoMap.set(dateStr, trimmed);
    this._emit();
  },
  removeMemo(dateStr) {
    this.memoMap.delete(dateStr);
    this._emit();
  },

  setTotalLeave(n) {
    if (typeof n !== 'number' || Number.isNaN(n) || n < 0 || !isHalfStep(n)) {
      alert('연차 일수는 0 이상, 0.5일 단위의 숫자로 입력해주세요.');
      return false;
    }
    if (toUnits(n) < this.usedUnitsTotal()) {
      alert(`이미 사용 처리된 연차가 ${this.usedTotal()}일이라 그보다 적게 설정할 수 없어요.`);
      return false;
    }
    this.totalLeave = n;
    this._emit();
    return true;
  },

  // 캘린더 클릭과 별개로, 이미 사용한 연차 일수를 직접 입력해 총량에 반영한다.
  setManualUsedLeave(n) {
    if (typeof n !== 'number' || Number.isNaN(n) || n < 0 || !isHalfStep(n)) {
      alert('사용 연차는 0 이상, 0.5일 단위의 숫자로 입력해주세요.');
      return false;
    }
    if (toUnits(n) + this.calendarUsedUnits() > toUnits(this.totalLeave)) {
      alert('입력한 사용 연차가 총 연차보다 많습니다.');
      return false;
    }
    this.manualUsedLeave = n;
    this._emit();
    return true;
  },
};
