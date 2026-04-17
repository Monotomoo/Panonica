export const beravciParcel = {
  owner: 'Paladina Investments',
  location: 'Beravci, Općina Velika Kopanica, Brodsko-posavska županija',
  coordinates: { lat: 45.2074, lng: 18.4393 },
  areaHa: 80.3,
  parcels: { building: 45, arable: 6 },
  currentZoning: 'Gospodarska zona (poduzetnička)',
  pendingSpatialPlan: 'UPU izmjene u tijeku',
  acquiredVia: 'IGH obveznica, javno nadmetanje',
  acquiredYear: 2019,
  estimatedValueEUR: 1_050_000,
  estimatedValueHRK: 7_568_152,
  cadastralNumbers: Array.from(
    { length: 51 },
    (_, i) => `${2841 + i}/${i < 45 ? 'g' : 'o'}`,
  ),
  elevationRangeM: [89, 97] as const,
  orientationDegrees: 182,
  soilClass: 'IV–V',
  waterTableM: -2.8,
  nearestSettlementKm: 0.3,
  nearestCityKm: 18,
  roadAccessKm: 2,
  nextMilestone: 'UPU public consultation · May 20, 2026',
};

export type BeravciParcel = typeof beravciParcel;
