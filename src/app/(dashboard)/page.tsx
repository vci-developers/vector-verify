import { redirect } from 'next/navigation';
// import DashboardPageClient from '@/features/dashboard/components/dashboard-page-client';

export default function DashboardPage() {
    // Temporarily redirecting while the dashboard is under construction.
    redirect('/operations');
    // return <DashboardPageClient />;
}
