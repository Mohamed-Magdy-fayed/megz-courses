import { ButtonHTMLAttributes, Dispatch, FC, ReactNode, SetStateAction, useEffect, useState } from 'react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu'
import { Button } from '../ui/button'
import { Check, ChevronDownIcon, ChevronsDownIcon, ChevronsUpDown, XIcon } from 'lucide-react'
import { Input } from '../ui/input'
import { cn } from '@/lib/utils'
import { ScrollArea } from '../ui/scroll-area'
import { advancedSearch } from '@/lib/advancedSearch'
import { Typography } from '../ui/Typoghraphy'
import Spinner from '@/components/Spinner'

type DataType<T> = {
    label: string
    customLabel?: ReactNode
    value: T
    Active: boolean
}

interface SelectFieldProps<T> extends ButtonHTMLAttributes<HTMLButtonElement> {
    placeholder: string
    multiSelect?: boolean
    listTitle: string | ReactNode
    data: DataType<T>[]
    values: T[]
    setValues: (val: T) => void;
    customLabel?: ReactNode
    disableSearch?: boolean
}

const SelectField: FC<SelectFieldProps<any>> = ({ placeholder, listTitle, data, values, setValues, multiSelect, disableSearch, className, ...props }) => {
    const [isOpen, setIsOpen] = useState(false)
    const [filteredData, setFilteredData] = useState(data)
    const [searchQuery, setSearchQuery] = useState("")

    useEffect(() => {
        setFilteredData(data)
    }, [data])

    return (
        <DropdownMenu open={isOpen} onOpenChange={(val) => setIsOpen(val)}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    customeColor={"foregroundOutlined"}
                    className={cn('flex flex-wrap w-full items-center h-fit gap-2 justify-between', className)}
                    {...props}
                >
                    <div className='flex flex-wrap items-center h-fit gap-2'>
                        {values.length === 0 ? (
                            <Typography>
                                {placeholder}
                            </Typography>
                        ) : data.filter(entry => values.includes(entry.value)).map(item => (
                            <Typography key={item.label} className='bg-primary/10 whitespace-nowrap truncate rounded-full px-2 text-sm'>
                                {item.label}
                            </Typography>
                        ))}
                    </div>
                    {props.disabled ? <Spinner size={20} /> : <ChevronDownIcon className="h-4 w-4 opacity-50 ml-auto" />}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                {disableSearch ? null : (
                    <div className='p-2'>
                        <Input
                            placeholder={`Search ${typeof listTitle === "string" ? listTitle : ""}`}
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value)
                                const filteredLabels = advancedSearch(e.target.value, data.map(item => item.label))

                                setFilteredData(
                                    e.target.value === ""
                                        ? data
                                        : data.filter(item => filteredLabels.includes(item.label))
                                )
                                setTimeout(() => e.target.focus(), 10)
                            }}
                            className='isolate rounded-full focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-primary'
                            size={10}
                            name="select_search"
                            autoFocus
                            autoComplete='off'
                        />
                    </div>
                )}
                <DropdownMenuLabel className='flex items-center justify-between gap-4'>
                    {listTitle}
                    {values.length > 0 && (
                        <Button onClick={() => setValues([])} variant={'link'} customeColor={"destructive"} className='p-0 text-sm'>
                            <Typography className='sr-only'>Clear Selection</Typography>
                            <XIcon className='w-4 h-4 text-destructive' />
                        </Button>
                    )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <ScrollArea className='h-40'>
                    {filteredData.length === 0 && <div className='text-center w-full p-4'>No Data</div>}
                    {filteredData.map(item => {
                        return (
                            <DropdownMenuItem
                                key={item.value}
                                disabled={!item.Active}
                                onClick={(e) => {
                                    if (multiSelect) {
                                        e.preventDefault()
                                        setValues(values.includes(item.value) ? [...values.filter(i => i !== item.value)] : [...values, item.value])
                                        return
                                    }
                                    setValues([item.value])
                                }}>
                                <Check
                                    className={cn(
                                        "mr-2 h-4 w-4",
                                        values.includes(item.value) ? "opacity-100" : "opacity-0"
                                    )}
                                />
                                {item.customLabel ? item.customLabel :
                                    <div className='flex items-center justify-between w-full'>
                                        <Typography>{item.label}</Typography>
                                    </div>
                                }
                            </DropdownMenuItem>
                        )
                    })}
                </ScrollArea>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export default SelectField