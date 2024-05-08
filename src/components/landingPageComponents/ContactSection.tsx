import ContactForm from './ContactForm'
import ContactUsSvg from '../svgs/ContactUsSvg'

const ContactSection = () => {
    return (
        <section className="flex flex-col items-stretch  w-full">
            <div className="grid grid-cols-12 p-4 xl:gap-8 w-full">
                <div className="col-span-12 lg:col-span-6">
                    <ContactUsSvg />
                </div>
                <div className="col-span-12 lg:col-span-6 p-4">
                    <ContactForm />
                </div>
            </div>
        </section>
    )
}

export default ContactSection