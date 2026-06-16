import { redirect } from 'next/navigation';
// import DashboardPageClient from '@/features/dashboard/components/dashboard-page-client';

export default function DashboardPage() {
    redirect('/operations');
    // return <DashboardPageClient />;
}
