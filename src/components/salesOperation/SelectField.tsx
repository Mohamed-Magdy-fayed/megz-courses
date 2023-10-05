import React, { Dispatch, FC, ReactNode, SetStateAction, useState } from 'react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuTrigger } from '../ui/dropdown-menu'
import { Button } from '../ui/button'
import { Check, ChevronsUpDown } from 'lucide-react'
import { Input } from '../ui/input'
import { cn } from '@/lib/utils'
import { ScrollArea } from '../ui/scroll-area'
import { advancedSearch } from '@/lib/advancedSearch'
import { Typography } from '../ui/Typoghraphy'

type DataType = {
    label: string
    value: string
}

interface SelectFieldProps {
    placeholder: string
    multiSelect?: boolean
    listTitle: string
    data: DataType[]
    values: string[]
    setValues: Dispatch<SetStateAction<string[]>>
}

const SelectField: FC<SelectFieldProps> = ({ placeholder, listTitle, data, values, setValues, multiSelect }) => {
    const [filteredData, setFilteredData] = useState(data)
    const [searchQuery, setSearchQuery] = useState("")
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" customeColor={"foregroundOutlined"} className='max-w-[16rem] flex flex-wrap items-center h-fit gap-2 justify-start hover:bg-slate-50 hover:text-primary hover:border-primary'>
                    {values.length === 0 ? (
                        <Typography>
                            {placeholder}
                        </Typography>
                    ) : data.filter(entry => values.includes(entry.value)).map(item => (
                        <Typography className='bg-primary/10 whitespace-nowrap truncate rounded-full px-2 text-sm'>
                            {item.label}
                        </Typography>
                    ))}
                    <ChevronsUpDown className="h-4 w-4 opacity-50 ml-auto" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <div className='p-2'>
                    <Input
                        placeholder='Search courses'
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value)
                            console.log(data.map(item => item.label));
                            const filteredLabels = advancedSearch(e.target.value, data.map(item => item.label))

                            setFilteredData(
                                e.target.value === ""
                                    ? data
                                    : data.filter(item => filteredLabels.includes(item.label))
                            )
                        }}
                        className='isolate rounded-full focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-primary'
                        size={10}
                    />
                </div>
                <DropdownMenuLabel>{listTitle}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <ScrollArea className='h-40'>
                    {filteredData.map(item => (
                        <DropdownMenuItem key={item.value} onClick={(e) => {
                            if (multiSelect) {
                                e.preventDefault()
                                setValues(prev => prev.includes(item.value) ? [...prev.filter(i => i !== item.value)] : [...prev, item.value])
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
                            {item.label}
                        </DropdownMenuItem>
                    ))}
                </ScrollArea>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export default SelectField