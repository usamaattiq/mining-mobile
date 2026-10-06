/** Resolves a stored listing label back to a select option value. */
export function matchSelectOption(
  options: { value: string; label: string }[],
  stored: string | null | undefined,
): string | null {
  if (!stored?.trim()) return null;
  const needle = stored.trim().toLowerCase();
  const match = options.find(
    (option) => option.value.toLowerCase() === needle || option.label.toLowerCase() === needle,
  );
  return match?.value ?? (options.some((option) => option.value === 'other') ? 'other' : null);
}

/** Copy listing media for a new post without reusing database ids. */
export function cloneRepostMedia<T extends { id: string }>(items: T[]): T[] {
  const stamp = Date.now();
  return items.map((item, index) => ({
    ...item,
    id: `repost-${stamp}-${index}`,
  }));
}
