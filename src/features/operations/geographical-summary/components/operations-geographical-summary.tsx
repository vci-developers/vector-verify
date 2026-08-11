'use client';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslations } from 'next-intl';
import { useGetPrograms } from '@/api/program/hooks/use-get-programs';
import DeviceView from '@/features/operations/geographical-summary/components/device-view';
import SpecimensView from '@/features/operations/geographical-summary/components/specimens-view';
import { CountryProvider } from '@/features/operations/geographical-summary/context/country-context';
import type { Site } from '@/api/site/validation/site-schema';
import { useOperationsFilters } from '@/features/operations/view-state/use-operations-filters';
import { useGeographicalView } from '@/features/operations/geographical-summary/view-state/use-geographical-view';
import {
    GEOGRAPHICAL_VIEWS,
    type GeographicalView,
} from '@/features/operations/geographical-summary/utils/geographical-summary-helpers';
import ErrorBanner from '@/components/ui/error-banner';

interface OperationsGeographicalSummaryProps {
    programId: number;
    siteIds: number[];
    descendantsOfSelectedLocations: Site[];
    startDate: string;
    endDate: string;
    selectedMarkerId: string | null;
    setSelectedMarkerId: (value: string | null) => void;
}

export default function OperationsGeographicalSummary({
    programId,
    siteIds,
    descendantsOfSelectedLocations,
    startDate,
    endDate,
    selectedMarkerId,
    setSelectedMarkerId,
}: OperationsGeographicalSummaryProps) {
    const {
        data: getProgramsResult,
        isPending: isProgramsPending,
        isError: isProgramsError,
    } = useGetPrograms();

    const country = getProgramsResult?.ok
        ? getProgramsResult.data.programs.find(
              program => program.programId === programId,
          )?.country
        : undefined;

    const t = useTranslations('OperationsGeographicalSummary');
    const [{ selectedLocations }] = useOperationsFilters();
    const [geographicalView, setGeographicalView] = useGeographicalView();

    const tabs = (
        <Tabs
            value={geographicalView}
            onValueChange={value =>
                setGeographicalView(value as GeographicalView)
            }
        >
            <TabsList className="bg-muted/50 rounded-full p-1">
                {GEOGRAPHICAL_VIEWS.map(view => (
                    <TabsTrigger
                        key={view}
                        value={view}
                        className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-4 py-2 text-sm font-medium"
                    >
                        {t(view)}
                    </TabsTrigger>
                ))}
            </TabsList>
        </Tabs>
    );

    if (isProgramsPending) {
        return (
            <div className="mt-4 space-y-3">
                {tabs}
                <Skeleton className="h-125 w-full rounded-md" />
            </div>
        );
    }

    if (isProgramsError || !country) {
        return (
            <div className="mt-4 space-y-3">
                {tabs}
                <ErrorBanner message={t('countryError')} />
                <Skeleton
                    className="h-125 w-full rounded-md"
                    variant="destructive"
                />
            </div>
        );
    }

    return (
        <div className="mt-4 space-y-3">
            {tabs}

            <CountryProvider value={country}>
                {geographicalView === 'devices' ? (
                    <DeviceView
                        programId={programId}
                        siteIds={siteIds}
                        selectedLocations={selectedLocations}
                        descendantsOfSelectedLocations={
                            descendantsOfSelectedLocations
                        }
                    />
                ) : (
                    <SpecimensView
                        siteIds={siteIds}
                        descendantsOfSelectedLocations={
                            descendantsOfSelectedLocations
                        }
                        startDate={startDate}
                        endDate={endDate}
                        selectedLocations={selectedLocations}
                        selectedMarkerId={selectedMarkerId}
                        setSelectedMarkerId={setSelectedMarkerId}
                    />
                )}
            </CountryProvider>
        </div>
    );
}
