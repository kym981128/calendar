// 공휴일을 월별로 정리해서 목록으로 보여준다.
function groupHolidaysByMonth(list) {
  const groups = {};
  list.forEach(h => {
    const month = Number(h.date.split('-')[1]);
    if (!groups[month]) groups[month] = [];
    groups[month].push(h);
  });
  return groups;
}

function renderHolidayList() {
  const container = document.getElementById('holidayList');
  container.innerHTML = '';

  const groups = groupHolidaysByMonth(AppState.holidayList);

  Object.keys(groups).sort((a, b) => a - b).forEach(monthKey => {
    const monthGroup = document.createElement('div');
    monthGroup.className = 'holiday-group';

    const title = document.createElement('div');
    title.className = 'holiday-group-title';
    title.textContent = MONTH_LABELS[monthKey - 1];
    monthGroup.appendChild(title);

    groups[monthKey].forEach(h => {
      const [y, m, d] = h.date.split('-').map(Number);
      const dateObj = new Date(y, m - 1, d);

      const row = document.createElement('div');
      row.className = 'holiday-row';

      const dateSpan = document.createElement('span');
      dateSpan.className = 'holiday-date';
      dateSpan.textContent = `${m}/${d} (${WEEKDAY_LABELS[dateObj.getDay()]})`;

      const nameTag = document.createElement('span');
      nameTag.className = 'tag';
      nameTag.textContent = h.name;

      row.appendChild(dateSpan);
      row.appendChild(nameTag);
      monthGroup.appendChild(row);
    });

    container.appendChild(monthGroup);
  });
}

// 나만의 공휴일 목록 + 추가 폼
function renderCustomHolidayList() {
  const container = document.getElementById('customHolidayList');
  container.innerHTML = '';

  const entries = Array.from(AppState.customHolidayMap.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  if (entries.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'text-sub';
    empty.textContent = '아직 추가한 날짜가 없어요.';
    container.appendChild(empty);
    return;
  }

  entries.forEach(([dateStr, name]) => {
    const dateObj = parseISODate(dateStr);
    const row = document.createElement('div');
    row.className = 'holiday-row';

    const dateSpan = document.createElement('span');
    dateSpan.className = 'holiday-date';
    dateSpan.textContent = `${dateObj.getMonth() + 1}/${dateObj.getDate()} (${WEEKDAY_LABELS[dateObj.getDay()]})`;

    const right = document.createElement('span');
    right.className = 'holiday-row-right';

    const nameTag = document.createElement('span');
    nameTag.className = 'tag tag-sub';
    nameTag.textContent = name;

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'custom-holiday-remove';
    removeBtn.textContent = '삭제';
    removeBtn.addEventListener('click', () => AppState.removeCustomHoliday(dateStr));

    right.appendChild(nameTag);
    right.appendChild(removeBtn);
    row.appendChild(dateSpan);
    row.appendChild(right);
    container.appendChild(row);
  });
}

function initCustomHolidayForm() {
  const form = document.getElementById('customHolidayForm');
  form.addEventListener('submit', e => {
    e.preventDefault();
    const dateInput = document.getElementById('customHolidayDate');
    const nameInput = document.getElementById('customHolidayName');
    if (!dateInput.value) return;

    const added = AppState.addCustomHoliday(dateInput.value.trim(), nameInput.value.trim());
    if (added) {
      dateInput.value = '';
      nameInput.value = '';
    }
  });
}
