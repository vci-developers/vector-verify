export const StorageKeys = {
    auth: {
        emailSentTimestamp: 'auth.lastSent',
    },
    review: {
        activeTab: 'review.activeTab',
        startMonth: 'review.startMonth',
        endMonth: 'review.endMonth',
        selectedLocation: 'review.selectedLocation',
        expandedSitePaths: 'review.expandedSitePaths',
        collapsedSegments: 'review.collapsedSegments',
    },
    operations: {
        activeTab: 'operations.activeTab',
        startMonth: 'operations.startMonth',
        endMonth: 'operations.endMonth',
        selectedLocations: 'operations.selectedLocations',
        selectedMarkerId: 'operations.selectedMarkerId',
        selectedSpecies: 'operations.selectedSpecies',
        geographicalView: 'operations.geographicalView',
    },
} as const;
