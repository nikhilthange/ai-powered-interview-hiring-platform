/**
 * Standard RFC5545 iCalendar (.ics) Generator
 */
export function generateIcsFile({
  title = 'AI Job Interview',
  description = 'HireMate Scheduled Interview Session',
  date,
  time,
  candidateName = 'Candidate',
  platform = 'Google Meet',
  meetingUrl = 'https://meet.google.com'
}) {
  const startDate = date ? new Date(`${date}T${time || '10:00'}:00`) : new Date(Date.now() + 86400000);
  const endDate = new Date(startDate.getTime() + 45 * 60000); // 45 minute default duration

  function formatDate(d) {
    return d.toISOString().replace(/-|:|\.\d+/g, '');
  }

  const icsData = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//HireMate AI SaaS//Interview Scheduler//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:interview-${Date.now()}@hiremate.ai`,
    `DTSTAMP:${formatDate(new Date())}`,
    `DTSTART:${formatDate(startDate)}`,
    `DTEND:${formatDate(endDate)}`,
    `SUMMARY:${title} with ${candidateName}`,
    `DESCRIPTION:${description}\\nPlatform: ${platform}\\nLink: ${meetingUrl}`,
    `LOCATION:${platform} - ${meetingUrl}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `Interview_${candidateName.replace(/\s+/g, '_')}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
