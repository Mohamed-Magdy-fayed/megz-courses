import { api } from "@/lib/api";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Separator } from "@/components/ui/separator";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Typography } from "../../ui/Typoghraphy";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import Spinner from "@/components/Spinner";
import { useToast } from "@/components/ui/use-toast";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { validUserTypes } from "@/lib/enumsTypes";

const userDataFormSchema = z.object({
    id: z.string().nonempty(),
    name: z.string().nonempty(),
    email: z.string().email(),
    password: z.string().optional(),
    image: z.string().optional().nullable(),
    phone: z.string().optional(),
    state: z.string().optional(),
    street: z.string().optional(),
    city: z.string().optional(),
    country: z.string().optional(),
    userType: z.enum(validUserTypes),
});

export type UserDataFormValues = z.infer<typeof userDataFormSchema>;

interface UserDataFormProps {
    title: string;
    withPassword: boolean;
    setIsOpen?: (val: boolean) => void;
    initialData: UserDataFormValues;
}

const UserDataForm: React.FC<UserDataFormProps> = ({ title, withPassword, setIsOpen, initialData }) => {
    const isOwnAccount = useRouter().pathname === "/account"
    const session = useSession()

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

                    onSubmit={form.handleSubmit(onSubmit)}
                    className="flex w-full flex-col justify-between p-0"
                >
                    <fieldset disabled={!isOwnAccount && session.data?.user.userType !== "admin"}>
                        <CardContent className="scrollbar-thumb-rounded-lg grid grid-cols-12 gap-4 overflow-auto p-4 transition-all scrollbar-thin scrollbar-track-transparent scrollbar-thumb-primary/50">
                            <Typography className="col-span-12" variant={'secondary'}>Account</Typography>
                            <div className="flex-col flex gap-2 col-span-12 md:col-span-6">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Name</FormLabel>
                                            <FormControl>
                                                <Input
                                                    disabled={loading}
                                                    placeholder="Jon Doe"
                                                    {...field}
                                                    className="pl-8"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="phone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Phone</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="tel"
                                                    disabled={loading}
                                                    placeholder="01234567899"
                                                    {...field}
                                                    className="pl-8"
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="flex-col flex gap-2 col-span-12 md:col-span-6">
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="text"
                                                    disabled={loading}
                                                    placeholder="Example@mail.com"
                                                    {...field}
                                                    className="pl-8"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                {withPassword && (
                                    <FormField
                                        control={form.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Password</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="password"
                                                        disabled={loading}
                                                        placeholder="Password"
                                                        {...field}
                                                        className="pl-8"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}
                            </div>
                            {!isOwnAccount && session.data?.user.userType === "admin" && (
                                <div className="col-span-12">
                                    <Separator />
                                    <Typography className="my-2" variant={'secondary'}>User Type</Typography>
                                    <FormField
                                        control={form.control}
                                        name="userType"
                                        render={({ field }) => (
                                            <FormItem>
                                                <Select
                                                    disabled={loading}
                                                    // @ts-ignore
                                                    onValueChange={field.onChange}
                                                    value={field.value}
                                                    defaultValue={field.value}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger className="pl-8 bg-white">
                                                            <SelectValue
                                                                defaultValue={field.value}
                                                                placeholder="Select user type"
                                                            />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="student">Student</SelectItem>
                                                        <SelectItem value="teacher">Teacher</SelectItem>
                                                        <SelectItem value="salesAgent">Sales Agent</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            )}
                            <div className="col-span-12">
                                <Separator />
                                <Typography className="my-2" variant={'secondary'}>Address</Typography>
                                <div className="grid grid-cols-12 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="street"
                                        render={({ field }) => (
                                            <FormItem className="col-span-12 md:col-span-6 xl:col-span-4">
                                                <FormLabel>Street</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="text"
                                                        disabled={loading}
                                                        placeholder="Street Name"
                                                        {...field}
                                                        className="pl-8"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="city"
                                        render={({ field }) => (
                                            <FormItem className="col-span-12 md:col-span-6 xl:col-span-4">
                                                <FormLabel>City</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="text"
                                                        disabled={loading}
                                                        placeholder="City Name"
                                                        {...field}
                                                        className="pl-8"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="state"
                                        render={({ field }) => (
                                            <FormItem className="col-span-12 md:col-span-6 xl:col-span-4">
                                                <FormLabel>State</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="text"
                                                        disabled={loading}
                                                        placeholder="State Name"
                                                        {...field}
                                                        className="pl-8"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="country"
                                        render={({ field }) => (
                                            <FormItem className="col-span-12 md:col-span-6 xl:col-span-4">
                                                <FormLabel>Country</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="text"
                                                        disabled={loading}
                                                        placeholder="Country Name"
                                                        {...field}
                                                        className="pl-8"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </fieldset>
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

export default UserDataForm;
