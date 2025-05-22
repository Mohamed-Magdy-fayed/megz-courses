import { type LucideIcon, LayoutDashboardIcon, ClipboardListIcon, StickyNoteIcon, Users2Icon, ListChecksIcon, FileSearchIcon, CalendarClockIcon, TrendingUpIcon, ReceiptIcon, UserPlusIcon, UsersIcon, GraduationCapIcon, UserCogIcon, CircuitBoardIcon, UserCircleIcon, SlidersHorizontalIcon, Settings2Icon, FileStackIcon, PackageOpenIcon, ShieldCheckIcon, FileTextIcon, BookOpenIcon, LifeBuoyIcon } from "lucide-react";

export type NavLink = { label: string; url?: string; icon?: LucideIcon }

export const mainNavLinks: (NavLink & { children?: NavLink[] })[] = [
    {
        icon: LayoutDashboardIcon,
        label: "Dashboard",
        url: "/admin/dashboard",
    },
    {
        icon: ClipboardListIcon,
        label: "Operations Management",
        children: [
            {
                icon: StickyNoteIcon,
                label: "Notes",
                url: "/admin/operations_management/notes",
            },
            {
                icon: Users2Icon,
                label: "Groups",
                url: "/admin/operations_management/groups",
            },
            {
                icon: ListChecksIcon,
                label: "Trainee Lists",
                url: "/admin/operations_management/trainee_lists",
            },
            {
                icon: FileSearchIcon,
                label: "Placement Tests",
                url: "/admin/operations_management/placement_tests",
            },
            {
                icon: CalendarClockIcon,
                label: "Sessions",
                url: "/admin/operations_management/sessions",
            },
        ],
    },
    {
        icon: TrendingUpIcon,
        label: "Sales Management",
        children: [
            {
                icon: ReceiptIcon,
                label: "Orders",
                url: "/admin/sales_management/orders",
            },
            {
                icon: UserPlusIcon,
                label: "Leads",
                url: "/admin/sales_management/leads",
            },
        ],
    },
    {
        icon: UsersIcon,
        label: "Users Management",
        children: [
            {
                icon: GraduationCapIcon,
                label: "Students",
                url: "/admin/users_management/students",
            },
            {
                icon: UserCogIcon,
                label: "Operational Team",
                url: "/admin/users_management/ops_team",
            },
            {
                icon: CircuitBoardIcon,
                label: "Educational Team",
                url: "/admin/users_management/edu_team",
            },
            // {
            // icon: LayoutDashboardIcon,  
            // label: "Chat Team",
            //   url: "/admin/users_management/chat_agents",
            // },
            {
                icon: UserCircleIcon,
                label: "Account",
                url: "/admin/users_management/account",
            },
        ],
    },
    {
        icon: SlidersHorizontalIcon,
        label: "System Management",
        children: [
            {
                icon: Settings2Icon,
                label: "Configurations",
                url: "/admin/system_management/config",
            },
            {
                icon: FileStackIcon,
                label: "Content Management",
                url: "/admin/system_management/content",
            },
            {
                icon: PackageOpenIcon,
                label: "Products Management",
                url: "/admin/system_management/products",
            },
        ],
    },
    {
        label: "General",
        children: [
            {
                icon: ShieldCheckIcon,
                label: "Privacy Policy",
                url: "/privacy",
            },
            {
                icon: FileTextIcon,
                label: "Terms of Use",
                url: "/terms",
            },
            {
                icon: BookOpenIcon,
                label: "Documentation",
                url: "/documentation",
            },
            {
                icon: LifeBuoyIcon,
                label: "Support",
                url: "/support",
            },
            // {
            //   label: "Tickets",
            //   url: "/admin/tickets",
            // },
        ],
    },
];