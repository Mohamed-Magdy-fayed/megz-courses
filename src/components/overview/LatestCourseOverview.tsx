import { formatDistanceToNow } from "date-fns";
import { Card, CardFooter, CardHeader } from "@/components/ui/card";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/Typoghraphy";
import { ArrowRight, Loader2, MoreVertical } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { api } from "@/lib/api";
import Link from "next/link";

export const LatestCourseOverview = () => {
  const { data } = api.courses.getAll.useQuery()

  return (
    <Card className="col-span-12 md:col-span-6 xl:col-span-4 h-full flex flex-col">
      <CardHeader>
        <Typography variant={"secondary"}>Latest courses</Typography>
      </CardHeader>
      <div className="flex flex-col">
        {!data?.courses ? <Loader2 className="animate-spin" /> : data.courses.slice(0, 7).map((course, index) => {
          const hasDivider = index < data.courses.length - 1;
          const ago = formatDistanceToNow(course.updatedAt);

          return (
            <div key={course.id}>
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <div>
                    {/* {course.image ? (
                      <Image
                        width={48}
                        height={48}
                        src={course.image}
                        alt="image"
                        className="rounded" />
                    ) : ( */}
                    <Skeleton className="rounded bg-muted h-12 w-12" />
                    {/* )} */}
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
                <Button variant={"icon"} customeColor={"mutedIcon"} >
                  <MoreVertical />
                </Button>
              </div>
              {hasDivider && (<Separator />)}
            </div>
          );
        })}
      </div>
      <Separator />
      <CardFooter className="p-4 justify-end mt-auto">
        <Link href="/content">
          <Button>
            <ArrowRight />
            <Typography variant={"buttonText"}>View all</Typography>
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};
