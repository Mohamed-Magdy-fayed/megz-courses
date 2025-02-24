import { formatDistanceToNow } from "date-fns";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/Typoghraphy";
import { ArrowRight, Eye, Edit, ChevronDownIcon } from "lucide-react";
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
              <div className="flex items-center justify-between px-4 py-1">
                <div className="flex flex-col">
                  <Typography variant={"secondary"} className="!text-sm">
                    {course.name}
                  </Typography>
                  <Typography variant={"bodyText"} className="!text-sm">
                    {`Updated ${ago} ago`}
                  </Typography>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant={"icon"} customeColor={"mutedIcon"} onClick={handleMenuToggle}>
                      <ChevronDownIcon />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <Link href={`/student/courses/${course.slug}`}>
                      <DropdownMenuItem>
                        <Eye />
                        <Typography>View</Typography>
                      </DropdownMenuItem>
                    </Link>
                    <Link href={`/admin/system_management/content/courses/${course.slug}`}>
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
        <Link href="/admin/system_management/content">
          <Button>
            <ArrowRight />
            <Typography variant={"buttonText"}>View all</Typography>
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};
