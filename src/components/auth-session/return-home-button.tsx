import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function ReturnHomeButton({ label }: { label: string }) {
    return (
        <Button asChild variant="outline" className="w-full">
            <Link href="/">{label}</Link>
        </Button>
    );
}
