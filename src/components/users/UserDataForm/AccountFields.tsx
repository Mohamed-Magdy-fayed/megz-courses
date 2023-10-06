import { Typography } from "@/components/ui/Typoghraphy"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { UseFormReturn } from "react-hook-form"
import { UserDataFormValues } from "./UserDataForm"

const AccountFields = ({ form, loading, isPassword }: {
    form: UseFormReturn<UserDataFormValues>
    loading: boolean
    isPassword?: boolean
}) => {
    return (
        <>
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
                {isPassword && (
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
        </>
    )
}

export default AccountFields