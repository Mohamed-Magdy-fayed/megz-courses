import { Order, User } from "@prisma/client";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Typography } from "@/components/ui/Typoghraphy";
import { Separator } from "@/components/ui/separator";
import UserDataForm, { UserDataFormValues } from "../UserDataForm/UserDataForm";
import AccountPaymentClient from "./AccountPaymentClient";

export const AccountDetails = ({ user }: {
  user: (User & {
    orders: Order[];
  });
}) => {
  const session = useSession()
  const formattedUser: UserDataFormValues = {
    email: user.email,
    id: user.id,
    name: user.name,
    userType: user?.userType === "admin" ? user?.userType : "student",
    city: user.address?.city || "",
    country: user.address?.country || "",
    state: user.address?.state || "",
    street: user.address?.street || "",
    image: user.image,
    password: "",
    phone: user.phone || "",
  }

  return (
    <div className="flex flex-col gap-4">
      <UserDataForm withPassword={session.data?.user.userType === "admin"} title="Edit your account" initialData={formattedUser} />
      <Card>
        <CardHeader>
          <div className="space-y-2 flex-col flex">
            <Typography className="text-left text-xl font-medium">
              Account history
            </Typography>
          </div>
        </CardHeader>
        <Separator></Separator>
        <CardContent className="scrollbar-thumb-rounded-lg gap-4 overflow-auto p-4 transition-all scrollbar-thin scrollbar-track-transparent scrollbar-thumb-primary/50">
          <Typography className="col-span-12" variant={'secondary'}>Payments</Typography>
          <AccountPaymentClient data={user.orders}></AccountPaymentClient>
        </CardContent>
      </Card>
    </div>
  );
};
