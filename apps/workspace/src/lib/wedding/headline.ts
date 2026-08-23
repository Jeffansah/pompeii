import { differenceInCalendarDays, isValid, parse, startOfDay } from "date-fns";

export function displayCoupleNames(coupleA: string, coupleB: string) {
  return `${coupleA.trim()} & ${coupleB.trim()}`;
}

export function daysToGo(dateValue: string, now = new Date()) {
  const weddingDay = parse(dateValue, "yyyy-MM-dd", now);
  if (!isValid(weddingDay)) {
    return null;
  }
  return differenceInCalendarDays(weddingDay, startOfDay(now));
}

export function daysToGoLabel(days: number) {
  return days === 1 ? "day to go" : "days to go";
}

export function dayGreeting(now = new Date()) {
  const hour = now.getHours();
  if (hour < 12) {
    return "Good morning";
  }
  if (hour < 17) {
    return "Good afternoon";
  }
  return "Good evening";
}
