import { Dispatch, FC, SetStateAction, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form";
import { useRouter } from "next/router";
import useDebounce from "@/hooks/useDebounce";
import { Course } from "@prisma/client";
import { api } from "@/lib/api";

const formSchema = z.object({
    query: z.string(),
});

type CourseSearchQuery = z.infer<typeof formSchema>;

const CourseSearchBar: FC<{ setData?: Dispatch<SetStateAction<Course[]>> }> = ({
    setData
}) => {
    const [loading, setLoading] = useState(false);
    const router = useRouter()
    const defaultValues: z.infer<typeof formSchema> = {
        query: "",
    };

    const form = useForm<CourseSearchQuery>({
        resolver: zodResolver(formSchema),
        defaultValues,
    });

    const onSubmit = (data: CourseSearchQuery) => {
        router.push(`/search-courses?query=${data.query}`)
    };

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex-grow max-w-lg"
            >
                <FormField
                    control={form.control}
                    name="query"
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <div className="w-full flex rounded-md [&:has(:focus-visible)]:ring-1 [&:has(:focus-visible)]:ring-primary [&:has(:focus-visible)]:ring-offset-1 overflow-hidden">
                                    <Input
                                        disabled={loading}
                                        placeholder="Search Courses"
                                        autoComplete="off"
                                        {...field}
                                        className="rounded-none rounded-l-md focus-visible:ring-0 focus-visible:outline-none focus-visible:ring-offset-0 "
                                    />
                                    <Button className="rounded-none rounded-r-md">
                                        Search
                                    </Button>
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </form>
        </Form>
    );
}

export default CourseSearchBar