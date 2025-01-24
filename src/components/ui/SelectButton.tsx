import { ButtonHTMLAttributes, FC, ReactNode, useState } from 'react'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectSeparator, SelectTrigger, SelectValue } from './select'
import Spinner from '../Spinner'

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
                    <SelectLabel>{listTitle}</SelectLabel>
                    <SelectSeparator />
                    {!data ? (
                        <Spinner size={420} />
                    ) : data.map(item => (
                        <SelectItem key={item.value} value={item.value} children={item.label} disabled={item.active === false} />
                    ))}
                </SelectGroup>
            </SelectContent>
        </Select>
    )
}

export default SelectButton