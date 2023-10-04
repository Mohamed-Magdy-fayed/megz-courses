import { formatDistanceToNow } from "date-fns";
import { Card, CardFooter, CardHeader } from "@/components/ui/card";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/Typoghraphy";
import { ArrowRight, MoreVertical } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface CourseType {
  id: string;
  image?: string;
  name: string;
  updatedAt: number;
}

export const LatestCourseOverview = (props: {
  courses: CourseType[];
}) => {
  const { courses = [] } = props;

  return (
    <Card className="col-span-12 md:col-span-6 lg:col-span-4 xl:col-span-4 h-full">
      <CardHeader>
        <Typography variant={"secondary"}>Latest courses</Typography>
      </CardHeader>
      <div className="flex flex-col">
        {courses.map((course, index) => {
          const hasDivider = index < courses.length - 1;
          const ago = formatDistanceToNow(course.updatedAt);

          return (
            <div key={course.id}>
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <div>
                    {course.image ? (
                      <Image
                        width={48}
                        height={48}
                        src={course.image}
                        alt="image"
                        className="rounded" />
                    ) : (
                      <Skeleton className="rounded bg-muted h-12 w-12" />
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <Typography variant={"secondary"}>
                      {course.name}
                    </Typography>
                    <Typography variant={"bodyText"}>
                      {`Updated ${ago} ago`}
                    </Typography>
                  </div>
                </div>
                <Button variant={"icon"} >
                  <MoreVertical />
                </Button>
              </div>
              {hasDivider && (<Separator />)}
            </div>
          );
        })}
      </div>
      <Separator />
      <CardFooter className="p-4 justify-end">
        <Button>
          <ArrowRight />
          <Typography variant={"buttonText"}>View all</Typography>
        </Button>
      </CardFooter>
    </Card>
  );
};
