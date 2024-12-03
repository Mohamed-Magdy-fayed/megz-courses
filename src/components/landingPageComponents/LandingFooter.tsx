import Link from 'next/link'
import FooterCourseSearchBar from './CourseSearchBar'
import { Linkedin, Instagram, Youtube, Facebook } from 'lucide-react'
import Copyright from '@/components/Copyright'
import Image from 'next/image'
import { LogoPrimary } from '@/components/layout/Logo'
import { SiteIdentity } from '@prisma/client'
import { Typography } from '@/components/ui/Typoghraphy'

const landingNavLinks = [
    {
        label: "Home",
        url: "/",
    },
    {
        label: "My Account",
        url: "/my_account",
    },
    {
        label: "My Courses",
        url: "/my_courses",
    },
    {
        label: "Developer Portfolio",
        url: "https://megz.pro/",
        inNewTab: true,
    },
    {
        label: "Privacy Policy",
        url: "/privacy",
    },
    {
        label: "Terms of Use",
        url: "/terms",
    },
]

const LandingFooter = ({ siteIdentity }: { siteIdentity?: SiteIdentity }) => {

    const socialIcons = [
        { id: "soic1", icon: <Linkedin className='text-[#0072b1]' />, url: siteIdentity?.linkedin, hover: "hover:bg-[#0072b1]" },
        { id: "soic2", icon: <Instagram className='text-[#9b6954]' />, url: siteIdentity?.instagram, hover: "hover:bg-[#9b6954]" },
        { id: "soic3", icon: <Youtube className='text-[#c4302b]' />, url: siteIdentity?.youtube, hover: "hover:bg-[#c4302b]" },
        { id: "soic4", icon: <Facebook className='text-[#4267B2]' />, url: siteIdentity?.facebook, hover: "hover:bg-[#4267B2]" },
    ]
    return (
        <div className='w-full'>
            <div className='p-4 max-w-7xl lg:mx-auto'>
                <div className='border-t border-primary grid grid-cols-12 space-y-12'>
                    <div className='pt-4 flex flex-col items-center justify-center gap-4 col-span-12 md:col-span-4 lg:col-span-3'>
                        {siteIdentity?.logoPrimary ? (
                            <Image src={siteIdentity.logoPrimary} height={1000} width={1000} alt="Logo" className='w-24 rounded-full bg-accent' />
                        ) : (
                            <LogoPrimary className="w-24 h-24" />
                        )}
                        <div className='flex items-center gap-4'>
                            {socialIcons.map(icon => (
                                <Link
                                    key={icon.id}
                                    href={icon.url || ""}
                                    className={`hover:scale-110 transition-all duration-200 hover:[&>*]:text-background rounded-full p-1 ${icon.hover}`}
                                >
                                    {icon.icon}
                                </Link>
                            ))}
                        </div>
                    </div>
                    <div className='grid grid-cols-2 col-span-12 md:col-span-8 lg:col-span-6 gap-4 justify-items-start w-full px-8'>
                        {landingNavLinks.map(link => {
                            return (
                                <Link
                                    key={link.url}
                                    target={link.inNewTab ? '_blank' : undefined}
                                    className="whitespace-nowrap rounded-lg bg-transparent font-bold hover:text-primary"
                                    href={`${link.url}`}
                                >
                                    {link.label}
                                </Link>
                            )
                        })}
                    </div>
                    <div className='col-span-12 lg:col-span-3 flex items-center justify-center p-4 md:justify-end lg:justify-center'>
                        <FooterCourseSearchBar />
                    </div>
                </div>
            </div>
            <div className='flex justify-center p-4 bg-foreground text-background'>
                <Copyright />
            </div>
        </div>
    )
}

export default LandingFooter