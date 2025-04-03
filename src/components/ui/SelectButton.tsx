import { ButtonHTMLAttributes, FC, ReactNode, useState } from 'react'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectSeparator, SelectTrigger, SelectValue } from './select'
import Spinner from './Spinner'
import { Button } from '@/components/ui/button'
import { XIcon } from 'lucide-react'

type DataType = {
    label: string
    customLabel?: ReactNode
    value: string
    active?: boolean
}

interface SelectButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    placeholder: string
    listTitle: string | ReactNode
    data?: DataType[]
    value: string | undefined
    setValue: (val: string) => void;
    customLabel?: ReactNode
}

const SelectButton: FC<SelectButtonProps> = ({ placeholder, listTitle, data, value, setValue, ...props }) => {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <Select open={isOpen} onOpenChange={(val) => setIsOpen(val)} value={value} onValueChange={(val) => setValue(val)} >
            <SelectTrigger {...props}>
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                    <SelectGroup className='flex items-center justify-between gap-4'>
                        <SelectLabel>{listTitle}</SelectLabel>
                        <Button onClick={() => setValue("")} variant={'x'}><XIcon /></Button>
                    </SelectGroup>
                    <SelectSeparator />
                    {!data ? (
                        <Spinner size={420} />
                    ) : data.map(item => (
                        <SelectItem key={item.value} className='block' value={item.value} children={item.customLabel ? item.customLabel : item.label} disabled={item.active === false} />
                    ))}
                </SelectGroup>
            </SelectContent>
        </Select>
    )
}

export default SelectButton