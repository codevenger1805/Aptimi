export function reindexOrders<T extends { order: number }>(items: T[]): T[] {
  return items.map((item, index) => ({
    ...item,
    order: index,
  }));
}

export function insertAt<T extends { order: number }>(
  items: T[],
  newItem: T,
  atIndex: number,
): T[] {
  const sorted = [...items].sort((a, b) => a.order - b.order);

  const index = Math.max(0, Math.min(atIndex, sorted.length));

  sorted.splice(index, 0, newItem);

  return sorted.map((item, index) => ({
    ...item,
    order: index,
  }));
}

export function moveItem<T extends { id: string; order: number }>(
  items: T[],
  id: string,
  direction: -1 | 1,
): T[] {
  const sorted = [...items].sort((a, b) => a.order - b.order);

  const currentIndex = sorted.findIndex((item) => item.id === id);

  if (currentIndex === -1) {
    return sorted.map((item, index) => ({
      ...item,
      order: index,
    }));
  }

  const targetIndex = currentIndex + direction;

  if (targetIndex < 0 || targetIndex >= sorted.length) {
    return sorted.map((item, index) => ({
      ...item,
      order: index,
    }));
  }

  [sorted[currentIndex], sorted[targetIndex]] = [
    sorted[targetIndex],
    sorted[currentIndex],
  ];

  return sorted.map((item, index) => ({
    ...item,
    order: index,
  }));
}