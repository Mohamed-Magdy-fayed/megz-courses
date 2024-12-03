import { Prisma } from "@prisma/client";
import { useSession } from "next-auth/react";
import UserDataForm, { UserDataFormValues } from "../UserDataForm/UserDataForm";

export const AccountDetails = ({ user }: {
  user: Prisma.UserGetPayload<{ include: { orders: true } }>;
}) => {
  const session = useSession()

  const formattedUser: UserDataFormValues = {
    email: user.email,
    id: user.id,
    name: user.name,
    userRoles: user?.userRoles,
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
      <UserDataForm withPassword={!!session.data?.user.userRoles.includes("Admin")} title="Edit account" initialData={formattedUser} />
    </div>
  );
};

