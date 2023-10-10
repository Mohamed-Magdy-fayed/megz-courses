import Link from "next/link"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import { Order, Prisma } from "@prisma/client"
import Spinner from "@/components/Spinner"
import { Button } from "@/components/ui/button"
import { Typography } from "@/components/ui/Typoghraphy"
import { LogIn, LogOut, Menu } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useState } from "react"
import { LogoForeground, LogoPrimary } from "../Logo"

interface LandingNavigationMenuProps {
  data: {
    courses: {
      name: string;
      id: string;
      updatedAt: Date;
      createdAt: Date;
      orders: Order[];
      price: number;
      _count: Prisma.CourseCountOutputType;
    }[];
  } | undefined
}

export const LandingNavigationMenu: React.FC<LandingNavigationMenuProps> = ({
  data,
}) => {
  const [open, setOpen] = useState(false)

  return (
    <div className="w-full z-10 py-2 px-4 md:px-8 md:py-4 max-w-7xl lg:mx-auto">
      <div className="grid items-center grid-cols-12 border-b border-primary">
        <NavigationMenu className="col-span-3">
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger className="hover:bg-primary hover:text-primary-foreground">Courses</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="flex flex-col items-start p-0">
                  {!data?.courses ? <Spinner /> : data.courses.map((course) => (
                    <Link
                      key={course.id}
                      href={`/courses/${course.id}`}
                      className="hover:bg-primary w-full transition-colors hover:text-primary-foreground p-4"
                    >
                      <Typography variant={"secondary"}>{course.name}</Typography>
                      <p className="whitespace-nowrap">
                        {course.orders.length} Enrollments
                      </p>
                    </Link>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
        <Link href={'/'} className="flex items-center col-span-6 gap-1 justify-center">
          <Typography variant={"primary"} className="!text-lg !leading-none !font-extrabold text-primary">
            Megz
          </Typography>
          <LogoForeground className="w-12 h-12" />
          <Typography variant={"primary"} className="!text-lg !leading-none !font-extrabold text-primary">
            Learning
          </Typography>
        </Link>
        <div className="hidden md:flex col-span-3 items-center gap-4 justify-end">
          <Button customeColor={"successIcon"}>
            <Typography>Login</Typography>
            <LogIn />
          </Button>
          <Button customeColor={"primaryIcon"}>
            <Typography>Register</Typography>
            <LogOut />
          </Button>
        </div>
        <div className="md:hidden flex col-span-3 items-center gap-4 justify-end">
          <DropdownMenu
            open={open}
            onOpenChange={(val) => setOpen(val)}
          >
            <DropdownMenuTrigger asChild>
              <Button variant={"icon"} customeColor={"primaryIcon"}>
                <Menu />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="flex flex-col gap-4">
              <Button customeColor={"successIcon"}>
                <Typography>Login</Typography>
                <LogIn />
              </Button>
              <Button customeColor={"primaryIcon"}>
                <Typography>Register</Typography>
                <LogOut />
              </Button>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}
