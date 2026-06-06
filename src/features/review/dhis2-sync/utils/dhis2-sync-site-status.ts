export type Dhis2SyncSiteStatus =
    | 'ready'
    | 'queued'
    | 'running'
    | 'submitted'
    | 'failed'
    | 'timedOut'
    | 'hasNewCertifiedData';
