// 연봉 실수령액 계산기 — 4대보험(국민연금·건강보험·장기요양보험·고용보험) +
// 근로소득세(근로소득공제 → 기본세율표 → 근로소득세액공제)를 근사 계산한다.
// 실제 원천징수(간이세액표)와는 차이가 있을 수 있는 '추정치'다.
function formatWon(n) {
  return Math.round(n).toLocaleString('ko-KR') + '원';
}

// 근로소득공제 (근로기준 총급여 구간별)
function earnedIncomeDeduction(annualGross) {
  if (annualGross <= 5000000) return annualGross * 0.7;
  if (annualGross <= 15000000) return 3500000 + (annualGross - 5000000) * 0.4;
  if (annualGross <= 45000000) return 7500000 + (annualGross - 15000000) * 0.15;
  if (annualGross <= 100000000) return 12000000 + (annualGross - 45000000) * 0.05;
  return 14750000 + (annualGross - 100000000) * 0.02;
}

// 종합소득세 기본세율표 (누진공제 방식)
function calcIncomeTax(taxBase) {
  if (taxBase <= 0) return 0;
  if (taxBase <= 14000000) return taxBase * 0.06;
  if (taxBase <= 50000000) return taxBase * 0.15 - 1260000;
  if (taxBase <= 88000000) return taxBase * 0.24 - 5760000;
  if (taxBase <= 150000000) return taxBase * 0.35 - 15440000;
  if (taxBase <= 300000000) return taxBase * 0.38 - 19940000;
  if (taxBase <= 500000000) return taxBase * 0.4 - 25940000;
  if (taxBase <= 1000000000) return taxBase * 0.42 - 35940000;
  return taxBase * 0.45 - 65940000;
}

// 근로소득세액공제 (산출세액 감면 + 총급여 구간별 한도)
function earnedIncomeTaxCredit(calculatedTax, annualGross) {
  let credit = calculatedTax <= 1300000
    ? calculatedTax * 0.55
    : 715000 + (calculatedTax - 1300000) * 0.3;

  let cap;
  if (annualGross <= 33000000) cap = 740000;
  else if (annualGross <= 70000000) cap = Math.max(660000, 740000 - (annualGross - 33000000) * 0.008);
  else cap = 500000; // 고소득 구간은 단순화하여 하한값(50만원)으로 근사

  return Math.min(credit, cap);
}

function calcSalary(annualGross, dependents) {
  const monthlyGross = annualGross / 12;

  const pension = monthlyGross * 0.045;
  const health = monthlyGross * 0.03545;
  const longTermCare = health * 0.1295;
  const employment = monthlyGross * 0.009;
  const insuranceMonthly = pension + health + longTermCare + employment;

  const deduction = earnedIncomeDeduction(annualGross);
  const earnedIncomeAmount = Math.max(0, annualGross - deduction);
  const personalDeduction = dependents * 1500000;
  const taxBase = Math.max(0, earnedIncomeAmount - personalDeduction - insuranceMonthly * 12);

  const calculatedTax = calcIncomeTax(taxBase);
  const credit = earnedIncomeTaxCredit(calculatedTax, annualGross);
  const determinedTaxAnnual = Math.max(0, calculatedTax - credit);
  const localTaxAnnual = determinedTaxAnnual * 0.1;

  const incomeTaxMonthly = determinedTaxAnnual / 12;
  const localTaxMonthly = localTaxAnnual / 12;

  const monthlyNet = monthlyGross - insuranceMonthly - incomeTaxMonthly - localTaxMonthly;

  return {
    monthlyGross, monthlyNet,
    pension, health, longTermCare, employment,
    incomeTaxMonthly, localTaxMonthly,
    annualNet: monthlyNet * 12,
  };
}

function initSalaryCalculator() {
  const form = document.getElementById('salaryForm');
  const resultEl = document.getElementById('salaryResult');

  form.addEventListener('submit', e => {
    e.preventDefault();
    const annualGross = Number(document.getElementById('annualGross').value) * 10000; // 만원 단위 입력
    const dependents = Math.max(1, Number(document.getElementById('dependents').value) || 1);

    if (!annualGross || annualGross <= 0) {
      alert('연봉을 입력해주세요.');
      return;
    }

    const r = calcSalary(annualGross, dependents);

    document.getElementById('resultMonthlyNet').textContent = formatWon(r.monthlyNet);
    document.getElementById('resultAnnualNet').textContent = `연간 실수령액 ${formatWon(r.annualNet)}`;
    document.getElementById('rowGross').textContent = formatWon(r.monthlyGross);
    document.getElementById('rowPension').textContent = '-' + formatWon(r.pension);
    document.getElementById('rowHealth').textContent = '-' + formatWon(r.health);
    document.getElementById('rowLtc').textContent = '-' + formatWon(r.longTermCare);
    document.getElementById('rowEmployment').textContent = '-' + formatWon(r.employment);
    document.getElementById('rowIncomeTax').textContent = '-' + formatWon(r.incomeTaxMonthly);
    document.getElementById('rowLocalTax').textContent = '-' + formatWon(r.localTaxMonthly);

    resultEl.hidden = false;
  });
}

initSalaryCalculator();
