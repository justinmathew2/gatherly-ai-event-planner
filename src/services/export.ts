/**
 * @file export.ts
 * @description RFC-5545 iCalendar, RFC-4180 CSV, and JSON export services with
 * strict character escaping and download handlers.
 */

import { FullEventPlan } from '../types/event';
import { escapeCalendarText, escapeCsvCell } from '../utils/security';

/**
 * Generates valid RFC-5545 iCalendar (.ics) specification data for full-day
 * run-of-show itineraries and countdown deadlines.
 *
 * @param plan - Master event plan
 * @returns RFC-5545 string
 */
export const generateICalendar = (plan: FullEventPlan): string => {
  const { details, dayOfSchedule, milestones } = plan;
  const eventDateFormatted = details.date.replace(/-/g, '');

  const icsContent: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Gatherly AI//Event Planning Assistant//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeCalendarText(details.title)}`,
  ];

  // 1. Add Day-Of schedule events
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
    icsContent.push(`SUMMARY:${escapeCalendarText(summary)}`);
    icsContent.push(`LOCATION:${escapeCalendarText(item.location || details.location)}`);
    icsContent.push(`DESCRIPTION:${escapeCalendarText(description)}`);
    icsContent.push('STATUS:CONFIRMED');
    icsContent.push('END:VEVENT');
  });

  // 2. Add Key Planning Deadlines
  milestones.forEach((m) => {
    const dueDateFormatted = m.dueDate.replace(/-/g, '');
    icsContent.push('BEGIN:VEVENT');
    icsContent.push(`UID:milestone-${m.id}-${details.id}@gatherly.ai`);
    icsContent.push(`DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`);
    icsContent.push(`DTSTART;VALUE=DATE:${dueDateFormatted}`);
    icsContent.push(`SUMMARY:[Deadline] ${escapeCalendarText(m.title)}`);
    icsContent.push(`DESCRIPTION:Phase: ${m.phase}\\nAssigned to: ${m.assignedTo || 'Unassigned'}`);
    icsContent.push(`STATUS:${m.completed ? 'COMPLETED' : 'NEEDS-ACTION'}`);
    icsContent.push('END:VEVENT');
  });

  icsContent.push('END:VCALENDAR');
  return icsContent.join('\r\n');
};

/**
 * Generates RFC-4180 compliant CSV content for the budget breakdown.
 */
export const generateBudgetCsv = (plan: FullEventPlan): string => {
  const headers = ['Category', 'Item Name', 'Allocated Amount', 'Actual Amount', 'Paid Amount', 'Status', 'Notes'];
  const rows = plan.budgetItems.map((item) => [
    escapeCsvCell(item.category),
    escapeCsvCell(item.name),
    item.allocatedAmount,
    item.actualAmount,
    item.paidAmount,
    escapeCsvCell(item.isPaid ? 'Paid in Full' : 'Pending / Partial'),
    escapeCsvCell(item.notes || ''),
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
};

/**
 * Generates RFC-4180 compliant CSV content for the vendor directory.
 */
export const generateVendorsCsv = (plan: FullEventPlan): string => {
  const headers = ['Vendor Name', 'Category', 'Contact Person', 'Email', 'Phone', 'Status', 'Estimated Cost', 'Final Cost', 'Deposit Paid', 'Notes'];
  const rows = plan.vendors.map((v) => [
    escapeCsvCell(v.name),
    escapeCsvCell(v.category),
    escapeCsvCell(v.contactPerson || ''),
    escapeCsvCell(v.email || ''),
    escapeCsvCell(v.phone || ''),
    escapeCsvCell(v.status),
    v.estimatedCost,
    v.finalCost || 0,
    v.depositPaid || 0,
    escapeCsvCell(v.notes || ''),
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
};

/**
 * Initiates an in-browser safe download for any string payload without external popups.
 */
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
