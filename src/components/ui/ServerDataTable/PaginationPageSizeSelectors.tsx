import { buttonVariants } from "@/components/ui/button";
import SelectButton from "@/components/ui/SelectButton";
import { Typography } from "@/components/ui/Typoghraphy";
import { cn } from "@/lib/utils";
import { Updater } from "@tanstack/react-table";

export default function PaginationPageSizeSelectors({ isLoading, options, pageSize, setPageSize }: {
    isLoading: boolean;
    pageSize: number;
    options: number[];
    setPageSize: (updater: Updater<number>) => void
}) {
    return (
        <div className="flex items-center gap-2">
            <Typography className="md:hidden xl:inline">Page Size</Typography>
            <SelectButton
                data={options.map(item => ({
                    label: item.toString(),
                    value: item.toString(),
                }))}
                disabled={isLoading}
                value={pageSize.toString()}
                setValue={(val) => setPageSize(Number(val) || 10)}
                listTitle="Page sizes"
                placeholder="Page sizes"
                className={cn("w-fit",
                    buttonVariants({
                        size: "sm",
                        variant: "outline",
                        customeColor: "primaryOutlined",
                    })
                )}
            />
        </div>
    );
}
