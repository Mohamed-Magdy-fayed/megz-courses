import { ButtonHTMLAttributes, FC, ReactNode, useEffect, useState } from 'react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './dropdown-menu'
import { Button } from './button'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ScrollArea } from './scroll-area'
import { Typography } from './Typoghraphy'

type DataType = {
    label: string
    customLabel?: ReactNode
    value: string
    active: boolean
}

interface TableSelectFieldProps<T> extends ButtonHTMLAttributes<HTMLButtonElement> {
    placeholder: string
    listTitle: string | ReactNode
    data: DataType[]
    handleChange: (val: T) => void
    customLabel?: ReactNode
}

const TableSelectField: FC<TableSelectFieldProps<any>> = ({ placeholder, listTitle, data, handleChange, className, ...props }) => {
    const [isOpen, setIsOpen] = useState(false)
    const [filteredData, setFilteredData] = useState(data)
    const [value, setValue] = useState("")

    useEffect(() => {
        setFilteredData(data)
    }, [data])

    return (
        <DropdownMenu open={isOpen} onOpenChange={(val) => setIsOpen(val)}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    customeColor={"foregroundOutlined"}
                    className={cn('max-w-sm flex border-0 items-center h-fit gap-2 justify-start focus-visible:ring-0 focus-visible:ring-offset-0', className)}
                    {...props}
                >
                    {value.length === 0 ? (
                        <Typography className='text-muted'>
                            {placeholder}
                        </Typography>
                    ) : (
                        <Typography className='text-muted'>
                            {value}
                        </Typography>
                    )}
                    <ChevronDown className="h-4 w-4 opacity-50 ml-auto" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuLabel>{listTitle}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <ScrollArea className='h-40'>
                    {filteredData.map(item => {
                        return (
                            <DropdownMenuItem
                                key={item.value}
                                disabled={!item.active}
                                onClick={() => {
                                    handleChange(item.value)
                                    setValue(item.label === value ? "" : item.label)
                                }}>
                                <Check
                                    className={cn(
                                        "mr-2 h-4 w-4",
                                        value === item.label ? "opacity-100" : "opacity-0"
                                    )}
                                />
                                {item.customLabel ? item.customLabel :
                                    <Typography>{item.label}</Typography>
                                }
                            </DropdownMenuItem>
                        )
                    })}
                </ScrollArea>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export default TableSelectField