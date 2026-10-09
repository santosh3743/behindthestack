type Sortable = { id: string; data: { layer: string; order: number } };

export function isVisible(status: string, showDrafts: boolean): boolean {
  return status === 'live' || showDrafts;
}

export function partNumber(layerN: string, order: number): string {
  return `${layerN}.${order}`;
}

export function sortLab<T extends Sortable>(xs: T[], layerIds: readonly string[]): T[] {
  return [...xs].sort(
    (a, b) => layerIds.indexOf(a.data.layer) - layerIds.indexOf(b.data.layer) || a.data.order - b.data.order,
  );
}

export function neighbors<T extends Sortable>(xs: T[], id: string): { prev?: T; next?: T } {
  const cur = xs.find((x) => x.id === id);
  if (!cur) return {};
  const same = xs.filter((x) => x.data.layer === cur.data.layer);
  const i = same.indexOf(cur);
  return { prev: same[i - 1], next: same[i + 1] };
}
