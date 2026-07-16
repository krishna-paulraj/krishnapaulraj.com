/**
 * Largest-Triangle-Three-Buckets downsampling.
 *
 * Always keeps the first and last points. Interior points are partitioned into
 * `maxPoints - 2` buckets; from each bucket the point forming the largest
 * triangle with the previously selected point and the average of the *next*
 * bucket is kept. No point is ever emitted twice.
 */
export function decimateTimeSeries<T extends Record<string, unknown>>(
  data: T[],
  maxPoints: number,
  valueKeys: string[] = [],
): T[] {
  const len = data.length;
  if (maxPoints >= len || maxPoints < 3) {
    return data;
  }

  const getY = (point: T, index: number): number => {
    if (valueKeys.length === 0) {
      for (const val of Object.values(point)) {
        if (typeof val === "number") {
          return val;
        }
      }
      return index;
    }

    let sum = 0;
    let count = 0;
    for (const key of valueKeys) {
      const val = point[key];
      if (typeof val === "number") {
        sum += val;
        count++;
      }
    }
    return count > 0 ? sum / count : index;
  };

  const sampled: T[] = [data[0] as T];
  const bucketSize = (len - 2) / (maxPoints - 2);
  let previousIndex = 0;

  for (let i = 0; i < maxPoints - 2; i++) {
    // Current bucket: candidates for selection (indices 1 … len - 2 overall).
    const rangeStart = Math.floor(i * bucketSize) + 1;
    const rangeEnd = Math.min(Math.floor((i + 1) * bucketSize) + 1, len - 1);

    // Look-ahead window: the next bucket (the final iteration's window is the
    // last data point itself).
    const avgRangeStart = Math.min(
      Math.floor((i + 1) * bucketSize) + 1,
      len - 1,
    );
    const avgRangeEnd = Math.min(Math.floor((i + 2) * bucketSize) + 1, len);
    const avgCount = avgRangeEnd - avgRangeStart;

    let avgX = len - 1;
    let avgY = getY(data[len - 1] as T, len - 1);
    if (avgCount > 0) {
      avgX = 0;
      avgY = 0;
      for (let j = avgRangeStart; j < avgRangeEnd; j++) {
        avgX += j;
        avgY += getY(data[j] as T, j);
      }
      avgX /= avgCount;
      avgY /= avgCount;
    }

    const pointA = data[previousIndex] as T;
    const ax = previousIndex;
    const ay = getY(pointA, previousIndex);

    let maxArea = -1;
    let maxIndex = rangeStart;

    for (let j = rangeStart; j < rangeEnd; j++) {
      const area =
        Math.abs(
          (ax - avgX) * (getY(data[j] as T, j) - ay) - (ax - j) * (avgY - ay),
        ) * 0.5;
      if (area > maxArea) {
        maxArea = area;
        maxIndex = j;
      }
    }

    sampled.push(data[maxIndex] as T);
    previousIndex = maxIndex;
  }

  sampled.push(data[len - 1] as T);
  return sampled;
}

/** ~1.5 points per pixel — enough for crisp curves without over-drawing. */
export function maxRenderPointsForWidth(innerWidth: number): number {
  return Math.max(64, Math.ceil(innerWidth * 1.5));
}
