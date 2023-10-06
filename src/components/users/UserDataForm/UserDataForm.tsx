import { api } from "@/lib/api";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Separator } from "@/components/ui/separator";
import { Form } from "@/components/ui/form";
import { Typography } from "../../ui/Typoghraphy";
import AddressFields from "./AddressFields";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import UserTypeField from "./UserTypeField";
import AccountFields from "./AccountFields";
import Spinner from "@/components/Spinner";
import { useToast } from "@/components/ui/use-toast";
import { useForm } from "react-hook-form";

const userDataFormSchema = z.object({
    id: z.string().nonempty(),
    name: z.string().nonempty(),
    email: z.string().email(),
    password: z.string().min(4).optional(),
    image: z.string().optional().nullable(),
    phone: z.string().optional(),
    state: z.string().optional(),
    street: z.string().optional(),
    city: z.string().optional(),
    country: z.string().optional(),
    userType: z.enum(["student", "teacher", "salesAgent"]),
});

export type UserDataFormValues = z.infer<typeof userDataFormSchema>;

interface UserDateFormProps {
    title: string;
    setIsOpen?: (val: boolean) => void;
    initialData: UserDataFormValues;
}

const UserDateForm: React.FC<UserDateFormProps> = ({ title, setIsOpen, initialData }) => {
    const [loading, setLoading] = useState(false)
    const { id, email, name, password, userType, city, country, image, phone, state, street } = initialData

    const defaultValues: z.infer<typeof userDataFormSchema> = {
        id,
        name,
        email,
        password,
        image,
        phone,
        state,
        street,
        city,
        country,
        userType,
    };

    const form = useForm<UserDataFormValues>({
        resolver: zodResolver(userDataFormSchema),
        defaultValues,
    });

    const { toast } = useToast()
    const trpcUrils = api.useContext();
    const editUser = api.users.editUser.useMutation();

    const onSubmit = (data: UserDataFormValues) => {
        setLoading(true);
        editUser.mutate(
            { ...data },
            {
                onSuccess: (data) => {
                    toast({
                        description: `User with the email: ${data.updatedUser.email} has been updated`
                    })
                },
                onSettled() {
                    trpcUrils.users.invalidate()
                        .then(() => setLoading(false));
                },
            }
        )
    }

    return (
        <Card>
            <CardHeader>
                <div className="space-y-2 flex-col flex">
                    <Typography className="text-left text-xl font-medium">
                        {title}
                    </Typography>
                </div>
            </CardHeader>
            <Separator></Separator>
            <Form {...form}>
                <form
                    onSubmit={(e) => {
                        e.preventDefault()
                        onSubmit(form.getValues())
                    }}
                    className="flex w-full flex-col justify-between p-0"
                >
                    <CardContent>
                        <div className="scrollbar-thumb-rounded-lg grid grid-cols-12 gap-4 overflow-auto p-4 transition-all scrollbar-thin scrollbar-track-transparent scrollbar-thumb-primary/50">
                            <AccountFields form={form} loading={loading} />
                            <UserTypeField form={form} loading={loading} />
                            <AddressFields form={form} loading={loading} />
                        </div>
                    </CardContent>
                    <Separator />
                    <CardFooter className="p-4 justify-end">
                        <Button disabled={loading} formTarget="account-data" className="relative" type="submit">
                            {loading && <Spinner className="w-6 h-6 absolute" />}
                            <Typography className={loading ? "opacity-0" : ""}>
                                Update
                            </Typography>
                        </Button>
                    </CardFooter>
                </form>
            </Form>
            <Separator></Separator>
        </Card>
    );
};

export default UserDateForm;
