import { NavLink } from "@/components/layout/Drawer";
import { Certificate, Course, GoogleClient, Lead, LeadStage, MessageTemplate, MetaClient, Order, Parameters, Payment, PlacementTest, Product, Refund, SupportChat, SupportTicket, SystemForm, SystemFormSubmission, Teacher, Tester, User, UserNote, UserRoles, ZoomClient, ZoomGroup, ZoomSession } from "@prisma/client";

type PartialUser = Pick<User, "id" | "email" | "userRoles" | "userScreens">

type PermissionCheck<Key extends keyof Permissions> =
    | boolean
    | ((user: PartialUser, data: Permissions[Key]["dataType"]) => boolean)

type RolesWithPermissions = {
    [R in UserRoles]: Partial<{
        [Key in keyof Permissions]: Partial<{
            [Action in Permissions[Key]["action"]]: PermissionCheck<Key>
        }>
    }>
}

type Permissions = {
    adminLayout: {
        dataType: Partial<User>
        action: "view" | "update"
    },
    screens: {
        dataType: Partial<(NavLink & { children?: NavLink[] })>
        action: "view"
    },
    params: {
        dataType: Partial<Parameters>
        action: "view" | "create" | "update" | "delete"
    },
    supportTickets: {
        dataType: Partial<SupportTicket>
        action: "view" | "create" | "update" | "delete"
    },
    users: {
        dataType: Partial<User>
        action: "view" | "create" | "update" | "delete"
    },
    certificates: {
        dataType: Partial<Certificate>
        action: "view" | "create" | "update" | "delete"
    },
    supportChats: {
        dataType: Partial<SupportChat>
        action: "view" | "create" | "update" | "delete"
    },
    courses: {
        dataType: Partial<Course>
        action: "view" | "create" | "update" | "delete"
    },
    leads: {
        dataType: Partial<Lead>
        action: "view" | "create" | "update" | "delete"
    },
    leadStages: {
        dataType: Partial<LeadStage>
        action: "view" | "create" | "update" | "delete"
    },
    notes: {
        dataType: Partial<UserNote>
        action: "view" | "create" | "update" | "delete"
    },
    orders: {
        dataType: Partial<Order>
        action: "view" | "create" | "update" | "delete" | "pay"
    },
    zoomGroups: {
        dataType: Partial<ZoomGroup>
        action: "view" | "create" | "update" | "delete"
    },
    systemForms: {
        dataType: Partial<SystemForm>
        action: "view" | "create" | "update" | "delete"
    },
    systemFormsSubmissions: {
        dataType: Partial<SystemFormSubmission>
        action: "view" | "create" | "update" | "delete"
    },
    teacher: {
        dataType: Partial<Teacher>
        action: "view"
    },
    tester: {
        dataType: Partial<Tester>
        action: "view"
    },
    googleClients: {
        dataType: Partial<GoogleClient>
        action: "view" | "create" | "update" | "delete"
    },
    zoomClients: {
        dataType: Partial<ZoomClient>
        action: "view" | "create" | "update" | "delete"
    },
    zoomSessions: {
        dataType: Partial<ZoomSession>
        action: "view" | "create" | "update" | "delete"
    },
    metaClients: {
        dataType: Partial<MetaClient>
        action: "view" | "create" | "update" | "delete"
    },
    placementTests: {
        dataType: Partial<PlacementTest>
        action: "view" | "create" | "update" | "delete"
    },
    messageTemplates: {
        dataType: Partial<MessageTemplate>
        action: "view" | "create" | "update" | "delete"
    },
    products: {
        dataType: Partial<Product>
        action: "view" | "create" | "update" | "delete"
    },
    productItems: {
        dataType: Partial<Product>
        action: "view" | "create" | "update" | "delete"
    },
    payments: {
        dataType: Partial<Payment>
        action: "view" | "create" | "update" | "delete"
    },
    refunds: {
        dataType: Partial<Refund>
        action: "view" | "create" | "update" | "delete"
    },
}

const unrestricted = {
    create: true,
    view: true,
    update: true,
    delete: true
}

const ROLES = {
    "Admin": {
        adminLayout: { view: true, update: true },
        params: unrestricted,
        certificates: unrestricted,
        users: unrestricted,
        supportChats: unrestricted,
        courses: unrestricted,
        leads: unrestricted,
        leadStages: unrestricted,
        notes: unrestricted,
        orders: { ...unrestricted, pay: true },
        zoomGroups: unrestricted,
        systemForms: unrestricted,
        systemFormsSubmissions: unrestricted,
        googleClients: unrestricted,
        zoomClients: unrestricted,
        metaClients: unrestricted,
        teacher: { view: true },
        tester: { view: true },
        placementTests: unrestricted,
        messageTemplates: unrestricted,
        zoomSessions: unrestricted,
        screens: {
            view: ({ userScreens }, { children, url }) => {
                return !!((url && userScreens.some(s => url?.includes(s))) || (children && children.some(({ url }) => url && userScreens.some(s => url.includes(s)))))
            }
        },
        products: unrestricted,
        productItems: unrestricted,
        payments: unrestricted,
        refunds: unrestricted,
    },
    "ChatAgent": {
        adminLayout: { view: true },
        users: {
            view: true,
            update: (actioner, actioned) => actioner.id === actioned.id || actioner.email === actioned.email,
        },
        zoomGroups: unrestricted,
        notes: {
            create: true,
            view: (actioner, actioned) => (
                actioned.mentionsUserIds?.some(id => actioner.id === id)
                || actioned.createdByUserId === actioner.id
                || actioned.createdForStudentId === actioner.id
            ),
            update: (actioner, actioned) => (
                actioned.mentionsUserIds?.some(id => actioner.id === id)
                || actioned.createdByUserId === actioner.id
                || actioned.createdForStudentId === actioner.id
            ),
        },
        orders: {
            create: true,
            view: true,
            pay: true,
        },
        placementTests: { view: true, create: true },
        screens: {
            view: ({ userScreens }, { children, url }) => {
                return !!((url && userScreens.some(s => url?.includes(s))) || (children && children.some(({ url }) => url && userScreens.some(s => url.includes(s)))))
            }
        },
    },
    "OperationAgent": {
        adminLayout: { view: true },
        users: unrestricted,
        leads: { view: true },
        leadStages: unrestricted,
        zoomGroups: unrestricted,
        systemForms: unrestricted,
        systemFormsSubmissions: unrestricted,
        courses: unrestricted,
        notes: {
            create: true,
            view: true,
            update: (actioner, actioned) => (
                actioned.mentionsUserIds?.some(id => actioner.id === id)
                || actioned.createdByUserId === actioner.id
                || actioned.createdForStudentId === actioner.id
            ),
        },
        orders: {
            create: true,
            view: true,
            update: true,
            pay: true,
        },
        googleClients: unrestricted,
        zoomClients: unrestricted,
        metaClients: unrestricted,
        placementTests: { view: true, create: true, update: true, delete: true },
        messageTemplates: unrestricted,
        screens: {
            view: ({ userScreens }, { children, url }) => {
                return !!((url && userScreens.some(s => url?.includes(s))) || (children && children.some(({ url }) => url && userScreens.some(s => url.includes(s)))))
            }
        },
    },
    "SalesAgent": {
        adminLayout: { view: true },
        users: { view: true, create: true, update: true },
        leads: {
            view: true,
            create: true,
            update: (actioner, actioned) => actioner.id === actioned.assigneeId,
        },
        zoomGroups: unrestricted,
        notes: {
            create: true,
            view: (actioner, actioned) => (
                actioned.mentionsUserIds?.some(id => actioner.id === id)
                || actioned.createdByUserId === actioner.id
                || actioned.createdForStudentId === actioner.id
            ),
            update: (actioner, actioned) => (
                actioned.mentionsUserIds?.some(id => actioner.id === id)
                || actioned.createdByUserId === actioner.id
                || actioned.createdForStudentId === actioner.id
            ),
        },
        orders: {
            create: true,
            view: true,
            update: true,
            pay: true,
        },
        placementTests: { view: true, create: true, update: true, delete: true },
        screens: {
            view: ({ userScreens }, { children, url }) => {
                return !!((url && userScreens.some(s => url?.includes(s))) || (children && children.some(({ url }) => url && userScreens.some(s => url.includes(s)))))
            }
        },
    },
    "Student": {
        users: {
            view: (actioner, actioned) => actioner.id === actioned.id || actioner.email === actioned.email,
            update: (actioner, actioned) => actioner.id === actioned.id || actioner.email === actioned.email,
        },
        notes: {
            create: true,
            view: (actioner, actioned) => (
                actioned.mentionsUserIds?.some(id => actioner.id === id)
                || actioned.createdByUserId === actioner.id
                || actioned.createdForStudentId === actioner.id
            ),
        },
        orders: {
            create: true,
            view: true,
            pay: true,
        },
        placementTests: {
            view: true,
            update: (actioner, actioned) => actioned.studentUserId === actioner.id
        },
        screens: {
            view: ({ userScreens }, { children, url }) => {
                return !!((url && userScreens.some(s => url?.includes(s))) || (children && children.some(({ url }) => url && userScreens.some(s => url.includes(s)))))
            }
        },
    },
    "Teacher": {
        adminLayout: { view: true },
        users: {
            view: true,
            update: (actioner, actioned) => actioner.id === actioned.id || actioner.email === actioned.email,
        },
        teacher: { view: true },
        notes: {
            create: true,
            view: (actioner, actioned) => (
                actioned.mentionsUserIds?.some(id => actioner.id === id)
                || actioned.createdByUserId === actioner.id
                || actioned.createdForStudentId === actioner.id
            ),
            update: (actioner, actioned) => (
                actioned.mentionsUserIds?.some(id => actioner.id === id)
                || actioned.createdByUserId === actioner.id
                || actioned.createdForStudentId === actioner.id
            ),
        },
        placementTests: { view: true },
        screens: {
            view: ({ userScreens }, { children, url }) => {
                return !!((url && userScreens.some(s => url?.includes(s))) || (children && children.some(({ url }) => url && userScreens.some(s => url.includes(s)))))
            }
        },
    },
    "Tester": {
        adminLayout: { view: true },
        users: {
            view: true,
            update: (actioner, actioned) => actioner.id === actioned.id || actioner.email === actioned.email,
        },
        tester: { view: true },
        notes: {
            create: true,
            view: (actioner, actioned) => (
                actioned.mentionsUserIds?.some(id => actioner.id === id)
                || actioned.createdByUserId === actioner.id
                || actioned.createdForStudentId === actioner.id
            ),
            update: (actioner, actioned) => (
                actioned.mentionsUserIds?.some(id => actioner.id === id)
                || actioned.createdByUserId === actioner.id
                || actioned.createdForStudentId === actioner.id
            ),
        },
        placementTests: {
            create: true, view: true, delete: true,
            update: (actioner, actioned) => actioned.studentUserId === actioner.id,
        },
        screens: {
            view: ({ userScreens }, { children, url }) => {
                return !!((url && userScreens.some(s => url?.includes(s))) || (children && children.some(({ url }) => url && userScreens.some(s => url.includes(s)))))
            }
        },
    },
} as const satisfies RolesWithPermissions

export function hasPermission<Resource extends keyof Permissions>(
    user: PartialUser,
    resource: Resource,
    action: Permissions[Resource]["action"],
    data?: Permissions[Resource]["dataType"]
) {
    return user.userRoles.some(role => {
        const permission = (ROLES as RolesWithPermissions)[role][resource]?.[action]
        if (permission == null) return false

        if (typeof permission === "boolean") return permission
        return data != null && permission(user, data)
    })
}
