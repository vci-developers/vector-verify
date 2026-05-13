import PageShell from '@/components/layout/page-shell';
import { LayoutDashboard } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPageClient() {
    return (
        <PageShell
            title="Dashboard"
            description="Welcome to VectorVerify! Use the navigation links to access different sections."
            icon={LayoutDashboard}
        >
            <p>
                Dashboard under construction. <br></br>To see your data, go to{' '}
                <Link href="/operations" className="underline">
                    Operations
                </Link>
                .
            </p>
        </PageShell>
    );
}
