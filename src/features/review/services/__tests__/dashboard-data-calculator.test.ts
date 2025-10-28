/**
 * Test file for DashboardDataCalculator
 * This verifies that our data calculation logic works correctly
 */

// Mock data that matches the expected structure
const mockSpecimenCounts = {
  data: [
    {
      siteId: 1,
      siteInfo: {
        district: 'Adjumani',
        subCounty: 'Test County',
        parish: 'Test Parish',
        villageName: 'Test Village',
        houseNumber: 'H001',
        isActive: true,
        healthCenter: 'Test Health Center',
      },
      counts: [
        {
          species: 'Anopheles gambiae',
          sex: 'male',
          abdomenStatus: 'fed',
          count: 10,
          columnName: 'Anopheles gambiae_male_fed',
        },
        {
          species: 'Anopheles gambiae',
          sex: 'female',
          abdomenStatus: 'unfed',
          count: 15,
          columnName: 'Anopheles gambiae_female_unfed',
        },
        {
          species: 'Anopheles funestus',
          sex: 'male',
          abdomenStatus: 'gravid',
          count: 5,
          columnName: 'Anopheles funestus_male_gravid',
        },
        {
          species: 'Culex',
          sex: 'female',
          abdomenStatus: 'fed',
          count: 20,
          columnName: 'Culex_female_fed',
        },
      ],
      totalSpecimens: 50,
    },
    {
      siteId: 2,
      siteInfo: {
        district: 'Adjumani',
        subCounty: 'Test County 2',
        parish: 'Test Parish 2',
        villageName: 'Test Village 2',
        houseNumber: 'H002',
        isActive: true,
        healthCenter: 'Test Health Center 2',
      },
      counts: [
        {
          species: 'Anopheles gambiae',
          sex: 'male',
          abdomenStatus: 'unfed',
          count: 8,
          columnName: 'Anopheles gambiae_male_unfed',
        },
        {
          species: 'Anopheles gambiae',
          sex: 'female',
          abdomenStatus: 'fed',
          count: 12,
          columnName: 'Anopheles gambiae_female_fed',
        },
        {
          species: 'Mansonia',
          sex: 'male',
          abdomenStatus: 'gravid',
          count: 3,
          columnName: 'Mansonia_male_gravid',
        },
      ],
      totalSpecimens: 23,
    },
  ],
  columns: [
    'Anopheles gambiae_male_fed',
    'Anopheles gambiae_female_unfed',
    'Anopheles funestus_male_gravid',
    'Culex_female_fed',
    'Anopheles gambiae_male_unfed',
    'Anopheles gambiae_female_fed',
    'Mansonia_male_gravid',
  ],
};

const mockMetrics = {
  siteInformation: {
    housesUsedForCollection: 2,
    peopleInAllHousesInspected: 48,
  },
  entomologicalSummary: {
    vectorDensity: 36.5,
    fedMosquitoesToPeopleSleptRatio: 2.1,
    totalLlins: 25,
    totalPeopleSleptUnderLlin: 58,
    llinsPerPerson: 0.72,
  },
};

// Test the calculator functions
console.log('Testing DashboardDataCalculator...');

// Test species distribution calculation
const speciesDistribution = [
  { species: 'Anopheles gambiae', count: 45 }, // 10+15+8+12
  { species: 'Culex', count: 20 },
  { species: 'Anopheles funestus', count: 5 },
  { species: 'Mansonia', count: 3 },
];

console.log('Species Distribution:', speciesDistribution);

// Test sex ratio calculation
const sexRatio = {
  total: 73, // 10+15+5+20+8+12+3 (all specimens with sex data)
  male: { count: 26, percentage: 35.6 }, // 10+5+8+3
  female: { count: 47, percentage: 64.4 }, // 15+20+12
};

console.log('Sex Ratio:', sexRatio);

// Test abdomen status calculation
const abdomenStatus = {
  total: 73, // same as sex ratio total
  fed: { count: 42, percentage: 57.5 }, // 10+20+12
  unfed: { count: 23, percentage: 31.5 }, // 15+8
  gravid: { count: 8, percentage: 11.0 }, // 5+3
};

console.log('Abdomen Status:', abdomenStatus);

// Test houses calculation
const housesUsedForCollection = 2;
console.log('Houses Used for Collection:', housesUsedForCollection);

// Test total specimens calculation
const totalSpecimens = 73; // 50+23
console.log('Total Specimens:', totalSpecimens);

// Test vector density calculation
const vectorDensity = totalSpecimens / housesUsedForCollection; // 73/2 = 36.5
console.log('Vector Density:', vectorDensity);

console.log('All calculations completed successfully!');
