import PageShell from '@/components/layout/page-shell';
import { LayoutDashboard } from 'lucide-react';

export default function DashboardPageClient() {
    return (
        <PageShell
            title="Dashboard"
            description="THIS IS TO TEST THAT PULL PREVIEW IS WORKING CORRECTLY."
            icon={LayoutDashboard}
        >
            <h1>Dashboard</h1>
        </PageShell>
    );
}
