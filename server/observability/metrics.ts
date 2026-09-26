export interface ApplicationMetrics {
  uptimeSeconds: number;
  memoryUsageMb: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
  };
  processPid: number;
  nodeVersion: string;
}

export function collectApplicationMetrics(): ApplicationMetrics {
  const mem = process.memoryUsage();
  const bytesToMb = (bytes: number) => Math.round((bytes / 1024 / 1024) * 100) / 100;

  return {
    uptimeSeconds: Math.floor(process.uptime()),
    memoryUsageMb: {
      rss: bytesToMb(mem.rss),
      heapTotal: bytesToMb(mem.heapTotal),
      heapUsed: bytesToMb(mem.heapUsed),
    },
    processPid: process.pid,
    nodeVersion: process.version,
  };
}
