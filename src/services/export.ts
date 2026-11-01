import { FullEventPlan } from '../types/event';

// Generate iCalendar format (.ics) for Google Calendar, Apple Calendar, Outlook
export const generateICalendar = (plan: FullEventPlan): string => {
  const { details, dayOfSchedule, milestones } = plan;
  const eventDateFormatted = details.date.replace(/-/g, '');

  let icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Gatherly AI//Event Planning Assistant//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${details.title}`,
  ];

  // Add Day-Of schedule events
  dayOfSchedule.forEach((item) => {
    const timeParts = item.time.split(':');
    const startHour = timeParts[0] ? timeParts[0].padStart(2, '0') : '10';
    const startMin = timeParts[1] ? timeParts[1].padStart(2, '0') : '00';
    
    let endHour = String(Number(startHour) + 1).padStart(2, '0');
    let endMin = startMin;
    if (item.endTime) {
      const endParts = item.endTime.split(':');
      endHour = endParts[0] ? endParts[0].padStart(2, '0') : endHour;
      endMin = endParts[1] ? endParts[1].padStart(2, '0') : endMin;
    }

    const dtStart = `${eventDateFormatted}T${startHour}${startMin}00`;
    const dtEnd = `${eventDateFormatted}T${endHour}${endMin}00`;
    const summary = `${item.activity} - ${details.title}`;
    const description = `Location: ${item.location}\\nPeople: ${item.keyPeople.join(', ')}\\nNotes: ${item.notes || 'None'}`;

    icsContent.push('BEGIN:VEVENT');
    icsContent.push(`UID:${item.id}-${details.id}@gatherly.ai`);
    icsContent.push(`DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`);
    icsContent.push(`DTSTART:${dtStart}`);
    icsContent.push(`DTEND:${dtEnd}`);
    icsContent.push(`SUMMARY:${escapeIcs(summary)}`);
    icsContent.push(`LOCATION:${escapeIcs(item.location || details.location)}`);
    icsContent.push(`DESCRIPTION:${escapeIcs(description)}`);
    icsContent.push('STATUS:CONFIRMED');
    icsContent.push('END:VEVENT');
  });

  // Add key milestone deadlines
  milestones.forEach((m) => {
    const dueDateFormatted = m.dueDate.replace(/-/g, '');
    icsContent.push('BEGIN:VEVENT');
    icsContent.push(`UID:milestone-${m.id}-${details.id}@gatherly.ai`);
    icsContent.push(`DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`);
    icsContent.push(`DTSTART;VALUE=DATE:${dueDateFormatted}`);
    icsContent.push(`SUMMARY:[Deadline] ${escapeIcs(m.title)}`);
    icsContent.push(`DESCRIPTION:Phase: ${m.phase}\\nAssigned to: ${m.assignedTo || 'Unassigned'}`);
    icsContent.push(`STATUS:${m.completed ? 'COMPLETED' : 'NEEDS-ACTION'}`);
    icsContent.push('END:VEVENT');
  });

  icsContent.push('END:VCALENDAR');
  return icsContent.join('\r\n');
};

const escapeIcs = (str: string): string => {
  return str.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,');
};

// Export Budget to CSV
export const generateBudgetCsv = (plan: FullEventPlan): string => {
  const headers = ['Category', 'Item Name', 'Allocated Amount', 'Actual Amount', 'Paid Amount', 'Status', 'Notes'];
  const rows = plan.budgetItems.map((item) => [
    `"${item.category}"`,
    `"${item.name.replace(/"/g, '""')}"`,
    item.allocatedAmount,
    item.actualAmount,
    item.paidAmount,
    item.isPaid ? '"Paid in Full"' : '"Pending / Partial"',
    `"${(item.notes || '').replace(/"/g, '""')}"`,
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
};

// Export Vendors to CSV
export const generateVendorsCsv = (plan: FullEventPlan): string => {
  const headers = ['Vendor Name', 'Category', 'Contact Person', 'Email', 'Phone', 'Status', 'Estimated Cost', 'Final Cost', 'Deposit Paid', 'Notes'];
  const rows = plan.vendors.map((v) => [
    `"${v.name.replace(/"/g, '""')}"`,
    `"${v.category}"`,
    `"${(v.contactPerson || '').replace(/"/g, '""')}"`,
    `"${(v.email || '').replace(/"/g, '""')}"`,
    `"${(v.phone || '').replace(/"/g, '""')}"`,
    `"${v.status}"`,
    v.estimatedCost,
    v.finalCost || 0,
    v.depositPaid || 0,
    `"${(v.notes || '').replace(/"/g, '""')}"`,
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
};

// Trigger browser download for any string payload
export const downloadFile = (content: string, filename: string, mimeType: string): void => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

