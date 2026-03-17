import PageShell from '@/components/layout/page-shell';
import { LayoutDashboard } from 'lucide-react';

export default function DashboardPageClient() {
    return (
        <PageShell
            title="Dashboard"
            description="Welcome to VectorVerify! Use the navigation links to access different sections."
            icon={LayoutDashboard}
        >
            <h1>Dashboard</h1>
        </PageShell>
    );
}
