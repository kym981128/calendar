// 연차수당(미사용 연차 수당) 계산기
// 1일 통상임금 = (월 통상임금 / 209) × 8, 연차수당 = 1일 통상임금 × 미사용 연차일수
function formatWon(n) {
  return Math.round(n).toLocaleString('ko-KR') + '원';
}

function initLeavePayoutCalculator() {
  const form = document.getElementById('leavePayoutForm');
  const resultEl = document.getElementById('leavePayoutResult');

  form.addEventListener('submit', e => {
    e.preventDefault();
    const monthlySalary = Number(document.getElementById('lpMonthlySalary').value) * 10000; // 만원 단위
    const unusedDays = Number(document.getElementById('lpUnusedDays').value);

    if (!monthlySalary || monthlySalary <= 0) {
      alert('통상임금(월급) 을 입력해주세요.');
      return;
    }
    if (!unusedDays || unusedDays <= 0) {
      alert('남은(미사용) 연차일수를 입력해주세요.');
      return;
    }

    const hourlyWage = monthlySalary / 209;
    const dailyWage = hourlyWage * 8;
    const payout = dailyWage * unusedDays;

    document.getElementById('lpResultTotal').textContent = formatWon(payout);
    document.getElementById('lpRowHourly').textContent = formatWon(hourlyWage);
    document.getElementById('lpRowDaily').textContent = formatWon(dailyWage);
    document.getElementById('lpRowDays').textContent = `${unusedDays}일`;

    resultEl.hidden = false;
  });
}

initLeavePayoutCalculator();
