import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function OperationsPage() {
    return (
        <div className="p-8">
            <Button asChild>
                <Link href="/operations/mayuge">Go to Mayuge</Link>
            </Button>
        </div>
    );
}
