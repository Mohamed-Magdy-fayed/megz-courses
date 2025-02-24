import { UseFormReturn } from "react-hook-form"
import { UserDataFormValues } from "./UserDataForm"
import { Separator } from "@/components/ui/separator"
import { Typography } from "@/components/ui/Typoghraphy"
import { FormField, FormItem, FormMessage } from "@/components/ui/form"
import { useRouter } from "next/router"
import SelectField from "@/components/ui/SelectField"
import { validUserRoles } from "@/lib/enumsTypes"
import { upperFirst } from "lodash"

const UserRolesField = ({ form, loading }: {
    form: UseFormReturn<UserDataFormValues>
    loading: boolean
}) => {
    const isOwnAccount = useRouter().pathname === "/admin/users_management/account"

    if (isOwnAccount) return null

    return (
        <div className="col-span-12">
            <Separator />
            <Typography className="my-2" variant={'secondary'}>User Type</Typography>
            <FormField
                control={form.control}
                name="userRoles"
                render={({ field }) => (
                    <FormItem>
                        <SelectField
                            disabled={loading}
                            multiSelect
                            data={validUserRoles.filter(r => r !== "Admin").map(role => ({
                                Active: true,
                                label: upperFirst(role),
                                value: role,
                            }))}
                            listTitle="User Roles"
                            placeholder="Select user roles"
                            setValues={field.onChange}
                            values={field.value}
                        />
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>
    )
}

export default UserRolesField
