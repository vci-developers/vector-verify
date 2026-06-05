export type Dhis2SyncStatus =
    | 'ready'
    | 'queued'
    | 'running'
    | 'submitted'
    | 'failed'
    | 'timedOut'
    | 'hasNewCertifiedData';