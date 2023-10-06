import {
  ChangeEvent,
  FormEventHandler,
  useCallback,
  useState,
  useEffect,
} from "react";
import CustomInput from "@/components/students/CustomInput";
import { Address, User } from "@prisma/client";
import { z } from "zod";
import { api } from "@/lib/api";
import { useToastStore } from "@/zustand/store";
import { PaperContainer } from "@/components/ui/PaperContainers";
import { Typography } from "../../ui/Typoghraphy";
import { Separator } from "../../ui/separator";
import { Button } from "../../ui/button";
import UserDataForm, { UserDataFormValues } from "../UserDataForm/UserDataForm";

export const AccountDetails = ({ user }: {
  user:
  | (User & {
    address: Address | null;
  })
}) => {
  const [loading, setLoading] = useState(false);

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
    <UserDataForm title="Edit your account" initialData={formattedUser} />
  );
};
