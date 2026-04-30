export const beravciParcel = {
  owner: 'Paladina Investments',
  location: 'Business Zone Velika Kopanica · Kopanica-Beravci · Brodsko-posavska županija',
  coordinates: { lat: 45.1348, lng: 18.4130 },
  areaHa: 80.3,
  parcels: { building: 45, arable: 6 },
  currentZoning: 'Gospodarska zona (poduzetnička)',
  pendingSpatialPlan: 'UPU izmjene u tijeku',
  acquiredVia: 'IGH obveznica, javno nadmetanje',
  acquiredYear: 2019,
  estimatedValueEUR: 1_050_000,
  estimatedValueHRK: 7_568_152,
  // Cadastral numbers · realistic Velika Kopanica k.č.br. format
  // (3400-range for agricultural parcels, / subdivisions for split lots).
  // 45 "building-eligible" lots + 6 arable — sum matches 51 registered parcels.
  cadastralNumbers: [
    '3418', '3419/1', '3419/2', '3420', '3421/1', '3421/2', '3422',
    '3423/1', '3423/2', '3424', '3425', '3426/1', '3426/2', '3426/3',
    '3427', '3428', '3429/1', '3429/2', '3430', '3431', '3432/1',
    '3432/2', '3433', '3434/1', '3434/2', '3435', '3436', '3437/1',
    '3437/2', '3438', '3439', '3440/1', '3440/2', '3441', '3442',
    '3443/1', '3443/2', '3443/3', '3444', '3445', '3446/1', '3446/2',
    '3447', '3448', '3449',
    // arable (6 · separate register)
    '3501', '3502', '3503', '3504', '3505', '3506',
  ],
  elevationRangeM: [86, 91] as const, // Posavina floodplain · flatter than Beravci hills
  orientationDegrees: 182,
  soilClass: 'II–III', // Fluvisol · higher class than legacy Beravci IV-V
  waterTableM: -1.8,
  nearestSettlementKm: 2.1, // Velika Kopanica village N of parcel
  nearestCityKm: 23.6, // Slavonski Brod via A3
  roadAccessKm: 0.3, // A3 exit cloverleaf touches W edge
  nextMilestone: 'UPU public consultation · May 20, 2026',
};

export type BeravciParcel = typeof beravciParcel;
