import { ArrowLeft } from 'lucide-react';
import type { MetaRecord } from 'nextra';

const meta: MetaRecord = {
    dashboard_app: {
        title: (
            <span
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
                <ArrowLeft size={16} />
                VectorVerify Dashboard
            </span>
        ),
        href: '/',
    },
    index: 'Introduction',
    'getting-started': 'Getting Started',
    'user-roles': {
        title: 'User Roles',
        display: 'hidden',
    },
    dashboard: 'Dashboard',
    review: 'Review',
    annotation: 'Annotation',
    operations: 'Operations',
    'developer-reference': {
        title: 'Developer Reference',
        display: 'hidden',
    },
};

export default meta;
