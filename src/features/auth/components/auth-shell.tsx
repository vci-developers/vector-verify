import { Avatar, AvatarImage } from '@/components/ui/avatar';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import Image from 'next/image';

interface AuthShellProps {
    title: string;
    description: string;
    imageSrc: string;
    children: React.ReactNode;
}

export default function AuthShell({
    title,
    description,
    imageSrc,
    children,
}: AuthShellProps) {
    return (
        <div className="grid min-h-screen lg:grid-cols-2">
            <div className="relative hidden lg:block">
                <Image
                    src={imageSrc}
                    alt="Auth Illustration"
                    fill
                    priority
                    className="object-cover"
                />
            </div>

            <div className="flex items-center justify-center p-6">
                <Card className="bg-card text-card-foreground w-full max-w-md shadow-lg">
                    <CardHeader className="flex flex-col items-center text-center">
                        <Avatar className="border-primary/40 bg-muted h-16 w-16 border">
                            <AvatarImage
                                src="/assets/auth/images/logo.png"
                                alt="VectorVerify"
                                className="object-contain"
                            />
                        </Avatar>
                        <span className="text-muted-foreground text-xl font-semibold">
                            VectorVerify
                        </span>
                        <CardTitle className="mt-2 text-2xl">{title}</CardTitle>
                        <CardDescription className="text-muted-foreground">
                            {description}
                        </CardDescription>
                    </CardHeader>

                    <CardContent>{children}</CardContent>
                </Card>
            </div>
        </div>
    );
}
