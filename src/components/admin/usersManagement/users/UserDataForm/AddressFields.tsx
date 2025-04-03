import { UseFormReturn } from "react-hook-form"
import { UserDataFormValues } from "./UserDataForm"
import { Separator } from "@/components/ui/separator"
import { Typography } from "@/components/ui/Typoghraphy"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"


const AddressFields = ({ form, loading }: {
    form: UseFormReturn<UserDataFormValues>
    loading: boolean
}) => {

    return (
        <div className="col-span-12">
            <Separator />
            <Typography className="my-2" variant={'secondary'}>Address</Typography>
            <div className="grid grid-cols-12 gap-4">
                <FormField
                    control={form.control}
                    name="street"
                    render={({ field }) => (
                        <FormItem className="col-span-12 md:col-span-6 lg:col-span-4">
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
                        <FormItem className="col-span-12 md:col-span-6 lg:col-span-4">
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
                        <FormItem className="col-span-12 md:col-span-6 lg:col-span-4">
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
                        <FormItem className="col-span-12 md:col-span-6 lg:col-span-4">
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
    )
}

export default AddressFields