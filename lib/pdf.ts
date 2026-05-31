import jsPDF from "jspdf";
import html2canvas from "html2canvas";

// ── Утилиты ──────────────────────────────────────────────────────────────────

function today() {
  return new Date().toLocaleDateString("ru-RU");
}

function fmt(n: number | null | undefined): string {
  if (n == null) return "—";
  return n.toLocaleString("ru-RU");
}

function fmtDate(s: string | null | undefined): string {
  if (!s) return "—";
  return new Date(s).toLocaleDateString("ru-RU");
}

async function htmlToPdf(
  html: string,
  filename: string,
  pageWidthPx = 794  // A4 at 96dpi
) {
  const container = document.createElement("div");
  container.style.cssText = `
    position: fixed; left: -9999px; top: 0;
    width: ${pageWidthPx}px;
    font-family: -apple-system, 'Segoe UI', Arial, sans-serif;
    font-size: 12px; line-height: 1.5;
    color: #1f2937; background: #fff;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  `;
  container.innerHTML = html;
  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      allowTaint: false,
      backgroundColor: "#ffffff",
    });

    const imgData = canvas.toDataURL("image/png");
    const imgW = 210; // A4 mm
    const imgH = (canvas.height / canvas.width) * imgW;

    const doc = new jsPDF({
      format: imgH > 297 ? [imgW, imgH] : "a4",
      unit: "mm",
      orientation: imgH > imgW ? "portrait" : "portrait",
    });

    // Если контент больше A4 — масштабируем, иначе — оставляем как есть
    const pdfH = doc.internal.pageSize.getHeight();
    const pdfW = doc.internal.pageSize.getWidth();

    if (imgH <= pdfH) {
      doc.addImage(imgData, "PNG", 0, 0, pdfW, imgH);
    } else {
      // Разбиваем на страницы
      const pageHeightPx = (pdfH / imgW) * canvas.width;
      let offsetY = 0;
      let pageNum = 0;

      while (offsetY < canvas.height) {
        const sliceH = Math.min(pageHeightPx, canvas.height - offsetY);
        const sliceCanvas = document.createElement("canvas");
        sliceCanvas.width = canvas.width;
        sliceCanvas.height = sliceH;
        const ctx = sliceCanvas.getContext("2d")!;
        ctx.drawImage(canvas, 0, -offsetY);
        const sliceData = sliceCanvas.toDataURL("image/png");

        if (pageNum > 0) doc.addPage();
        doc.addImage(sliceData, "PNG", 0, 0, pdfW, (sliceH / canvas.width) * imgW);

        offsetY += pageHeightPx;
        pageNum++;
      }
    }

    doc.save(filename);
  } finally {
    document.body.removeChild(container);
  }
}

// ── Общие стили для HTML-шаблонов ────────────────────────────────────────────

const CSS = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, 'Segoe UI', Arial, sans-serif; }
  .header {
    background: #1f4d3a; color: #fff; padding: 14px 20px;
    display: flex; justify-content: space-between; align-items: center;
  }
  .header-title { font-size: 18px; font-weight: 700; }
  .header-sub { font-size: 11px; opacity: .75; margin-top: 2px; }
  .header-date { font-size: 11px; opacity: .75; text-align: right; }
  .content { padding: 20px; }
  .subtitle { font-size: 11px; color: #6b7280; margin-top: 4px; }
  .info-grid {
    display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 16px 0;
  }
  .info-box {
    background: #f3f6ef; border-radius: 8px; padding: 10px 12px;
  }
  .info-box .label { font-size: 10px; color: #6b7280; }
  .info-box .value { font-size: 14px; font-weight: 600; margin-top: 2px; }
  .section-title {
    font-size: 13px; font-weight: 700; color: #1f4d3a;
    margin: 16px 0 8px;
  }
  table { width: 100%; border-collapse: collapse; font-size: 11px; }
  thead tr { background: #1f4d3a; color: #fff; }
  thead th { padding: 7px 10px; text-align: left; font-weight: 600; }
  tbody tr:nth-child(even) { background: #f3f6ef; }
  tbody td { padding: 6px 10px; border-bottom: 1px solid #e5e7eb; }
  .totals-grid {
    display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin: 16px 0;
  }
  .total-box {
    background: #f3f6ef; border-radius: 8px; padding: 12px 14px;
  }
  .total-box .label { font-size: 10px; color: #6b7280; }
  .total-box .value { font-size: 16px; font-weight: 700; margin-top: 4px; }
  .negative { color: #b91c1c; }
  .positive { color: #1f6a4f; }
  .footer {
    margin-top: 20px; padding: 12px 20px;
    border-top: 1px solid #e5e7eb;
    font-size: 10px; color: #9ca3af;
    display: flex; justify-content: space-between;
  }
  .signature-row {
    display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 24px;
  }
  .signature-line {
    border-top: 1px solid #374151; padding-top: 4px;
    font-size: 10px; color: #6b7280;
  }
`;

// ── Карточка животного ───────────────────────────────────────────────────────

type AnimalCard = {
  animal_code: string | null;
  age: string | null;
  status: string | null;
  batch: string | null;
  start_weight: number | null;
  current_weight: number | null;
};

type WeighingRecord = {
  weighing_date: string;
  weight: number;
  comment: string | null;
};

type AnimalVaccine = {
  vaccine_name: string;
  vaccination_date: string;
  next_vaccination_date: string | null;
  dose: string | null;
  veterinarian: string | null;
};

export async function exportAnimalCardPDF(
  animal: AnimalCard,
  weighings: WeighingRecord[],
  vaccines: AnimalVaccine[]
) {
  const gain =
    animal.start_weight != null && animal.current_weight != null
      ? animal.current_weight - animal.start_weight
      : null;

  const weighingsRows = weighings
    .map(
      (w) => `<tr>
      <td>${fmtDate(w.weighing_date)}</td>
      <td>${w.weight} кг</td>
      <td>${w.comment ?? "—"}</td>
    </tr>`
    )
    .join("");

  const vaccinesRows = vaccines
    .map(
      (v) => `<tr>
      <td>${v.vaccine_name}</td>
      <td>${fmtDate(v.vaccination_date)}</td>
      <td>${fmtDate(v.next_vaccination_date)}</td>
      <td>${v.dose ?? "—"}</td>
      <td>${v.veterinarian ?? "—"}</td>
    </tr>`
    )
    .join("");

  const html = `<style>${CSS}</style>
  <div class="header">
    <div>
      <div class="header-title">WestKaz Agro</div>
      <div class="header-sub">Карточка животного: ${animal.animal_code ?? "—"}</div>
    </div>
    <div class="header-date">Сформировано<br>${today()}</div>
  </div>
  <div class="content">
    <div class="subtitle">Партия: ${animal.batch ?? "—"} · Статус: ${animal.status ?? "—"}</div>

    <div class="info-grid">
      <div class="info-box"><div class="label">Возраст</div><div class="value">${animal.age ?? "—"}</div></div>
      <div class="info-box"><div class="label">Стартовый вес</div><div class="value">${animal.start_weight != null ? animal.start_weight + " кг" : "—"}</div></div>
      <div class="info-box"><div class="label">Текущий вес</div><div class="value">${animal.current_weight != null ? animal.current_weight + " кг" : "—"}</div></div>
      <div class="info-box"><div class="label">Общий привес</div><div class="value">${gain != null ? "+" + gain + " кг" : "—"}</div></div>
    </div>

    ${
      weighings.length > 0
        ? `<div class="section-title">История взвешиваний</div>
      <table>
        <thead><tr><th>Дата</th><th>Вес</th><th>Комментарий</th></tr></thead>
        <tbody>${weighingsRows}</tbody>
      </table>`
        : ""
    }

    ${
      vaccines.length > 0
        ? `<div class="section-title">История вакцинаций</div>
      <table>
        <thead><tr><th>Вакцина</th><th>Дата</th><th>Ревакцинация</th><th>Доза</th><th>Ветеринар</th></tr></thead>
        <tbody>${vaccinesRows}</tbody>
      </table>`
        : ""
    }

    <div class="footer">
      <span>WestKaz Agro · ${today()}</span>
      <span>Карточка: ${animal.animal_code ?? "—"}</span>
    </div>
  </div>`;

  await htmlToPdf(
    html,
    `карточка_${animal.animal_code ?? "животного"}_${today().replace(/\./g, "-")}.pdf`
  );
}

// ── Акт вакцинации ───────────────────────────────────────────────────────────

type VaccineRecord = {
  vaccine_name: string;
  vaccination_date: string;
  next_vaccination_date: string | null;
  dose: string | null;
  veterinarian: string | null;
  vaccine_lot: string | null;
  comment: string | null;
  animal_code?: string | null;
  batch_name?: string | null;
};

export async function exportVaccinationPDF(vaccines: VaccineRecord[]) {
  const rows = vaccines
    .map(
      (v) => `<tr>
      <td>${v.animal_code ?? v.batch_name ?? "—"}</td>
      <td>${v.vaccine_name}</td>
      <td>${fmtDate(v.vaccination_date)}</td>
      <td>${fmtDate(v.next_vaccination_date)}</td>
      <td>${v.dose ?? "—"}</td>
      <td>${v.veterinarian ?? "—"}</td>
      <td>${v.vaccine_lot ?? "—"}</td>
    </tr>`
    )
    .join("");

  const html = `<style>${CSS}</style>
  <div class="header">
    <div>
      <div class="header-title">WestKaz Agro</div>
      <div class="header-sub">Акт вакцинации</div>
    </div>
    <div class="header-date">Сформировано<br>${today()}</div>
  </div>
  <div class="content">
    <div class="subtitle">Всего записей: ${vaccines.length}</div>

    <table style="margin-top:16px">
      <thead>
        <tr>
          <th>Животное / Партия</th>
          <th>Вакцина</th>
          <th>Дата</th>
          <th>Ревакцинация</th>
          <th>Доза</th>
          <th>Ветеринар</th>
          <th>Серия</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>

    <div class="signature-row" style="margin-top:32px">
      <div>
        <div class="signature-line">Ветеринарный врач</div>
      </div>
      <div>
        <div class="signature-line">Дата и печать</div>
      </div>
    </div>

    <div class="footer">
      <span>WestKaz Agro · ${today()}</span>
      <span>Акт вакцинации · ${vaccines.length} записей</span>
    </div>
  </div>`;

  await htmlToPdf(
    html,
    `акт_вакцинации_${today().replace(/\./g, "-")}.pdf`
  );
}

// ── Финансовый отчёт ─────────────────────────────────────────────────────────

type AnalyticsRow = {
  name: string;
  animals: number;
  revenue: number;
  expenses: number;
  profit: number;
  totalGain: number;
  avgGain: number;
};

export async function exportFinancialPDF(
  analytics: AnalyticsRow[],
  totalRevenue: number,
  totalExpenses: number,
  totalProfit: number
) {
  const rows = analytics
    .map(
      (a) => `<tr>
      <td>${a.name}</td>
      <td>${a.animals}</td>
      <td>${fmt(a.revenue)} ₸</td>
      <td>${fmt(a.expenses)} ₸</td>
      <td class="${a.profit >= 0 ? "positive" : "negative"}">${fmt(a.profit)} ₸</td>
      <td>${a.totalGain} кг</td>
      <td>${a.avgGain} кг</td>
    </tr>`
    )
    .join("");

  const html = `<style>${CSS}</style>
  <div class="header">
    <div>
      <div class="header-title">WestKaz Agro</div>
      <div class="header-sub">Финансовый отчёт</div>
    </div>
    <div class="header-date">По состоянию на<br>${today()}</div>
  </div>
  <div class="content">
    <div class="totals-grid">
      <div class="total-box">
        <div class="label">Выручка</div>
        <div class="value">${fmt(totalRevenue)} ₸</div>
      </div>
      <div class="total-box">
        <div class="label">Расходы</div>
        <div class="value">${fmt(totalExpenses)} ₸</div>
      </div>
      <div class="total-box">
        <div class="label">Прибыль</div>
        <div class="value ${totalProfit >= 0 ? "positive" : "negative"}">${fmt(totalProfit)} ₸</div>
      </div>
    </div>

    <div class="section-title">Детализация по партиям</div>
    <table>
      <thead>
        <tr>
          <th>Партия</th>
          <th>Голов</th>
          <th>Выручка (₸)</th>
          <th>Расходы (₸)</th>
          <th>Прибыль (₸)</th>
          <th>Привес кг</th>
          <th>Ср. привес</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>

    <div class="footer">
      <span>WestKaz Agro · ${today()}</span>
      <span>Финансовый отчёт</span>
    </div>
  </div>`;

  await htmlToPdf(
    html,
    `финансовый_отчёт_${today().replace(/\./g, "-")}.pdf`
  );
}
