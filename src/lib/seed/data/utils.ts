// Extended list of Egyptian female names
export const femaleNames = [
    "Fatma", "Aisha", "Hanan", "Mona", "Nour", "Sara", "Laila", "Yasmin", "Hoda", "Amira",
    "Rania", "Dina", "Shimaa", "Heba", "Marwa", "Nahla", "Eman", "Ghada", "Nadia", "Rasha",
    "Salma", "Aya", "Reem", "Doaa", "Nermine", "Sahar", "Niveen", "Hadeer", "Manar", "Riham"
];

// Extended list of Egyptian male names
export const maleNames = [
    "Ahmed", "Mohamed", "Omar", "Youssef", "Ali", "Hassan", "Ibrahim", "Khaled", "Tarek", "Mostafa",
    "Mahmoud", "Amr", "Karim", "Sherif", "Walid", "Adel", "Saad", "Fady", "Hany", "Ashraf",
    "Ehab", "Gamal", "Samir", "Nader", "Bassem", "Tamer", "Ziad", "Ramy", "Ayman", "Hesham"
];

// Array of possible reminder titles related to the sales process
export const reminderTitles = [
    "Follow up on pricing discussion",
    "Check in after product demo",
    "Send updated proposal document",
    "Call to confirm decision timeline",
    "Remind lead about trial expiration",
    "Schedule onboarding call",
    "Share case study with technical team",
    "Follow up on contract signature",
    "Send thank-you note after meeting",
    "Verify lead's budget approval status"
];

// Array of possible lead labels
export const leadLabelValues = [
    "Price-Sensitive",
    "High-Intent Buyer",
    "Researching Options",
    "Referral Lead",
    "Cold Lead",
    "Repeat Customer",
    "Upsell Opportunity",
    "Churn Risk",
    "Decision Maker",
    "Influencer"
];

// Array of possible lead notes
export const leadNotes = [
    "Spoke with the lead yesterday, interested but needs internal approval.",
    "Client requested a call back next week after budget review.",
    "Very engaged during demo, asked detailed product questions.",
    "Mentioned competitor pricing—consider offering a discount.",
    "Follow up after their Q2 planning meeting (around May 15).",
    "Decision maker is the CTO, not the person we spoke with.",
    "Requested case studies before proceeding further.",
    "Seems unsure about our integration capabilities—send documentation.",
    "Lead is part of a partner company—treat as high priority.",
    "Send a personal thank-you message, they appreciated the support."
];

export const interactionOutcomes = [
    "Interested – Next steps scheduled",
    "Needs more information",
    "Follow-up required",
    "Not interested at this time",
    "Left voicemail / No response",
    "Requested a demo",
    "Referred to another decision maker",
    "Budget not approved",
    "Deal closed – Won",
    "Deal closed – Lost"
];

export const oralTestFeedbackOutcomes = [
    "Excellent performance – Confident, fluent, and accurate\nNo major issues observed",
    "Good communication – Minor grammar or pronunciation issues\nShows strong potential",
    "Understands well – Hesitant speaking and limited fluency\nNeeds more spontaneous practice",
    "Accurate but slow – Structured responses with long pauses\nFocus on improving speed and flow",
    "Fluent but inaccurate – Speaks easily but with grammar or word choice errors\nRequires grammar review",
    "Limited vocabulary – Struggles to express ideas\nNeeds more exposure to topic-specific terms",
    "Unclear pronunciation – Understandable with effort\nPronunciation and intonation need attention",
    "Low confidence – Understands questions but avoids speaking\nEncouraged to build confidence through practice",
    "Minimal participation – Gave short or off-topic answers\nNeeds more preparation and engagement",
    "Did not attend or complete test – Unable to evaluate performance"
];

export const deviceDistribution = [
    { value: "Mobile", weight: 48 },
    { value: "Tablet", weight: 24 },
    { value: "Desktop", weight: 38 }
];

export const orderStatusDistribution = [
    { value: "Paid", weight: 75.55 },
    { value: "Pending", weight: 13.50 },
    { value: "Cancelled", weight: 5.20 },
    { value: "Refunded", weight: 5.75 }
] as const;
