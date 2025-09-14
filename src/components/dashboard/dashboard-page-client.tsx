"use client"

import { useUserPermissionsQuery } from "@/lib/user/client";
import { canViewAndWriteAnnotationTasks } from "@/lib/user/permissions";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Loader2, PencilLine } from "lucide-react";
import { Fragment } from "react";
import { useRouter } from "next/navigation";

export function DashboardPageClient() {
    const router = useRouter();
    const { data: permissions, isLoading } = useUserPermissionsQuery();

    const handleClick = () => {
        router.push("/annotate");
    };

    return (
        <Fragment>
            {permissions && canViewAndWriteAnnotationTasks(permissions) && (
                <div className="mx-auto w-full max-w-2xl px-6 py-10">
                    <Card className="rounded-2xl border shadow-sm">
                        <CardHeader className="space-y-3">
                            <div className="bg-primary/10 text-primary ring-primary/20 inline-flex h-10 w-10 items-center justify-center rounded-full ring-1">
                                <PencilLine className="h-5 w-5" />
                            </div>
                            <CardTitle className="tracking-tight">Start annotating</CardTitle>
                            <CardDescription>
                                Review and label your assigned tasks.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="text-muted-foreground text-sm">
                            Access your queue and continue where you left off.
                        </CardContent>
                        <CardFooter className="flex items-end justify-end">
                            <Button onClick={handleClick} disabled={isLoading} size="sm" aria-busy={isLoading}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Preparing...
                                    </>
                                ) : (
                                    <>
                                        Annotate
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </>
                                )}
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            )}
        </Fragment>
    )
}
