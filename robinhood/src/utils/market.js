export function getMarketStatus() {
  const now = new Date();
  const day = now.getDay(); // 0 = Sun, 6 = Sat
  if (day === 0 || day === 6) return { open: false, label: 'Market Closed' };

  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/New_York',
      hour: 'numeric',
      minute: 'numeric',
      hour12: false,
    }).formatToParts(now);

    const hour   = parseInt(parts.find(p => p.type === 'hour').value);
    const minute = parseInt(parts.find(p => p.type === 'minute').value);
    const time   = hour * 60 + minute;
    const isOpen = time >= 9 * 60 + 30 && time < 16 * 60;
    return { open: isOpen, label: isOpen ? 'Market Open' : 'Market Closed' };
  } catch {
    return { open: false, label: 'Market Closed' };
  }
}
