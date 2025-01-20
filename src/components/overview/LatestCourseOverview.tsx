import { formatDistanceToNow } from "date-fns";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/Typoghraphy";
import { ArrowRight, Eye, Edit, MoreVertical } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { api } from "@/lib/api";
import Link from "next/link";
import { useEffect, useState } from "react";
import Spinner from "../Spinner";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";

export const LatestCourseOverview = () => {
  const { data, refetch, isLoading } = api.courses.getLatest.useQuery(undefined, { enabled: false })

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    refetch()
  }, [])

  return (
    <Card className="col-span-12 md:col-span-6 xl:col-span-4 h-full flex flex-col">
      <CardHeader>
        <Typography variant={"secondary"}>Latest courses</Typography>
      </CardHeader>
      <div className="flex flex-col">
        {isLoading ? <Spinner className="animate-spin w-full" /> : data?.courses.length === 0 ? (
          <Typography className="self-center">No Courses added yet.</Typography>
        ) : data?.courses.map((course, index) => {
          const hasDivider = index < data.courses.length - 1;
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
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant={"icon"} customeColor={"mutedIcon"} onClick={handleMenuToggle}>
                      <MoreVertical />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <Link href={`/courses/${course.slug}`}>
                      <DropdownMenuItem>
                        <Eye />
                        <Typography>View</Typography>
                      </DropdownMenuItem>
                    </Link>
                    <Link href={`/content/courses/${course.slug}`}>
                      <DropdownMenuItem>
                        <Edit />
                        <Typography>Edit</Typography>
                      </DropdownMenuItem>
                    </Link>
                  </DropdownMenuContent>
                </DropdownMenu>

              </div>
              {hasDivider && (<Separator />)}
            </div>
          );
        })}
      </div>
      <Separator className="mt-auto" />
      <CardFooter className="p-4 justify-end">
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
