import { Address, User } from "@prisma/client";
import UserDataForm, { UserDataFormValues } from "../UserDataForm/UserDataForm";
import { useSession } from "next-auth/react";

export const AccountDetails = ({ user }: {
  user:
  | (User & {
    address: Address | null;
  })
}) => {
  const session = useSession()
  const formattedUser: UserDataFormValues = {
    email: user.email,
    id: user.id,
    name: user.name,
    userType: user?.userType === "admin" ? "student" : user?.userType,
    city: user.address?.city || "",
    country: user.address?.country || "",
    state: user.address?.state || "",
    street: user.address?.street || "",
    image: user.image,
    password: "",
    phone: user.phone || "",
  }

  return (
    <UserDataForm withPassword={session.data?.user.userType === "admin"} title="Edit your account" initialData={formattedUser} />
  );
};
