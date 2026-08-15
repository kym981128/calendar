// 연간(12개월) 캘린더 렌더링 + 날짜 클릭 시 연차 차감
const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];
const MONTH_LABELS = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];

function buildMiniMonth(year, monthIndex) {
  const wrap = document.createElement('div');
  wrap.className = 'mini-month';

  const title = document.createElement('div');
  title.className = 'mini-month-title';
  title.textContent = MONTH_LABELS[monthIndex];
  wrap.appendChild(title);

  const weekdayRow = document.createElement('div');
  weekdayRow.className = 'mini-month-weekdays';
  WEEKDAY_LABELS.forEach((w, i) => {
    const el = document.createElement('span');
    el.textContent = w;
    if (i === 0 || i === 6) el.classList.add('is-weekend');
    weekdayRow.appendChild(el);
  });
  wrap.appendChild(weekdayRow);

  const daysGrid = document.createElement('div');
  daysGrid.className = 'mini-month-days';

  const firstDay = new Date(year, monthIndex, 1);
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const startOffset = firstDay.getDay();

  for (let i = 0; i < startOffset; i++) {
    const empty = document.createElement('div');
    empty.className = 'day is-empty';
    daysGrid.appendChild(empty);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dateObj = new Date(year, monthIndex, d);
    const dateStr = toISODate(year, monthIndex, d);
    const cell = document.createElement('button');
    cell.type = 'button';
    cell.className = 'day';
    cell.textContent = String(d);
    cell.dataset.date = dateStr;

    const weekend = isWeekend(dateObj);
    const officialHoliday = AppState.isOfficialHoliday(dateStr);
    const customHoliday = AppState.isCustomHoliday(dateStr);
    const usedType = AppState.usedType(dateStr);
    const past = isPastDate(dateObj);

    if (weekend) cell.classList.add('is-weekend');
    if (past) cell.classList.add('is-past');

    if (officialHoliday) {
      cell.classList.add('is-holiday');
      cell.title = AppState.holidayName(dateStr);
      cell.disabled = true;
    } else if (customHoliday) {
      cell.classList.add('is-custom-holiday');
      cell.title = AppState.holidayName(dateStr);
      cell.disabled = true;
    } else if (weekend) {
      cell.disabled = true;
    } else if (past) {
      cell.disabled = true;
    }
    if (usedType === 'full') cell.classList.add('is-used');
    else if (usedType === 'half') { cell.classList.add('is-half'); cell.title = '반차'; }
    if (dateStr === AppState.today) cell.classList.add('is-today');

    cell.addEventListener('click', () => AppState.toggleDate(dateStr, dateObj));
    daysGrid.appendChild(cell);
  }

  wrap.appendChild(daysGrid);
  return wrap;
}

function renderYearGrid() {
  const container = document.getElementById('yearGrid');
  container.innerHTML = '';
  for (let m = 0; m < 12; m++) {
    container.appendChild(buildMiniMonth(AppState.year, m));
  }
}
