import Image from 'next/image'
import React from 'react'
import ContactForm from './ContactForm'
import contact_us_svg from '../../../public/svgs/contact_us.svg'

const ContactSection = () => {
    return (
        <section className="grid place-content-center">
            <div className="grid grid-cols-12 p-4 xl:gap-8">
                <div className="col-span-12 lg:col-span-6">
                    <div className="grid place-content-center h-full">
                        <Image src={contact_us_svg} alt="image" />
                    </div>
                </div>
                <div className="col-span-12 lg:col-span-6 p-4">
                    <ContactForm />
                </div>
            </div>
        </section>
    )
}

export default ContactSection