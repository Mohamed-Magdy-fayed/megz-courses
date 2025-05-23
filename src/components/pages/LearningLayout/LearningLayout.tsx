import { ReactNode } from 'react'
import { useFCMToken } from '@/hooks/useFCMToken'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/pages/LearningLayout/app-sidebar'
import { NavBreadcrumb } from '@/components/pages/LearningLayout/nav-breadcrumb'
import { Separator } from '@/components/ui/separator'

export type LearningLayoutProps = {
    children: ReactNode;
    sidebarContent?: ReactNode;
}

const LearningLayout = ({ children, sidebarContent }: LearningLayoutProps) => {
    useFCMToken()

    return (
        <SidebarProvider>
            <style>{`body { overflow-x: auto !important; overflow-y: auto !important; }`}</style>
            <AppSidebar variant='inset' sidebarContent={sidebarContent} />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger />
                        <Separator orientation="vertical" className="mr-2 h-4" />
                        <NavBreadcrumb />
                    </div>
                </header>
                <div className="p-4">{children}</div>
            </SidebarInset>
        </SidebarProvider>
    )
}

export default LearningLayout