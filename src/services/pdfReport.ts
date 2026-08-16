import { File, Paths } from "expo-file-system";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

import {
  getAnalyticsSnapshotAsync,
  getSettingsSnapshot,
  listTransactionsAsync,
  type TransactionListItem,
} from "@/db";
import { formatMoney, formatShortDateTime } from "@/utils/format";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function buildRows(items: TransactionListItem[], currencySymbol: string) {
  return items
    .map((item) => {
      const amount = `${item.type === "EXPENSE" ? "-" : "+"}${formatMoney(
        item.amount,
        currencySymbol,
      )}`;

      return `
        <tr>
          <td>${escapeHtml(formatShortDateTime(item.createdAt))}</td>
          <td>${escapeHtml(item.categoryName ?? "Uncategorized")}</td>
          <td>${escapeHtml(item.type)}</td>
          <td>${escapeHtml(item.note.trim() || "No note")}</td>
          <td>${escapeHtml(amount)}</td>
        </tr>
      `;
    })
    .join("");
}

function buildBreakdownRows(
  breakdown: Awaited<ReturnType<typeof getAnalyticsSnapshotAsync>>["breakdown"],
) {
  return breakdown
    .map((item) => {
      return `
        <tr>
          <td>${escapeHtml(item.categoryName)}</td>
          <td>${escapeHtml(formatMoney(item.totalAmount, item.currencySymbol))}</td>
          <td>${escapeHtml(`${item.sharePercent.toFixed(0)}%`)}</td>
        </tr>
      `;
    })
    .join("");
}

function buildReportHtml({
  currencySymbol,
  generatedAt,
  transactions,
  analytics,
}: {
  currencySymbol: string;
  generatedAt: string;
  transactions: TransactionListItem[];
  analytics: Awaited<ReturnType<typeof getAnalyticsSnapshotAsync>>;
}) {
  return `
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 24px;
            color: #1A237E;
          }
          h1, h2, h3 {
            margin: 0 0 12px 0;
          }
          .hero {
            background: linear-gradient(180deg, #FFFDE7 0%, #FFF59D 100%);
            border-radius: 20px;
            padding: 24px;
            margin-bottom: 20px;
          }
          .muted {
            color: #5C6E9F;
            margin-bottom: 12px;
          }
          .grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
            margin-bottom: 20px;
          }
          .card {
            background: #FFFBEA;
            border-radius: 16px;
            padding: 16px;
          }
          .label {
            font-size: 12px;
            color: #5C6E9F;
            text-transform: uppercase;
            letter-spacing: 0.4px;
          }
          .value {
            margin-top: 8px;
            font-size: 24px;
            font-weight: 700;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
          }
          th, td {
            border: 1px solid #D8D8D8;
            padding: 10px;
            text-align: left;
            font-size: 12px;
            vertical-align: top;
          }
          th {
            background: #FFF9CC;
          }
          .section {
            margin-top: 24px;
          }
        </style>
      </head>
      <body>
        <div class="hero">
          <h1>SpendWise PDF Report</h1>
          <div class="muted">Local | Private | Simple Budgeting</div>
          <div>Generated at ${escapeHtml(generatedAt)}</div>
        </div>

        <div class="grid">
          <div class="card">
            <div class="label">Net Balance</div>
            <div class="value">${escapeHtml(
              formatMoney(analytics.monthlyNetBalance, currencySymbol),
            )}</div>
          </div>
          <div class="card">
            <div class="label">Spent This Month</div>
            <div class="value">${escapeHtml(
              formatMoney(analytics.monthlySpent, currencySymbol),
            )}</div>
          </div>
          <div class="card">
            <div class="label">Earned This Month</div>
            <div class="value">${escapeHtml(
              formatMoney(analytics.monthlyEarned, currencySymbol),
            )}</div>
          </div>
          <div class="card">
            <div class="label">Transactions</div>
            <div class="value">${transactions.length}</div>
          </div>
        </div>

        <div class="section">
          <h2>Category Breakdown</h2>
          <table>
            <thead>
              <tr>
                <th>Category</th>
                <th>Total</th>
                <th>Share</th>
              </tr>
            </thead>
            <tbody>
              ${buildBreakdownRows(analytics.breakdown)}
            </tbody>
          </table>
        </div>

        <div class="section">
          <h2>Expense and Income Logs</h2>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Type</th>
                <th>Note</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              ${buildRows(transactions, currencySymbol)}
            </tbody>
          </table>
        </div>
      </body>
    </html>
  `;
}

export async function exportPdfReportAsync() {
  const [settings, analytics, transactions] = await Promise.all([
    getSettingsSnapshot(),
    getAnalyticsSnapshotAsync(),
    listTransactionsAsync({ typeFilter: "ALL", periodFilter: "ALL_TIME" }),
  ]);

  const html = buildReportHtml({
    currencySymbol: settings.currencySymbol,
    generatedAt: new Date().toLocaleString(),
    transactions,
    analytics,
  });

  const result = await Print.printToFileAsync({
    html,
    base64: false,
  });

  const file = new File(result.uri);
  const persistentCopy = new File(Paths.document, `spendwise-report-${Date.now()}.pdf`);
  persistentCopy.create({ overwrite: true, intermediates: true });
  persistentCopy.write(await file.bytes());

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(persistentCopy.uri, {
      mimeType: "application/pdf",
      dialogTitle: "Share SpendWise PDF report",
    });
  }

  return persistentCopy.uri;
}
