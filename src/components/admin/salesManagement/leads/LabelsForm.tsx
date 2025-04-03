import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandShortcut } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Typography } from "@/components/ui/Typoghraphy"
import { toastType, useToast } from "@/components/ui/use-toast"
import useDebounce from "@/hooks/useDebounce"
import { api } from "@/lib/api"
import { createMutationOptions } from "@/lib/mutationsHelper"
import { ChevronDown } from "lucide-react"
import { useState } from "react"

const LabelsForm = ({ leadId }: { leadId: string }) => {
    const { toast } = useToast()

    const [loadingToast, setLoadingToast] = useState<toastType>()
    const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false)
    const [value, setValue] = useState("")

    const trpcUtils = api.useUtils()
    const { data, refetch } = api.leadLabels.searchLeadLabels.useQuery({ value }, { enabled: value.length > 0 })
    const addLabelMutation = api.leadLabels.createLeadLabel.useMutation(
        createMutationOptions({
            loadingToast,
            setLoadingToast,
            toast,
            trpcUtils,
            loadingMessage: "Adding label...",
            successMessageFormatter: ({ leadLabel }) => {
                setValue("")
                setIsSuggestionsOpen(false)
                return `${leadLabel.value} label Created`
            },
            disableToast: true,
        })
    )
    const connectLabelMutation = api.leadLabels.connectLeadLabel.useMutation(
        createMutationOptions({
            loadingToast,
            setLoadingToast,
            toast,
            trpcUtils,
            loadingMessage: "Connecting label...",
            successMessageFormatter: ({ leadLabel }) => {
                setValue("")
                setIsSuggestionsOpen(false)
                return `${leadLabel.value} label Connected`
            },
            disableToast: true,
        })
    )

    const handleCreateLabel = () => {
        addLabelMutation.mutate({
            leadId,
            value,
        })
    }

    useDebounce(() => {
        if (value.length === 0) return
        refetch()
    }, 1000, [value])

    const handleSelectSuggestion = (labelId: string) => {
        connectLabelMutation.mutate({ labelId, leadId })
    }

    return (
        <Popover open={isSuggestionsOpen} onOpenChange={(val) => setIsSuggestionsOpen(val)}>
            <PopoverTrigger asChild>
                <Button customeColor="primaryOutlined" variant="outline">
                    <Typography>Add a Label</Typography>
                    <ChevronDown className="size-4" />
                </Button>
            </PopoverTrigger>
            <PopoverContent asChild>
                <Command>
                    <CommandInput value={value} onValueChange={(val) => setValue(val)} />
                    <CommandList>
                        <CommandGroup>
                            <CommandEmpty>No Data</CommandEmpty>
                            {data?.leadLabels.map(label => (
                                <CommandItem key={label.id} onSelect={() => {
                                    setIsSuggestionsOpen(false)
                                    handleSelectSuggestion(label.id)
                                }}>
                                    {label.value}
                                </CommandItem>
                            ))}
                            {!data?.leadLabels.find(l => l.value === value) && (
                                <CommandItem onSelect={() => {
                                    setIsSuggestionsOpen(false)
                                    handleCreateLabel()
                                }}>
                                    {value}
                                </CommandItem>
                            )}
                        </CommandGroup>
                    </CommandList>
                    <CommandShortcut className="pt-4">Press Enter to create</CommandShortcut>
                </Command>
            </PopoverContent>
        </Popover>
    )
}

export default LabelsForm