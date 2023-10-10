import { ReactNode } from 'react'
import { api } from '@/lib/api'
import { LandingNavigationMenu } from './landingLayoutComponents/LandingNavMenu'
import LandingFooter from './landingLayoutComponents/LandingFooter'

const LandingLayout = ({ children }: { children: ReactNode }) => {
    const { data: courses } = api.courses.getLatest.useQuery()

    return (
        <div className='flex flex-col items-center h-screen bg-background'>
            <LandingNavigationMenu data={courses} />
            <div className='flex-grow w-full flex flex-col overflow-auto transition-all scrollbar-thin scrollbar-track-accent scrollbar-thumb-secondary'>
                <div className='flex-grow xl:px-24 px-4'>
                    {children}
                </div>
                <LandingFooter />
            </div>
        </div>
    )
}

export default LandingLayout