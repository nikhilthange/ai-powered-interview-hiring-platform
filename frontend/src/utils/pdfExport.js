/**
 * Utility for exporting HTML content / documents to printable PDF format.
 */
export function exportToPdf({ title = 'Document', content, filename = 'document.pdf' }) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to export PDF documents.');
    return;
  }

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            margin: 40px;
            color: #1e293b;
            line-height: 1.6;
          }
          h1, h2, h3 { color: #0f172a; margin-top: 24px; margin-bottom: 12px; }
          h1 { font-size: 24px; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; }
          h2 { font-size: 18px; color: #4f46e5; }
          .badge {
            display: inline-block;
            padding: 4px 8px;
            background: #e0e7ff;
            color: #3730a3;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
            margin-right: 6px;
            margin-bottom: 6px;
          }
          .card {
            border: 1px solid #cbd5e1;
            border-radius: 8px;
            padding: 16px;
            margin-bottom: 16px;
            background: #f8fafc;
          }
          .bullet-diff {
            margin-bottom: 12px;
            padding: 12px;
            border-left: 4px solid #10b981;
            background: #f0fdf4;
          }
          @media print {
            body { margin: 0; }
          }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        <div>${content}</div>
        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() { window.close(); }, 500);
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}

export function exportTailoredResumePdf(result) {
  if (!result) return;
  const content = `
    <div class="card">
      <h2>Original vs. Tailored ATS Score</h2>
      <p><strong>Original ATS Score:</strong> ${result.atsScoreBefore}%</p>
      <p><strong>Tailored ATS Score:</strong> <span style="color: #10b981; font-weight: bold;">${result.atsScoreAfter}%</span></p>
    </div>

    <h2>Tailored Professional Summary</h2>
    <div class="card">
      <p>${result.summaryAfter || result.summaryBefore}</p>
    </div>

    <h2>Added ATS Keywords</h2>
    <div>
      ${(result.addedKeywords || []).map(k => `<span class="badge">✓ ${k}</span>`).join('')}
    </div>

    <h2>Experience Bullet Point Improvements</h2>
    <div>
      ${(result.bulletImprovements || []).map(b => `
        <div class="bullet-diff">
          <p style="color: #ef4444; font-size: 13px; margin: 0 0 4px 0;">Before: ${b.before}</p>
          <p style="color: #065f46; font-weight: bold; margin: 0;">After: ${b.after}</p>
        </div>
      `).join('')}
    </div>
  `;

  exportToPdf({
    title: 'HireMate AI — Tailored Resume Summary',
    content,
    filename: 'Tailored_Resume.pdf'
  });
}

export function exportInterviewReportPdf({ overallScore, metrics = [], strengths = [], weaknesses = [], suggestions = [] }) {
  const content = `
    <div class="card" style="text-align: center;">
      <h2 style="margin: 0;">Overall Performance Score</h2>
      <div style="font-size: 48px; font-weight: 800; color: #4f46e5; margin: 12px 0;">${overallScore} / 100</div>
      <p style="margin: 0; color: #64748b;">Evaluated by HireMate AI Evaluation Engine</p>
    </div>

    <h2>Metric Breakdown</h2>
    <div class="card">
      ${metrics.map(m => `
        <div style="margin-bottom: 8px;">
          <strong style="display: inline-block; width: 200px;">${m.name}:</strong>
          <span style="font-weight: bold; color: #4f46e5;">${m.value}%</span>
        </div>
      `).join('')}
    </div>

    <h2>Key Strengths</h2>
    <ul>
      ${strengths.map(s => `<li>${s}</li>`).join('')}
    </ul>

    <h2>Growth Opportunities & Suggestions</h2>
    <ul>
      ${weaknesses.concat(suggestions).map(w => `<li>${w}</li>`).join('')}
    </ul>
  `;

  exportToPdf({
    title: 'HireMate AI — Interview Feedback Report',
    content,
    filename: 'Interview_Feedback_Report.pdf'
  });
}
