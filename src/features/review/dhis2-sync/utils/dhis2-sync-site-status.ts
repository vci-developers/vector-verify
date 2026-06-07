export type Dhis2SyncSiteStatus =
    | 'reviewPending'
    | 'ready'
    | 'queued'
    | 'running'
    | 'submitted'
    | 'failed'
    | 'timedOut'
    | 'skipped'
    | 'hasNewCertifiedData';
