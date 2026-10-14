/** Small text helpers shared by components. */

/** "Relson Gracie" -> { first: "Relson", last: "Gracie" }; "Aryan" -> { first: "Aryan", last: "" }. */
export function splitName(name: string): { first: string; last: string } {
  const parts = name.trim().split(/\s+/);
  if (parts.length < 2) return { first: name.trim(), last: '' };
  return { first: parts.slice(0, -1).join(' '), last: parts[parts.length - 1] ?? '' };
}

/** 1 -> "01", 12 -> "12". The mono index numbers on cards. */
export function padIndex(n: number): string {
  return String(n).padStart(2, '0');
}

/** "(843) 377-5361" -> "+18433775361". */
export function telHref(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  const withCountry = digits.length === 10 ? '1' + digits : digits;
  return 'tel:+' + withCountry;
}

/** "Owner · Instructor" -> "Owner". Used by the compact coach card. */
export function firstRole(role: string): string {
  return role.split('·')[0]?.trim() ?? role;
}

/** True when a value is one of the bracketed placeholders from the content brief, e.g. "[Belt rank]". */
export function isPlaceholder(value: string | undefined | null): boolean {
  return !!value && /^\[.*\]$/.test(value.trim());
}
