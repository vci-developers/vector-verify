import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table';
import { Button } from '@/shared/ui/button';
import { Pencil, Check, X } from 'lucide-react';
import type { SiteDiscrepancySummary } from '@/features/review/types';
import { useState, useCallback } from 'react';
import { useUpdateDiscrepanciesMutation } from '@/features/review/hooks/use-update-discrepancies';
import { mapDiscrepancyFields } from '@/features/review/utils/map-discrepancy-fields';
import { showSuccessToast } from '@/shared/ui/show-success-toast';
import { showErrorToast } from '@/shared/ui/show-error-toast';
import { FieldEditor } from './field-editor';
import {
  calculateDependentFields,
  shouldDisableField,
} from '@/features/review/utils/discrepancy-field-dependencies';

export function SiteDiscrepanciesCard({
  siteDiscrepancies,
}: {
  siteDiscrepancies: SiteDiscrepancySummary[];
}) {
  const [editingSiteId, setEditingSiteId] = useState<number | null>(null);
  const [editedValues, setEditedValues] = useState<Record<string, string>>({});
  const [customInputFields, setCustomInputFields] = useState<Record<string, boolean>>({});
  
  const updateDiscrepanciesMutation = useUpdateDiscrepanciesMutation({
    onSuccess: () => {
      showSuccessToast('Discrepancies resolved successfully.');
      setEditingSiteId(null);
      setEditedValues({});
    },
    onError: (error) => {
      showErrorToast(`Failed to resolve discrepancies: ${error.message}`);
    },
  });

  const handleEditClick = useCallback((siteId: number, fields: SiteDiscrepancySummary['fields']) => {
    setEditingSiteId(siteId);
    const initialValues: Record<string, string> = {};
    fields.forEach(field => {
      initialValues[field.key] = '';
    });
    setEditedValues(initialValues);
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditingSiteId(null);
    setEditedValues({});
    setCustomInputFields({});
  }, []);

  const handleValueChange = useCallback((
    fieldKey: string,
    value: string,
    allFields: SiteDiscrepancySummary['fields']
  ) => {
    setEditedValues(prev => ({
      ...prev,
      [fieldKey]: value,
    }));

    const dependentUpdates = calculateDependentFields(fieldKey, value, allFields);
    if (Object.keys(dependentUpdates).length > 0) {
      setEditedValues(prev => ({
        ...prev,
        ...dependentUpdates,
      }));
    }
  }, []);

  const handleFieldChange = useCallback((
    fieldKey: string,
    value: string,
    allFields: SiteDiscrepancySummary['fields']
  ) => {
    if (value === '__OTHER__') {
      setCustomInputFields(prev => ({
        ...prev,
        [fieldKey]: true,
      }));
      setEditedValues(prev => ({
        ...prev,
        [fieldKey]: '',
      }));
    } else {
      setCustomInputFields(prev => ({
        ...prev,
        [fieldKey]: false,
      }));

      handleValueChange(fieldKey, value, allFields);
    }
  }, [handleValueChange]);

  const handleCustomInputChange = useCallback((
    fieldKey: string,
    value: string,
    allFields: SiteDiscrepancySummary['fields']
  ) => {
    handleValueChange(fieldKey, value, allFields);
  }, [handleValueChange]);

  const handleBackToOptions = useCallback((fieldKey: string) => {
    setCustomInputFields(prev => ({
      ...prev,
      [fieldKey]: false,
    }));
    setEditedValues(prev => ({
      ...prev,
      [fieldKey]: '',
    }));
  }, []);

  const handleSubmit = useCallback(async (site: SiteDiscrepancySummary) => {
    const trimmedValues = Object.fromEntries(
      Object.entries(editedValues).map(([key, value]) => [key, value.trim()])
    );

    const allFieldsFilled = site.fields.every(
      field => trimmedValues[field.key]?.length > 0
    );

    if (!allFieldsFilled) {
      showErrorToast('Please select a value for all fields before submitting.');
      return;
    }

    const enhancedValues = { ...trimmedValues };

    if (enhancedValues.wasIrsConducted?.toLowerCase() === 'no') {
      enhancedValues.monthsSinceIrs = 'null';
    }

    if (enhancedValues.numLlinsAvailable === '0' || 
        enhancedValues.numLlinsAvailable?.toLowerCase() === 'zero') {
      enhancedValues.numPeopleSleptUnderLlin = 'null';
      enhancedValues.llinType = 'null';
      enhancedValues.llinBrand = 'null';
    }

    const { resolvedData, resolvedSurveillanceForm } = mapDiscrepancyFields(site.fields, enhancedValues);

    const payload = {
      sessionIds: site.sessionIds,
      resolvedData,
      resolvedSurveillanceForm,
    };

    await updateDiscrepanciesMutation.mutateAsync({ payload });
    setCustomInputFields({});
  }, [editedValues, updateDiscrepanciesMutation]);

  return (
    <Card className="shadow-lg border-amber-300 bg-amber-50/60">
      <CardHeader className="border-b border-amber-200/70 pb-6">
        <CardTitle className="flex flex-wrap items-center gap-2 text-amber-900">
          Site Discrepancies
          <Badge variant="secondary" className="bg-amber-200 text-amber-900">
            {siteDiscrepancies.length} site
            {siteDiscrepancies.length === 1 ? '' : 's'}
          </Badge>
        </CardTitle>
        <CardDescription>Conflicting session values by site.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5 py-6">
        {siteDiscrepancies.length === 0 ? (
          <div className="text-muted-foreground rounded-lg border border-dashed border-amber-200 bg-amber-100/40 px-5 py-10 text-center text-sm">
            No discrepancies detected for the selected period.
          </div>
        ) : (
          <div className="space-y-4">
            {siteDiscrepancies.map(site => (
              <div
                key={site.siteId}
                className="rounded-xl border border-amber-200/80 bg-white/80 p-5 shadow-sm"
              >
                <header className="space-y-1">
                  <p className="text-foreground text-base font-semibold">
                    {site.siteLabel.topLine}
                  </p>
                  {site.siteLabel.bottomLine && (
                    <p className="text-muted-foreground text-sm">
                      {site.siteLabel.bottomLine}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <Badge
                      variant="outline"
                      className="border-amber-300 text-amber-900"
                    >
                      {site.sessionCount}{' '}
                      session{site.sessionCount === 1 ? '' : 's'}
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="bg-amber-200 text-amber-900"
                    >
                      {site.fields.length} field
                      {site.fields.length === 1 ? '' : 's'}
                    </Badge>
                  </div>
                </header>

                <div className="mt-4 overflow-hidden rounded-lg border border-amber-200 bg-amber-100/40">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-amber-100/60">
                        <TableHead className="w-[180px] text-amber-900">
                          Field
                        </TableHead>
                        <TableHead className="text-amber-900">
                          Conflicting Values Recorded
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {site.fields.map(field => (
                        <TableRow
                          key={`${site.siteId}-${field.key}`}
                          className="hover:bg-amber-100/60"
                        >
                          <TableCell className="text-sm font-medium text-amber-900">
                            {field.label}
                          </TableCell>
                          <TableCell className="text-sm text-foreground">
                            {editingSiteId === site.siteId ? (
                              <FieldEditor
                                field={field}
                                value={editedValues[field.key] || ''}
                                isCustomInput={customInputFields[field.key] || false}
                                isDisabled={shouldDisableField(field.key, editedValues)}
                                isPending={updateDiscrepanciesMutation.isPending}
                                onSelectChange={(value) => handleFieldChange(field.key, value, site.fields)}
                                onCustomInputChange={(value) => handleCustomInputChange(field.key, value, site.fields)}
                                onBackToOptions={() => handleBackToOptions(field.key)}
                              />
                            ) : (
                              field.details
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  {editingSiteId === site.siteId ? (
                    <>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleCancelEdit}
                        disabled={updateDiscrepanciesMutation.isPending}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => handleSubmit(site)}
                        disabled={updateDiscrepanciesMutation.isPending}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Check className="h-4 w-4 mr-1" />
                        {updateDiscrepanciesMutation.isPending ? 'Submitting...' : 'Submit'}
                      </Button>
                    </>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditClick(site.siteId, site.fields)}
                    >
                      <Pencil className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
