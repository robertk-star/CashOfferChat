export function slugifySiteId(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/https?:\/\//g, "")
    .replace(/^www\./, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export function normalizeDomainInput(input: string) {
  return input
    .split(/\r?\n|,/)
    .map((item) => item.trim().replace(/^https?:\/\//, "").replace(/\/.*$/, ""))
    .filter(Boolean)
    .join("\n");
}

export function parseLines(input: string) {
  return input
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}
