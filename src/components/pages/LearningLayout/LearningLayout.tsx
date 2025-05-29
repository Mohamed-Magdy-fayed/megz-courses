import { ReactNode } from 'react'

import { useFCMToken } from '@/hooks/useFCMToken'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/pages/LearningLayout/app-sidebar'
import { NavBreadcrumb } from '@/components/pages/LearningLayout/nav-breadcrumb'
import { Separator } from '@/components/ui/separator'
import SidebarSekeltonMenu from '@/components/pages/sidebar/sidebar-skeleton-menu'
import SidebarSekeltonInset from '@/components/pages/sidebar/sidebar-skeleton-inset'
import { DisplayError } from '@/components/ui/display-error'

export type LearningLayoutProps = {
    children: ReactNode;
    sidebarContent?: ReactNode;
    isLoading?: boolean;
    error?: string;
}

const LearningLayout = ({ children, sidebarContent, isLoading, error }: LearningLayoutProps) => {
    useFCMToken()

    return (
        <SidebarProvider>
            <AppSidebar variant='inset' sidebarContent={isLoading ? <SidebarSekeltonMenu /> : sidebarContent} />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger />
                        <Separator orientation="vertical" className="mr-2 h-4" />
                        <NavBreadcrumb />
                    </div>
                </header>
                <div className="p-4">
                    {isLoading ? (<SidebarSekeltonInset />) : error ? <DisplayError message={error} /> : children}
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}

export default LearningLayout