import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { formatDate } from "@/lib/date-utils";
import { getProgressStats } from "@/lib/image-utils";
import { Calendar, ImageIcon } from "lucide-react";
import Link from "next/link";
import { DUMMY_ANNOTATION_TASKS } from "@/lib/dummy-annotation-tasks";

export default function DashboardPage() {
  return (
    <div className="grid gap-6 p-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {DUMMY_ANNOTATION_TASKS.map((task) => {
        const { completedPercent, annotated, flagged, unannotated, total } =
          getProgressStats(task.images);
        const { monthYear } = formatDate(task.timestamp);

        return (
          <Link
            href={`/annotate/${task.id}`}
            key={task.id}
            className="transition-transform hover:scale-[1.01]"
          >
            <Card className="p-6 space-y-1 cursor-pointer hover:shadow-md transition-shadow h-full">
              <CardHeader className="p-0 space-y-2">
                <div className="flex justify-between">
                  <CardTitle className="text-base">Image Annotation</CardTitle>
                  <Badge className="lowercase">{task.status}</Badge>
                </div>

                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Calendar className="size-4" />
                  {monthYear}
                </span>
              </CardHeader>

              <CardContent className="p-0 space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground font-medium">
                  <Label>Progress</Label>
                  <span>{completedPercent}% complete</span>
                </div>

                <Progress
                  value={completedPercent}
                  className="bg-secondary-foreground/10"
                  aria-label="annotation progress"
                  aria-valuenow={completedPercent}
                />

                <Label className="text-sm text-muted-foreground">
                  <ImageIcon className="size-4" />
                  {total} images
                </Label>
              </CardContent>

              <CardFooter className="p-0">
                <div className="flex justify-between w-full">
                  <Label className="text-xs font-normal">
                    <span className="size-2 rounded-full bg-primary" />
                    {annotated} annotated
                  </Label>

                  <Label className="text-xs font-normal">
                    <span className="size-2 rounded-full bg-destructive" />
                    {flagged} flagged
                  </Label>

                  <Label className="text-xs font-normal">
                    <span className="size-2 rounded-full bg-secondary-foreground/10" />
                    {unannotated} pending
                  </Label>
                </div>
              </CardFooter>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
