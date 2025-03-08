import { Button, ButtonProps } from '@/components/ui/button'
import Modal from '@/components/ui/modal'
import Image from 'next/image'
import { useState } from 'react'

export default function ImageModal({ src, ...props }: ButtonProps & { src: string }) {
    const [isOpen, setIsOpen] = useState(false)
    return (
        <>
            <Button {...props} onClick={() => setIsOpen(true)} />
            <Modal
                title={''}
                description={''}
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                children={
                    <Image
                        className='max-w-md'
                        src={src}
                        alt={src}
                        width={1000}
                        height={1000}
                    />
                }
            />
        </>
    )
}
