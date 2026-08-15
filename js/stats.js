// 사용/잔여 연차 실시간 표시
function formatDays(n) {
  return (Number.isInteger(n) ? n : n.toFixed(1)) + '일';
}

function renderStats() {
  const used = AppState.usedTotal();
  const remaining = AppState.remaining();

  document.getElementById('statUsed').textContent = formatDays(used);
  document.getElementById('statRemaining').textContent = formatDays(remaining);
  document.getElementById('totalLeaveHint').textContent = `총 ${formatDays(AppState.totalLeave)} 중`;

  const manualHint = document.getElementById('manualUsedHint');
  manualHint.textContent = AppState.manualUsedLeave > 0
    ? `직접 입력한 ${formatDays(AppState.manualUsedLeave)} 포함`
    : '';
}
