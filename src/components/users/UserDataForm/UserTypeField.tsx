import { UseFormReturn } from "react-hook-form"
import { UserDataFormValues } from "./UserDataForm"
import { Separator } from "@/components/ui/separator"
import { Typography } from "@/components/ui/Typoghraphy"
import { FormField, FormItem, FormControl, FormMessage } from "@/components/ui/form"
import { useRouter } from "next/router"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const UserTypeField = ({ form, loading }: {
    form: UseFormReturn<UserDataFormValues>
    loading: boolean
}) => {
    const isOwnAccount = useRouter().pathname === "/account"
    
    if (isOwnAccount) return null

    return (
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
    )
}

export default UserTypeField
