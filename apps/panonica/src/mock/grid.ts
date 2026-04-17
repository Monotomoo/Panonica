export const gridInfo = {
  nearestSubstation: 'TS Slavonski Brod 1',
  voltage: '110/35 kV',
  distanceKm: 18.4,
  regionalFreeCapacityMW: 2500,
  regionalUtilization: 0.23,
  queuePosition: 14,
  estProcessingMonths: [8, 14] as const,
  estCableCost: 620_000,
  connectionFeePerMW: 1_100_000,
  maxInstallMWp: 60,
  capacitySource: 'OIEH assessment, 2025',
};

export type GridInfo = typeof gridInfo;
