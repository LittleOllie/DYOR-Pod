/** Deterministic pseudo-random values from entity id + salt. */

export function seededUnit(seed: number, salt = 0): number {
  const x = Math.sin(seed * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

export function seededRange(seed: number, min: number, max: number, salt = 0): number {
  return min + seededUnit(seed, salt) * (max - min);
}

export function seededInt(seed: number, min: number, max: number, salt = 0): number {
  return Math.floor(seededRange(seed, min, max + 1, salt));
}

export function seededPick<T>(seed: number, items: readonly T[], salt = 0): T {
  return items[seededInt(seed, 0, items.length - 1, salt)]!;
}
