// 앱 초기화
document.getElementById('headerIcon').innerHTML = ICONS.calendar;
document.getElementById('iconPlane').innerHTML = ICONS.plane;
document.getElementById('iconCalendar').innerHTML = ICONS.calendar;
document.getElementById('iconBrain').innerHTML = ICONS.brain;

document.getElementById('resetAllBtn').addEventListener('click', () => {
  if (confirm('사용한 연차와 나만의 공휴일을 모두 초기화할까요?')) {
    AppState.resetAll();
  }
});

document.getElementById('editTotalLeaveBtn').addEventListener('click', () => {
  const input = prompt('올해 총 연차 일수를 입력하세요. (0.5일 단위 가능)', AppState.totalLeave);
  if (input === null) return;
  AppState.setTotalLeave(Number(input));
});

document.getElementById('editManualUsedBtn').addEventListener('click', () => {
  const input = prompt(
    '달력에 표시하지 않고, 이미 사용한 연차 일수를 직접 입력하세요. (0.5일 단위 가능)',
    AppState.manualUsedLeave
  );
  if (input === null) return;
  AppState.setManualUsedLeave(Number(input));
});

function render() {
  renderYearGrid();
  renderStats();
  renderRecommend();
  renderCustomHolidayList();
}

AppState.onChange(render);
initCustomHolidayForm();
render();
renderHolidayList();
