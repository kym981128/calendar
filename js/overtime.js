// 야근수당(연장·야간·휴일근로수당) 계산기
// 통상시급 = 월 통상임금 / 209 (주 40시간 근무 기준 월 소정근로시간)
function formatWon(n) {
  return Math.round(n).toLocaleString('ko-KR') + '원';
}

function initOvertimeCalculator() {
  const form = document.getElementById('overtimeForm');
  const resultEl = document.getElementById('overtimeResult');

  form.addEventListener('submit', e => {
    e.preventDefault();
    const monthlySalary = Number(document.getElementById('monthlySalary').value) * 10000; // 만원 단위
    const extraHours = Number(document.getElementById('extraHours').value) || 0;
    const nightHours = Number(document.getElementById('nightHours').value) || 0;
    const holidayHoursWithin8 = Number(document.getElementById('holidayHoursWithin8').value) || 0;
    const holidayHoursOver8 = Number(document.getElementById('holidayHoursOver8').value) || 0;

    if (!monthlySalary || monthlySalary <= 0) {
      alert('통상임금(월급) 을 입력해주세요.');
      return;
    }

    const hourlyWage = monthlySalary / 209;
    const extraPay = hourlyWage * 1.5 * extraHours;
    const nightPay = hourlyWage * 0.5 * nightHours;
    const holidayPay = hourlyWage * 1.5 * holidayHoursWithin8 + hourlyWage * 2.0 * holidayHoursOver8;
    const total = extraPay + nightPay + holidayPay;

    document.getElementById('resultTotal').textContent = formatWon(total);
    document.getElementById('rowHourly').textContent = formatWon(hourlyWage);
    document.getElementById('rowExtraPay').textContent = formatWon(extraPay);
    document.getElementById('rowNightPay').textContent = formatWon(nightPay);
    document.getElementById('rowHolidayPay').textContent = formatWon(holidayPay);

    resultEl.hidden = false;
  });
}

initOvertimeCalculator();
