// 사용/잔여 연차 실시간 표시
function renderStats() {
  const used = AppState.usedDates.size;
  const remaining = AppState.totalLeave - used;

  document.getElementById('statUsed').textContent = `${used}일`;
  document.getElementById('statRemaining').textContent = `${remaining}일`;
  document.getElementById('totalLeaveHint').textContent = `총 ${AppState.totalLeave}일 중`;
}
