// "연차를 가장 효율적으로 쓰는 방법" 추천
// 공휴일/주말 사이에 낀 근무일(최대 3일)을 연차로 채우면 만들어지는 연휴를 계산해,
// (총 연휴일 / 사용 연차일) 효율이 높은 순으로 추천한다.
const MAX_BRIDGE_LEN = 3;

function buildDayList(year) {
  const cursor = new Date(year, 0, 1);
  const end = new Date(year, 11, 31);
  const days = [];
  while (cursor <= end) {
    const dateStr = toISODate(cursor.getFullYear(), cursor.getMonth(), cursor.getDate());
    const off = isWeekend(cursor) || AppState.isHoliday(dateStr);
    days.push({ dateStr, dateObj: new Date(cursor), off });
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
}

function makeCandidate(days, rangeStartIdx, rangeEndIdx, gapDates) {
  const totalOff = rangeEndIdx - rangeStartIdx + 1;
  const gapLen = gapDates.length;
  return {
    gapDates,
    rangeStart: days[rangeStartIdx].dateObj,
    rangeEnd: days[rangeEndIdx].dateObj,
    totalOff,
    gapLen,
    efficiency: totalOff / gapLen,
  };
}

// 근무일 구간(run) 하나마다 세 종류의 추천을 만든다:
// 1) 구간 전체를 연차로 채워 앞뒤 휴일을 모두 잇기
// 2) 구간 앞부분 k일만 써서 앞쪽 휴일에 붙이기 (뒤가 더 길게 남아있어도 유효한 추천)
// 3) 구간 뒷부분 k일만 써서 뒤쪽 휴일에 붙이기
function computeBridgeCandidates(year, maxGap) {
  const days = buildDayList(year);
  const candidates = [];
  let i = 0;

  while (i < days.length) {
    if (days[i].off) { i++; continue; }
    let j = i;
    while (j < days.length && !days[j].off) j++;
    const runLen = j - i;

    if (i === 0 || j === days.length) { i = j; continue; } // 연도 경계라 한쪽 휴일 블록이 없음

    let beforeStart = i - 1;
    while (beforeStart > 0 && days[beforeStart - 1].off) beforeStart--;
    let afterEnd = j;
    while (afterEnd < days.length - 1 && days[afterEnd + 1].off) afterEnd++;

    if (runLen <= maxGap) {
      candidates.push(makeCandidate(days, beforeStart, afterEnd, days.slice(i, j).map(d => d.dateStr)));
    }
    for (let k = 1; k <= Math.min(runLen - 1, maxGap); k++) {
      candidates.push(makeCandidate(days, beforeStart, i + k - 1, days.slice(i, i + k).map(d => d.dateStr)));
      candidates.push(makeCandidate(days, j - k, afterEnd, days.slice(j - k, j).map(d => d.dateStr)));
    }

    i = j;
  }

  candidates.sort((a, b) => b.efficiency - a.efficiency || b.totalOff - a.totalOff);
  return candidates;
}

function formatShortDate(dateObj) {
  return `${dateObj.getMonth() + 1}/${dateObj.getDate()}(${WEEKDAY_LABELS[dateObj.getDay()]})`;
}

function renderRecommend() {
  const listEl = document.getElementById('recommendList');
  listEl.innerHTML = '';

  const remaining = AppState.totalLeave - AppState.usedDates.size;
  const candidates = computeBridgeCandidates(AppState.year, MAX_BRIDGE_LEN)
    .filter(c => !c.gapDates.every(d => AppState.isUsed(d)))
    .slice(0, 3);

  if (candidates.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'text-sub';
    empty.textContent = '추천할 연차 조합이 없어요.';
    listEl.appendChild(empty);
    return;
  }

  candidates.forEach(c => {
    const item = document.createElement('div');
    item.className = 'recommend-item';

    const main = document.createElement('div');
    main.className = 'recommend-item-main';

    const tag = document.createElement('span');
    tag.className = 'tag';
    tag.textContent = `연차 ${c.gapLen}일`;

    const range = document.createElement('strong');
    range.textContent = `${formatShortDate(c.rangeStart)} ~ ${formatShortDate(c.rangeEnd)}`;

    main.appendChild(tag);
    main.appendChild(range);
    item.appendChild(main);

    const detail = document.createElement('p');
    detail.className = 'text-sub';
    detail.textContent = `총 ${c.totalOff}일 연휴 · 사용일 ${c.gapDates.map(d => formatShortDate(parseISODate(d))).join(', ')}`;
    item.appendChild(detail);

    const btn = document.createElement('button');
    btn.className = 'btn btn-sm';
    const need = c.gapDates.filter(d => !AppState.isUsed(d)).length;
    const alreadyPartial = need < c.gapDates.length;

    if (need > remaining) {
      btn.textContent = '남은 연차 부족';
      btn.disabled = true;
      btn.classList.add('btn-outline');
    } else {
      btn.textContent = alreadyPartial ? '나머지 적용' : '이 추천 적용';
      btn.addEventListener('click', () => {
        c.gapDates.forEach(d => {
          if (!AppState.isUsed(d)) AppState.toggleDate(d, parseISODate(d));
        });
      });
    }
    item.appendChild(btn);

    listEl.appendChild(item);
  });
}
