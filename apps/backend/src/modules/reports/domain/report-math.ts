import type { ReportBucket } from './reports.port';

export function percentOf(part: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((Math.max(0, part) / total) * 100);
}

export function withShare(
  buckets: ReportBucket[],
  total: number,
): Array<ReportBucket & { share: number }> {
  return buckets.map((bucket) => ({
    ...bucket,
    share: percentOf(bucket.count, total),
  }));
}
