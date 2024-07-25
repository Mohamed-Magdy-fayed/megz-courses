import { ReactNode } from 'react'
import { LandingNavigationMenu } from './LandingNavMenu'
import LandingFooter from './LandingFooter'
import ChatWithUs from './ChatWithUs'
import { api } from '@/lib/api'

const LandingLayout = ({ children }: { children: ReactNode }) => {
    const { data } = api.siteIdentity.getSiteIdentity.useQuery()

    return (
        <div className='flex flex-col items-center h-screen bg-background'>
            {data?.siteIdentity && <LandingNavigationMenu siteIdentity={data.siteIdentity} />}
            <div className='flex-grow w-full flex flex-col overflow-auto transition-all scrollbar-thin scrollbar-track-accent scrollbar-thumb-secondary'>
                <div className='flex-grow xl:px-24 px-4'>
                    {children}
                </div>
                {data?.siteIdentity && <LandingFooter siteIdentity={data.siteIdentity} />}
                <ChatWithUs />
            </div>
        </div>
    )
}

export default LandingLayout