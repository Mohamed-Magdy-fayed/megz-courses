import React, { Dispatch, FC, ReactNode, SetStateAction, useEffect, useState } from 'react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuTrigger } from '../ui/dropdown-menu'
import { Button } from '../ui/button'
import { Check, ChevronsUpDown } from 'lucide-react'
import { Input } from '../ui/input'
import { cn } from '@/lib/utils'
import { ScrollArea } from '../ui/scroll-area'
import { advancedSearch } from '@/lib/advancedSearch'
import { Typography } from '../ui/Typoghraphy'
import { Checkbox } from '../ui/checkbox'
import { Separator } from '../ui/separator'

type DataType = {
    label: string
    value: string
    active: boolean
}

interface CoursesSelectFieldProps {
    placeholder: string
    multiSelect?: boolean
    loading?: boolean
    listTitle: string
    data: DataType[]
    values: { courseId: string, isPrivate: boolean }[]
    setValues: Dispatch<SetStateAction<{ courseId: string, isPrivate: boolean }[]>>
}

const CoursesSelectField: FC<CoursesSelectFieldProps> = ({ placeholder, listTitle, data, values, setValues, multiSelect, loading }) => {
    const [filteredData, setFilteredData] = useState(data)
    const [searchQuery, setSearchQuery] = useState("")

    useEffect(() => {
        setFilteredData(data)
    }, [data])

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button disabled={loading} variant="outline" customeColor={"foregroundOutlined"} className='max-w-[16rem] flex flex-wrap items-center h-fit gap-2 justify-start hover:bg-slate-50 hover:text-primary hover:border-primary'>
                    {values.length === 0 ? (
                        <Typography>
                            {placeholder}
                        </Typography>
                    ) : data.filter(entry => values.some(({ courseId }) => entry.value === courseId)).map(item => (
                        <Typography key={item.value} className='bg-primary/10 whitespace-nowrap truncate rounded-full px-2 text-sm'>
                            {item.label}
                        </Typography>
                    ))}
                    <ChevronsUpDown className="h-4 w-4 opacity-50 ml-auto" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <div className='p-2'>
                    <Input
                        placeholder={`Search ${listTitle}`}
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value)
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
                <DropdownMenuLabel className='flex items-center justify-between'>
                    <Typography>{listTitle}</Typography>
                    <Typography>Private Class?</Typography>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <ScrollArea className='h-40'>
                    {filteredData.map(item => (
                        <DropdownMenuItem
                            key={item.value}
                            disabled={!item.active}
                            onClick={(e) => {
                                e.preventDefault()
                                if (multiSelect) {
                                    setValues(prev => {
                                        return prev.some(({ courseId }) => item.value === courseId)
                                            ? [...prev.filter(i => i.courseId !== item.value)]
                                            : [...prev, { courseId: item.value, isPrivate: false }]
                                    })
                                    return
                                }
                                setValues([{ courseId: item.value, isPrivate: false }])

                            }}>
                            <Check
                                className={cn(
                                    "mr-2 h-4 w-4",
                                    values.some(({ courseId }) => item.value === courseId) ? "opacity-100" : "opacity-0"
                                )}
                            />
                            <div className='flex items-center justify-between w-full'>
                                <Typography>{item.label}</Typography>
                                <Typography>{!item.active && "Owned"}</Typography>
                            </div>
                            <Separator orientation="vertical" className="h-4 bg-primary" />
                            <Checkbox
                                onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()

                                    setValues((prev) => {
                                        return prev
                                            .some(({ courseId }) => courseId === item.value)
                                            ? prev.map(prevValue => prevValue.courseId === item.value
                                                ? {
                                                    courseId: prevValue.courseId,
                                                    isPrivate: !prevValue.isPrivate,
                                                }
                                                : prevValue)
                                            : [...prev, { courseId: item.value, isPrivate: true }]
                                    })

                                }}
                                checked={values.some(({ courseId, isPrivate }) => courseId === item.value && !!isPrivate)}
                            />
                        </DropdownMenuItem>
                    ))}
                </ScrollArea>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export default CoursesSelectField