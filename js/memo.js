// 날짜별 메모 목록 렌더링 + 입력 폼 (연차 여부와 무관하게 아무 날짜에나 남길 수 있다)
function renderMemoList() {
  const container = document.getElementById('memoList');
  container.innerHTML = '';

  const entries = Array.from(AppState.memoMap.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  if (entries.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'text-sub';
    empty.textContent = '아직 남긴 메모가 없어요.';
    container.appendChild(empty);
    return;
  }

  entries.forEach(([dateStr, text]) => {
    const dateObj = parseISODate(dateStr);
    const row = document.createElement('div');
    row.className = 'holiday-row';

    const dateSpan = document.createElement('span');
    dateSpan.className = 'holiday-date';
    dateSpan.textContent = `${dateObj.getMonth() + 1}/${dateObj.getDate()} (${WEEKDAY_LABELS[dateObj.getDay()]})`;

    const right = document.createElement('span');
    right.className = 'holiday-row-right';

    const textTag = document.createElement('span');
    textTag.className = 'tag tag-sub';
    textTag.textContent = text;

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'custom-holiday-remove';
    removeBtn.textContent = '삭제';
    removeBtn.addEventListener('click', () => AppState.removeMemo(dateStr));

    right.appendChild(textTag);
    right.appendChild(removeBtn);
    row.appendChild(dateSpan);
    row.appendChild(right);
    container.appendChild(row);
  });
}

function initMemoForm() {
  const form = document.getElementById('memoForm');
  form.addEventListener('submit', e => {
    e.preventDefault();
    const dateInput = document.getElementById('memoDate');
    const textInput = document.getElementById('memoText');
    if (!dateInput.value || !textInput.value.trim()) return;

    AppState.setMemo(dateInput.value, textInput.value);
    dateInput.value = '';
    textInput.value = '';
  });
}
