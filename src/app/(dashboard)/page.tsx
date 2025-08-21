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
import { formatMonthYear } from "@/lib/date-utils";
import { getProgressStats } from "@/lib/image-utils";
import { Calendar, ImageIcon } from "lucide-react";
import Link from "next/link";
import { Fragment } from "react";

const DUMMY_ANNOTATION_TASKS = [
  {
    id: 1,
    timestamp: 1680000000000,
    status: "In Progress",
    images: [
      {
        id: 1443,
        specimenId: "UNZ003",
        imageUrl: "https://api.vectorcam.org/specimens/16/images/18",
        morphSpecies: undefined,
        morphSex: undefined,
        morphAbdomenStatus: undefined,
        annotationStatus: "UNANNOTATED",
        notes: undefined,
      },
      {
        id: 1444,
        specimenId: "UNZ004",
        imageUrl: "https://api.vectorcam.org/specimens/16/images/18",
        morphSpecies: "Anopheles gambiae",
        morphSex: "Male",
        morphAbdomenStatus: undefined,
        annotationStatus: "ANNOTATED",
        notes: undefined,
      },
      {
        id: 1445,
        specimenId: "UNZ005",
        imageUrl: "https://api.vectorcam.org/specimens/16/images/18",
        morphSpecies: undefined,
        morphSex: undefined,
        morphAbdomenStatus: undefined,
        annotationStatus: "FLAGGED",
        notes: "Requires further review",
      },
    ],
  },
  {
    id: 2,
    district: "Mukono",
    timestamp: 1682000000000,
    status: "In Progress",
    images: [
      {
        id: 1446,
        specimenId: "UNZ005",
        imageUrl: "https://api.vectorcam.org/specimens/16/images/18",
        morphSpecies: undefined,
        morphSex: undefined,
        morphAbdomenStatus: undefined,
        annotationStatus: "FLAGGED",
        notes: "Requires further review",
      },
      {
        id: 1447,
        specimenId: "UNZ005",
        imageUrl: "https://api.vectorcam.org/specimens/16/images/18",
        morphSpecies: undefined,
        morphSex: undefined,
        morphAbdomenStatus: undefined,
        annotationStatus: "ANNOTATED",
        notes: "Requires further review",
      },
    ],
  },
];

export default function DashboardPage() {
  return (
    <Fragment>
      {DUMMY_ANNOTATION_TASKS.map((task) => {
        const { completedPercent, annotated, flagged, unannotated, total } =
          getProgressStats(task.images);
        const formattedDate = formatMonthYear(task.timestamp);

        return (
          <Link
            href="#"
            key={task.id}
            className="block max-w-md hover:scale-[1.01] transition-transform"
          >
            <Card className="p-6 space-y-1 cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="p-0 space-y-2">
                <div className="flex justify-between">
                  <CardTitle className="text-base">Image Annotation</CardTitle>
                  <Badge className="lowercase">{task.status}</Badge>
                </div>

                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  {formattedDate}
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

                <Label className="text-sm text-muted-foreground gap-1">
                  <ImageIcon className="w-4 h-4" />
                  {total} images
                </Label>
              </CardContent>

              <CardFooter className="p-0">
                <div className="flex justify-between w-full">
                  <Label className="text-xs gap-2 font-normal">
                    <span className="w-2 h-2 rounded-full bg-primary" />
                    {annotated} annotated
                  </Label>

                  <Label className="text-xs gap-2 font-normal">
                    <span className="w-2 h-2 rounded-full bg-destructive" />
                    {flagged} flagged
                  </Label>

                  <Label className="text-xs gap-2 font-normal">
                    <span className="w-2 h-2 rounded-full bg-secondary-foreground/10" />
                    {unannotated} pending
                  </Label>
                </div>
              </CardFooter>
            </Card>
          </Link>
        );
      })}
    </Fragment>
  );
}
