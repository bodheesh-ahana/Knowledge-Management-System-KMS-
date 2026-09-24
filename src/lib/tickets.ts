// Ticket-number helpers shared by the tracker views and the dashboard so both
// count tickets the same way.
//
// Older tracker rows store the sub-task reference inline in the ticket number,
// e.g. "219772(#2512)". The parent ticket is what identifies a unique ticket;
// the "(#nnnn)" part is a sub-task of it.

export const parentTicketId = (ticketId?: string) =>
  (ticketId || '').replace(/\(\s*#\s*\d+\s*\)/g, '').trim();

export const inlineTaskRefs = (ticketId?: string) =>
  Array.from((ticketId || '').matchAll(/\(\s*#\s*(\d+)\s*\)/g), (m) => m[1]);

export const taskRefOf = (entry: { taskId?: string; ticketId?: string }) =>
  entry.taskId || inlineTaskRefs(entry.ticketId)[0] || '';

/** Ticket statuses that mean no further work is expected. */
export const CLOSED_STATUSES = ['Resolved', 'Closed', 'Cancelled'];

export const isClosedStatus = (status?: string) =>
  Boolean(status && CLOSED_STATUSES.includes(status));

// The tracker and the knowledge base were populated from different sources, so
// the same application shows up under a few spellings.
const APP_ALIASES: Record<string, string> = {
  qb: 'QuickBooks',
  'quick book': 'QuickBooks',
  'quick books': 'QuickBooks',
  quickbook: 'QuickBooks',
  quickbooks: 'QuickBooks',
  ultratax: 'Ultratax',
  'cch axcess': 'CCH Axcess',
  cch: 'CCH Axcess',
};

export const normalizeAppName = (name?: string | null) => {
  const trimmed = (name || '').trim();
  if (!trimmed || trimmed.toLowerCase() === 'unknown') return 'Unspecified';
  return APP_ALIASES[trimmed.toLowerCase()] || trimmed;
};
