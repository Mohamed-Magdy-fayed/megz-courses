import { Order, User } from "@prisma/client";
import { useSession } from "next-auth/react";
import UserDataForm, { UserDataFormValues } from "../UserDataForm/UserDataForm";
import AccountHistory from "@/components/users/accountComponents/AccountHistory";
import AccountNotes from "@/components/users/accountComponents/AccountNotes";

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
    </div>
  );
};

