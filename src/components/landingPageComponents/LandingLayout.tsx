import { ReactNode } from 'react'
import { LandingNavigationMenu } from './LandingNavMenu'
import LandingFooter from './LandingFooter'

const LandingLayout = ({ children }: { children: ReactNode }) => {
    return (
        <div className='flex flex-col items-center h-screen bg-background'>
            <LandingNavigationMenu />
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