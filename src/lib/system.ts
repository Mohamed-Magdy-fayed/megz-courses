import { env } from "@/env.mjs";

export type SubscriptionTier = {
    name: "Starter" | "Basic" | "Professional" | "Enterprise";
    price: number;
    yearPrice: number;
    students: number;
    teamMembers: number;
    instructors: number;
    courses: number;
    storage: number;
    extraStorageCost: number;
    removeBranding: boolean;
    customDomain: boolean;
    hosting: "Shared" | "Private";
    changeRequests: number;
    support: "Community Only" | "Standard Hours" | "24/7 Priority";
    freeTraining: boolean;
    freeOnSiteTraining: boolean;
    crmFeatures: boolean;
    onlinePayment: boolean;
}

export const subscriptionTiers: {
    Starter: SubscriptionTier,
    Basic: SubscriptionTier,
    Professional: SubscriptionTier,
    Enterprise: SubscriptionTier,
} = {
    Starter: {
        name: "Starter" as "Starter" | "Basic" | "Professional" | "Enterprise",
        price: 0,
        yearPrice: 0,
        students: 20,
        teamMembers: 1,
        instructors: 2,
        courses: 3,
        storage: 5,
        extraStorageCost: 0,
        removeBranding: false,
        customDomain: false,
        hosting: "Shared",
        changeRequests: 0,
        support: "Community Only",
        freeTraining: false,
        freeOnSiteTraining: false,
        crmFeatures: false,
        onlinePayment: false,
    },
    Basic: {
        name: "Basic",
        price: 1699,
        yearPrice: 16999,
        students: 100,
        teamMembers: 3,
        instructors: 6,
        courses: 6,
        storage: 20,
        extraStorageCost: 500,
        removeBranding: false,
        customDomain: false,
        hosting: "Private",
        changeRequests: 2,
        support: "Standard Hours",
        freeTraining: false,
        freeOnSiteTraining: false,
        crmFeatures: false,
        onlinePayment: false,
    },
    Professional: {
        name: "Professional",
        price: 3499,
        yearPrice: 34999,
        students: 300,
        teamMembers: 10,
        instructors: 10,
        courses: 10,
        storage: 100,
        extraStorageCost: 500,
        removeBranding: true,
        customDomain: true,
        hosting: "Private",
        changeRequests: 3,
        support: "Standard Hours",
        freeTraining: true,
        freeOnSiteTraining: false,
        crmFeatures: true,
        onlinePayment: true,
    },
    Enterprise: {
        name: "Enterprise",
        price: 6499,
        yearPrice: 64999,
        students: Infinity,
        teamMembers: Infinity,
        instructors: Infinity,
        courses: Infinity,
        storage: 200,
        extraStorageCost: 500,
        removeBranding: true,
        customDomain: true,
        hosting: "Private",
        changeRequests: 6,
        support: "24/7 Priority",
        freeTraining: true,
        freeOnSiteTraining: true,
        crmFeatures: true,
        onlinePayment: true,
    },
};

export function getCurrentTier() {
    const tier = subscriptionTiers[env.TIER as keyof typeof subscriptionTiers];

    return {
        ...tier,
    };
}
