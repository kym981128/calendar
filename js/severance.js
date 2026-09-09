// 퇴직금 계산기 — 근로기준법 기준: 평균임금(1일) × 30일 × (재직일수/365)
function formatWon(n) {
  return Math.round(n).toLocaleString('ko-KR') + '원';
}

function daysBetween(a, b) {
  return Math.round((b - a) / 86400000);
}

function initSeveranceCalculator() {
  const form = document.getElementById('severanceForm');
  const resultEl = document.getElementById('severanceResult');
  const warnEl = document.getElementById('severanceWarn');

  form.addEventListener('submit', e => {
    e.preventDefault();
    const hireDate = new Date(document.getElementById('hireDate').value);
    const resignDate = new Date(document.getElementById('resignDate').value);
    const recent3MonthPay = Number(document.getElementById('recent3MonthPay').value) * 10000; // 만원 단위

    if (!document.getElementById('hireDate').value || !document.getElementById('resignDate').value) {
      alert('입사일과 퇴사일을 입력해주세요.');
      return;
    }
    if (resignDate <= hireDate) {
      alert('퇴사일은 입사일보다 이후여야 합니다.');
      return;
    }
    if (!recent3MonthPay || recent3MonthPay <= 0) {
      alert('최근 3개월간 받은 급여 총액을 입력해주세요.');
      return;
    }

    const tenureDays = daysBetween(hireDate, resignDate);

    const threeMonthsBefore = new Date(resignDate);
    threeMonthsBefore.setMonth(threeMonthsBefore.getMonth() - 3);
    const periodDays = daysBetween(threeMonthsBefore, resignDate);

    resultEl.hidden = true;
    warnEl.hidden = true;

    if (tenureDays < 365) {
      warnEl.hidden = false;
      warnEl.textContent = `재직일수가 ${tenureDays.toLocaleString('ko-KR')}일(1년 미만)이라, 근로기준법상 법정 퇴직금 지급 대상이 아닙니다. (계속근로기간 1년 이상부터 발생)`;
      return;
    }

    const avgDailyWage = recent3MonthPay / periodDays;
    const severance = avgDailyWage * 30 * (tenureDays / 365);

    document.getElementById('resultSeverance').textContent = formatWon(severance);
    document.getElementById('rowTenure').textContent = `${tenureDays.toLocaleString('ko-KR')}일 (약 ${(tenureDays / 365).toFixed(1)}년)`;
    document.getElementById('rowPeriodDays').textContent = `${periodDays.toLocaleString('ko-KR')}일`;
    document.getElementById('rowAvgDaily').textContent = formatWon(avgDailyWage);

    resultEl.hidden = false;
  });
}

initSeveranceCalculator();
