/**
 * Returns a Date uniformly distributed in [now - monthsBack months, now].
 */
export function randomDateWithinMonths(
  monthsBack: number,
  now: Date = new Date(),
): Date {
  const end = now.getTime();
  const startDate = new Date(now);
  startDate.setMonth(startDate.getMonth() - monthsBack);
  const start = startDate.getTime();
  const ts = start + Math.random() * (end - start);
  return new Date(ts);
}
