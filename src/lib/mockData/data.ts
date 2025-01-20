import { generateTimestamps } from "@/lib/mockData/dataGenerators";
import { ItemQuestionType, ItemType, QuestionChoiceType, SystemFormTypes, UserRoles } from "@prisma/client";

export const courses = [
    {
        name: 'English for Travel',
        slug: 'english-for-travel',
        image: '/public/contact_us_large.png',
        description: 'Learn essential phrases and vocabulary for traveling abroad.',
        groupPrice: 600, privatePrice: 1500, instructorPrice: 1200,
        levels: [
            {
                name: 'Travel Essentials', slug: 'travel-essentials', materials: [
                    {
                        title: 'Common Travel Phrases',
                        subTitle: 'Essential phrases for airport, hotel, and transportation.',
                        slug: 'common-travel-phrases',
                        levelSlug: 'travel-essentials',
                        uploads: ['phrasebook.pdf', 'audio-guide.mp3'],
                    },
                    {
                        title: 'Hotel Booking Vocabulary',
                        subTitle: 'Key terms and phrases for reserving accommodations.',
                        slug: 'hotel-booking-vocabulary',
                        levelSlug: 'travel-essentials',
                        uploads: ['vocabulary-list.pdf', 'dialogue-samples.mp3'],
                    },
                    {
                        title: 'Airport Navigation Guide',
                        subTitle: 'Learn English for navigating through airports.',
                        slug: 'airport-navigation-guide',
                        levelSlug: 'travel-essentials',
                        uploads: ['navigation-tips.pdf', 'interactive-map.html'],
                    },
                    {
                        title: 'Restaurant English Basics',
                        subTitle: 'Phrases to order food and understand menus.',
                        slug: 'restaurant-english-basics',
                        levelSlug: 'travel-essentials',
                        uploads: ['menu-guide.pdf', 'dialogue-practice.mp3'],
                    },
                    {
                        title: 'Transportation Vocabulary',
                        subTitle: 'Words and phrases for buses, trains, and taxis.',
                        slug: 'transportation-vocabulary',
                        levelSlug: 'travel-essentials',
                        uploads: ['transport-vocab.pdf', 'roleplay.mp3'],
                    },
                    {
                        title: 'Cultural Tips for Travelers',
                        subTitle: 'Advice on cultural norms and etiquette.',
                        slug: 'cultural-tips-for-travelers',
                        levelSlug: 'travel-essentials',
                        uploads: ['cultural-guide.pdf', 'tips-video.mp4'],
                    },
                ],
            },
            {
                name: 'Advanced Travel English', slug: 'advanced-travel-english', materials: [
                    {
                        title: 'Common Travel Phrases',
                        subTitle: 'Essential phrases for airport, hotel, and transportation.',
                        slug: 'common-travel-phrases',
                        levelSlug: 'travel-essentials',
                        uploads: ['phrasebook.pdf', 'audio-guide.mp3'],
                    },
                    {
                        title: 'Hotel Booking Vocabulary',
                        subTitle: 'Key terms and phrases for reserving accommodations.',
                        slug: 'hotel-booking-vocabulary',
                        levelSlug: 'travel-essentials',
                        uploads: ['vocabulary-list.pdf', 'dialogue-samples.mp3'],
                    },
                    {
                        title: 'Airport Navigation Guide',
                        subTitle: 'Learn English for navigating through airports.',
                        slug: 'airport-navigation-guide',
                        levelSlug: 'travel-essentials',
                        uploads: ['navigation-tips.pdf', 'interactive-map.html'],
                    },
                    {
                        title: 'Restaurant English Basics',
                        subTitle: 'Phrases to order food and understand menus.',
                        slug: 'restaurant-english-basics',
                        levelSlug: 'travel-essentials',
                        uploads: ['menu-guide.pdf', 'dialogue-practice.mp3'],
                    },
                    {
                        title: 'Transportation Vocabulary',
                        subTitle: 'Words and phrases for buses, trains, and taxis.',
                        slug: 'transportation-vocabulary',
                        levelSlug: 'travel-essentials',
                        uploads: ['transport-vocab.pdf', 'roleplay.mp3'],
                    },
                    {
                        title: 'Cultural Tips for Travelers',
                        subTitle: 'Advice on cultural norms and etiquette.',
                        slug: 'cultural-tips-for-travelers',
                        levelSlug: 'travel-essentials',
                        uploads: ['cultural-guide.pdf', 'tips-video.mp4'],
                    },
                ],
            },
            {
                name: 'Cultural Immersion in English', slug: 'cultural-immersion', materials: [
                    {
                        title: 'Common Travel Phrases',
                        subTitle: 'Essential phrases for airport, hotel, and transportation.',
                        slug: 'common-travel-phrases',
                        levelSlug: 'travel-essentials',
                        uploads: ['phrasebook.pdf', 'audio-guide.mp3'],
                    },
                    {
                        title: 'Hotel Booking Vocabulary',
                        subTitle: 'Key terms and phrases for reserving accommodations.',
                        slug: 'hotel-booking-vocabulary',
                        levelSlug: 'travel-essentials',
                        uploads: ['vocabulary-list.pdf', 'dialogue-samples.mp3'],
                    },
                    {
                        title: 'Airport Navigation Guide',
                        subTitle: 'Learn English for navigating through airports.',
                        slug: 'airport-navigation-guide',
                        levelSlug: 'travel-essentials',
                        uploads: ['navigation-tips.pdf', 'interactive-map.html'],
                    },
                    {
                        title: 'Restaurant English Basics',
                        subTitle: 'Phrases to order food and understand menus.',
                        slug: 'restaurant-english-basics',
                        levelSlug: 'travel-essentials',
                        uploads: ['menu-guide.pdf', 'dialogue-practice.mp3'],
                    },
                    {
                        title: 'Transportation Vocabulary',
                        subTitle: 'Words and phrases for buses, trains, and taxis.',
                        slug: 'transportation-vocabulary',
                        levelSlug: 'travel-essentials',
                        uploads: ['transport-vocab.pdf', 'roleplay.mp3'],
                    },
                    {
                        title: 'Cultural Tips for Travelers',
                        subTitle: 'Advice on cultural norms and etiquette.',
                        slug: 'cultural-tips-for-travelers',
                        levelSlug: 'travel-essentials',
                        uploads: ['cultural-guide.pdf', 'tips-video.mp4'],
                    },
                ],
            }
        ],
        ...generateTimestamps()
    },
    {
        name: 'English for Business Communication',
        slug: 'english-for-business-communication',
        image: '/public/contact_us_large.png',
        description: 'Master business English and improve your communication skills in professional settings.',
        groupPrice: 1100, privatePrice: 2500, instructorPrice: 2000,
        levels: [
            {
                name: 'Business English Basics', slug: 'business-english-basics', materials: [
                    {
                        title: 'Common Travel Phrases',
                        subTitle: 'Essential phrases for airport, hotel, and transportation.',
                        slug: 'common-travel-phrases',
                        levelSlug: 'travel-essentials',
                        uploads: ['phrasebook.pdf', 'audio-guide.mp3'],
                    },
                    {
                        title: 'Hotel Booking Vocabulary',
                        subTitle: 'Key terms and phrases for reserving accommodations.',
                        slug: 'hotel-booking-vocabulary',
                        levelSlug: 'travel-essentials',
                        uploads: ['vocabulary-list.pdf', 'dialogue-samples.mp3'],
                    },
                    {
                        title: 'Airport Navigation Guide',
                        subTitle: 'Learn English for navigating through airports.',
                        slug: 'airport-navigation-guide',
                        levelSlug: 'travel-essentials',
                        uploads: ['navigation-tips.pdf', 'interactive-map.html'],
                    },
                    {
                        title: 'Restaurant English Basics',
                        subTitle: 'Phrases to order food and understand menus.',
                        slug: 'restaurant-english-basics',
                        levelSlug: 'travel-essentials',
                        uploads: ['menu-guide.pdf', 'dialogue-practice.mp3'],
                    },
                    {
                        title: 'Transportation Vocabulary',
                        subTitle: 'Words and phrases for buses, trains, and taxis.',
                        slug: 'transportation-vocabulary',
                        levelSlug: 'travel-essentials',
                        uploads: ['transport-vocab.pdf', 'roleplay.mp3'],
                    },
                    {
                        title: 'Cultural Tips for Travelers',
                        subTitle: 'Advice on cultural norms and etiquette.',
                        slug: 'cultural-tips-for-travelers',
                        levelSlug: 'travel-essentials',
                        uploads: ['cultural-guide.pdf', 'tips-video.mp4'],
                    },
                ],
            },
            {
                name: 'Intermediate Business English', slug: 'intermediate-business-english', materials: [
                    {
                        title: 'Common Travel Phrases',
                        subTitle: 'Essential phrases for airport, hotel, and transportation.',
                        slug: 'common-travel-phrases',
                        levelSlug: 'travel-essentials',
                        uploads: ['phrasebook.pdf', 'audio-guide.mp3'],
                    },
                    {
                        title: 'Hotel Booking Vocabulary',
                        subTitle: 'Key terms and phrases for reserving accommodations.',
                        slug: 'hotel-booking-vocabulary',
                        levelSlug: 'travel-essentials',
                        uploads: ['vocabulary-list.pdf', 'dialogue-samples.mp3'],
                    },
                    {
                        title: 'Airport Navigation Guide',
                        subTitle: 'Learn English for navigating through airports.',
                        slug: 'airport-navigation-guide',
                        levelSlug: 'travel-essentials',
                        uploads: ['navigation-tips.pdf', 'interactive-map.html'],
                    },
                    {
                        title: 'Restaurant English Basics',
                        subTitle: 'Phrases to order food and understand menus.',
                        slug: 'restaurant-english-basics',
                        levelSlug: 'travel-essentials',
                        uploads: ['menu-guide.pdf', 'dialogue-practice.mp3'],
                    },
                    {
                        title: 'Transportation Vocabulary',
                        subTitle: 'Words and phrases for buses, trains, and taxis.',
                        slug: 'transportation-vocabulary',
                        levelSlug: 'travel-essentials',
                        uploads: ['transport-vocab.pdf', 'roleplay.mp3'],
                    },
                    {
                        title: 'Cultural Tips for Travelers',
                        subTitle: 'Advice on cultural norms and etiquette.',
                        slug: 'cultural-tips-for-travelers',
                        levelSlug: 'travel-essentials',
                        uploads: ['cultural-guide.pdf', 'tips-video.mp4'],
                    },
                ],
            },
            {
                name: 'Advanced Business Communication', slug: 'advanced-business-communication', materials: [
                    {
                        title: 'Common Travel Phrases',
                        subTitle: 'Essential phrases for airport, hotel, and transportation.',
                        slug: 'common-travel-phrases',
                        levelSlug: 'travel-essentials',
                        uploads: ['phrasebook.pdf', 'audio-guide.mp3'],
                    },
                    {
                        title: 'Hotel Booking Vocabulary',
                        subTitle: 'Key terms and phrases for reserving accommodations.',
                        slug: 'hotel-booking-vocabulary',
                        levelSlug: 'travel-essentials',
                        uploads: ['vocabulary-list.pdf', 'dialogue-samples.mp3'],
                    },
                    {
                        title: 'Airport Navigation Guide',
                        subTitle: 'Learn English for navigating through airports.',
                        slug: 'airport-navigation-guide',
                        levelSlug: 'travel-essentials',
                        uploads: ['navigation-tips.pdf', 'interactive-map.html'],
                    },
                    {
                        title: 'Restaurant English Basics',
                        subTitle: 'Phrases to order food and understand menus.',
                        slug: 'restaurant-english-basics',
                        levelSlug: 'travel-essentials',
                        uploads: ['menu-guide.pdf', 'dialogue-practice.mp3'],
                    },
                    {
                        title: 'Transportation Vocabulary',
                        subTitle: 'Words and phrases for buses, trains, and taxis.',
                        slug: 'transportation-vocabulary',
                        levelSlug: 'travel-essentials',
                        uploads: ['transport-vocab.pdf', 'roleplay.mp3'],
                    },
                    {
                        title: 'Cultural Tips for Travelers',
                        subTitle: 'Advice on cultural norms and etiquette.',
                        slug: 'cultural-tips-for-travelers',
                        levelSlug: 'travel-essentials',
                        uploads: ['cultural-guide.pdf', 'tips-video.mp4'],
                    },
                ],
            }
        ],
        ...generateTimestamps()
    },
    {
        name: 'English for Workplace Success',
        slug: 'english-for-workplace-success',
        image: '/public/contact_us_large.png',
        description: 'Develop English skills tailored to workplace success and career advancement.',
        groupPrice: 800, privatePrice: 2000, instructorPrice: 1600,
        levels: [
            {
                name: 'Professional English', slug: 'professional-english', materials: [
                    {
                        title: 'Common Travel Phrases',
                        subTitle: 'Essential phrases for airport, hotel, and transportation.',
                        slug: 'common-travel-phrases',
                        levelSlug: 'travel-essentials',
                        uploads: ['phrasebook.pdf', 'audio-guide.mp3'],
                    },
                    {
                        title: 'Hotel Booking Vocabulary',
                        subTitle: 'Key terms and phrases for reserving accommodations.',
                        slug: 'hotel-booking-vocabulary',
                        levelSlug: 'travel-essentials',
                        uploads: ['vocabulary-list.pdf', 'dialogue-samples.mp3'],
                    },
                    {
                        title: 'Airport Navigation Guide',
                        subTitle: 'Learn English for navigating through airports.',
                        slug: 'airport-navigation-guide',
                        levelSlug: 'travel-essentials',
                        uploads: ['navigation-tips.pdf', 'interactive-map.html'],
                    },
                    {
                        title: 'Restaurant English Basics',
                        subTitle: 'Phrases to order food and understand menus.',
                        slug: 'restaurant-english-basics',
                        levelSlug: 'travel-essentials',
                        uploads: ['menu-guide.pdf', 'dialogue-practice.mp3'],
                    },
                    {
                        title: 'Transportation Vocabulary',
                        subTitle: 'Words and phrases for buses, trains, and taxis.',
                        slug: 'transportation-vocabulary',
                        levelSlug: 'travel-essentials',
                        uploads: ['transport-vocab.pdf', 'roleplay.mp3'],
                    },
                    {
                        title: 'Cultural Tips for Travelers',
                        subTitle: 'Advice on cultural norms and etiquette.',
                        slug: 'cultural-tips-for-travelers',
                        levelSlug: 'travel-essentials',
                        uploads: ['cultural-guide.pdf', 'tips-video.mp4'],
                    },
                ],
            },
            {
                name: 'English for Career Advancement', slug: 'english-for-career-advancement', materials: [
                    {
                        title: 'Common Travel Phrases',
                        subTitle: 'Essential phrases for airport, hotel, and transportation.',
                        slug: 'common-travel-phrases',
                        levelSlug: 'travel-essentials',
                        uploads: ['phrasebook.pdf', 'audio-guide.mp3'],
                    },
                    {
                        title: 'Hotel Booking Vocabulary',
                        subTitle: 'Key terms and phrases for reserving accommodations.',
                        slug: 'hotel-booking-vocabulary',
                        levelSlug: 'travel-essentials',
                        uploads: ['vocabulary-list.pdf', 'dialogue-samples.mp3'],
                    },
                    {
                        title: 'Airport Navigation Guide',
                        subTitle: 'Learn English for navigating through airports.',
                        slug: 'airport-navigation-guide',
                        levelSlug: 'travel-essentials',
                        uploads: ['navigation-tips.pdf', 'interactive-map.html'],
                    },
                    {
                        title: 'Restaurant English Basics',
                        subTitle: 'Phrases to order food and understand menus.',
                        slug: 'restaurant-english-basics',
                        levelSlug: 'travel-essentials',
                        uploads: ['menu-guide.pdf', 'dialogue-practice.mp3'],
                    },
                    {
                        title: 'Transportation Vocabulary',
                        subTitle: 'Words and phrases for buses, trains, and taxis.',
                        slug: 'transportation-vocabulary',
                        levelSlug: 'travel-essentials',
                        uploads: ['transport-vocab.pdf', 'roleplay.mp3'],
                    },
                    {
                        title: 'Cultural Tips for Travelers',
                        subTitle: 'Advice on cultural norms and etiquette.',
                        slug: 'cultural-tips-for-travelers',
                        levelSlug: 'travel-essentials',
                        uploads: ['cultural-guide.pdf', 'tips-video.mp4'],
                    },
                ],
            },
            {
                name: 'Advanced Workplace English', slug: 'advanced-workplace-english', materials: [
                    {
                        title: 'Common Travel Phrases',
                        subTitle: 'Essential phrases for airport, hotel, and transportation.',
                        slug: 'common-travel-phrases',
                        levelSlug: 'travel-essentials',
                        uploads: ['phrasebook.pdf', 'audio-guide.mp3'],
                    },
                    {
                        title: 'Hotel Booking Vocabulary',
                        subTitle: 'Key terms and phrases for reserving accommodations.',
                        slug: 'hotel-booking-vocabulary',
                        levelSlug: 'travel-essentials',
                        uploads: ['vocabulary-list.pdf', 'dialogue-samples.mp3'],
                    },
                    {
                        title: 'Airport Navigation Guide',
                        subTitle: 'Learn English for navigating through airports.',
                        slug: 'airport-navigation-guide',
                        levelSlug: 'travel-essentials',
                        uploads: ['navigation-tips.pdf', 'interactive-map.html'],
                    },
                    {
                        title: 'Restaurant English Basics',
                        subTitle: 'Phrases to order food and understand menus.',
                        slug: 'restaurant-english-basics',
                        levelSlug: 'travel-essentials',
                        uploads: ['menu-guide.pdf', 'dialogue-practice.mp3'],
                    },
                    {
                        title: 'Transportation Vocabulary',
                        subTitle: 'Words and phrases for buses, trains, and taxis.',
                        slug: 'transportation-vocabulary',
                        levelSlug: 'travel-essentials',
                        uploads: ['transport-vocab.pdf', 'roleplay.mp3'],
                    },
                    {
                        title: 'Cultural Tips for Travelers',
                        subTitle: 'Advice on cultural norms and etiquette.',
                        slug: 'cultural-tips-for-travelers',
                        levelSlug: 'travel-essentials',
                        uploads: ['cultural-guide.pdf', 'tips-video.mp4'],
                    },
                ],
            }
        ],
        ...generateTimestamps()
    },
    {
        name: 'Conversational English',
        slug: 'conversational-english',
        image: '/public/contact_us_large.png',
        description: 'Engage in everyday conversations in English with confidence.',
        groupPrice: 1000, privatePrice: 3000, instructorPrice: 2400,
        levels: [
            {
                name: 'Basic Conversational English', slug: 'basic-conversational', materials: [
                    {
                        title: 'Common Travel Phrases',
                        subTitle: 'Essential phrases for airport, hotel, and transportation.',
                        slug: 'common-travel-phrases',
                        levelSlug: 'travel-essentials',
                        uploads: ['phrasebook.pdf', 'audio-guide.mp3'],
                    },
                    {
                        title: 'Hotel Booking Vocabulary',
                        subTitle: 'Key terms and phrases for reserving accommodations.',
                        slug: 'hotel-booking-vocabulary',
                        levelSlug: 'travel-essentials',
                        uploads: ['vocabulary-list.pdf', 'dialogue-samples.mp3'],
                    },
                    {
                        title: 'Airport Navigation Guide',
                        subTitle: 'Learn English for navigating through airports.',
                        slug: 'airport-navigation-guide',
                        levelSlug: 'travel-essentials',
                        uploads: ['navigation-tips.pdf', 'interactive-map.html'],
                    },
                    {
                        title: 'Restaurant English Basics',
                        subTitle: 'Phrases to order food and understand menus.',
                        slug: 'restaurant-english-basics',
                        levelSlug: 'travel-essentials',
                        uploads: ['menu-guide.pdf', 'dialogue-practice.mp3'],
                    },
                    {
                        title: 'Transportation Vocabulary',
                        subTitle: 'Words and phrases for buses, trains, and taxis.',
                        slug: 'transportation-vocabulary',
                        levelSlug: 'travel-essentials',
                        uploads: ['transport-vocab.pdf', 'roleplay.mp3'],
                    },
                    {
                        title: 'Cultural Tips for Travelers',
                        subTitle: 'Advice on cultural norms and etiquette.',
                        slug: 'cultural-tips-for-travelers',
                        levelSlug: 'travel-essentials',
                        uploads: ['cultural-guide.pdf', 'tips-video.mp4'],
                    },
                ],
            },
            {
                name: 'Intermediate Conversations', slug: 'intermediate-conversations', materials: [
                    {
                        title: 'Common Travel Phrases',
                        subTitle: 'Essential phrases for airport, hotel, and transportation.',
                        slug: 'common-travel-phrases',
                        levelSlug: 'travel-essentials',
                        uploads: ['phrasebook.pdf', 'audio-guide.mp3'],
                    },
                    {
                        title: 'Hotel Booking Vocabulary',
                        subTitle: 'Key terms and phrases for reserving accommodations.',
                        slug: 'hotel-booking-vocabulary',
                        levelSlug: 'travel-essentials',
                        uploads: ['vocabulary-list.pdf', 'dialogue-samples.mp3'],
                    },
                    {
                        title: 'Airport Navigation Guide',
                        subTitle: 'Learn English for navigating through airports.',
                        slug: 'airport-navigation-guide',
                        levelSlug: 'travel-essentials',
                        uploads: ['navigation-tips.pdf', 'interactive-map.html'],
                    },
                    {
                        title: 'Restaurant English Basics',
                        subTitle: 'Phrases to order food and understand menus.',
                        slug: 'restaurant-english-basics',
                        levelSlug: 'travel-essentials',
                        uploads: ['menu-guide.pdf', 'dialogue-practice.mp3'],
                    },
                    {
                        title: 'Transportation Vocabulary',
                        subTitle: 'Words and phrases for buses, trains, and taxis.',
                        slug: 'transportation-vocabulary',
                        levelSlug: 'travel-essentials',
                        uploads: ['transport-vocab.pdf', 'roleplay.mp3'],
                    },
                    {
                        title: 'Cultural Tips for Travelers',
                        subTitle: 'Advice on cultural norms and etiquette.',
                        slug: 'cultural-tips-for-travelers',
                        levelSlug: 'travel-essentials',
                        uploads: ['cultural-guide.pdf', 'tips-video.mp4'],
                    },
                ],
            },
            {
                name: 'Advanced English Conversations', slug: 'advanced-conversations', materials: [
                    {
                        title: 'Common Travel Phrases',
                        subTitle: 'Essential phrases for airport, hotel, and transportation.',
                        slug: 'common-travel-phrases',
                        levelSlug: 'travel-essentials',
                        uploads: ['phrasebook.pdf', 'audio-guide.mp3'],
                    },
                    {
                        title: 'Hotel Booking Vocabulary',
                        subTitle: 'Key terms and phrases for reserving accommodations.',
                        slug: 'hotel-booking-vocabulary',
                        levelSlug: 'travel-essentials',
                        uploads: ['vocabulary-list.pdf', 'dialogue-samples.mp3'],
                    },
                    {
                        title: 'Airport Navigation Guide',
                        subTitle: 'Learn English for navigating through airports.',
                        slug: 'airport-navigation-guide',
                        levelSlug: 'travel-essentials',
                        uploads: ['navigation-tips.pdf', 'interactive-map.html'],
                    },
                    {
                        title: 'Restaurant English Basics',
                        subTitle: 'Phrases to order food and understand menus.',
                        slug: 'restaurant-english-basics',
                        levelSlug: 'travel-essentials',
                        uploads: ['menu-guide.pdf', 'dialogue-practice.mp3'],
                    },
                    {
                        title: 'Transportation Vocabulary',
                        subTitle: 'Words and phrases for buses, trains, and taxis.',
                        slug: 'transportation-vocabulary',
                        levelSlug: 'travel-essentials',
                        uploads: ['transport-vocab.pdf', 'roleplay.mp3'],
                    },
                    {
                        title: 'Cultural Tips for Travelers',
                        subTitle: 'Advice on cultural norms and etiquette.',
                        slug: 'cultural-tips-for-travelers',
                        levelSlug: 'travel-essentials',
                        uploads: ['cultural-guide.pdf', 'tips-video.mp4'],
                    },
                ],
            }
        ],
        ...generateTimestamps()
    },
    {
        name: 'English for Socializing',
        slug: 'english-for-socializing',
        image: '/public/contact_us_large.png',
        description: 'Learn English to make friends, socialize, and engage in casual conversations.',
        groupPrice: 500, privatePrice: 1200, instructorPrice: 950,
        levels: [
            {
                name: 'Social English Basics', slug: 'social-english-basics', materials: [
                    {
                        title: 'Common Travel Phrases',
                        subTitle: 'Essential phrases for airport, hotel, and transportation.',
                        slug: 'common-travel-phrases',
                        levelSlug: 'travel-essentials',
                        uploads: ['phrasebook.pdf', 'audio-guide.mp3'],
                    },
                    {
                        title: 'Hotel Booking Vocabulary',
                        subTitle: 'Key terms and phrases for reserving accommodations.',
                        slug: 'hotel-booking-vocabulary',
                        levelSlug: 'travel-essentials',
                        uploads: ['vocabulary-list.pdf', 'dialogue-samples.mp3'],
                    },
                    {
                        title: 'Airport Navigation Guide',
                        subTitle: 'Learn English for navigating through airports.',
                        slug: 'airport-navigation-guide',
                        levelSlug: 'travel-essentials',
                        uploads: ['navigation-tips.pdf', 'interactive-map.html'],
                    },
                    {
                        title: 'Restaurant English Basics',
                        subTitle: 'Phrases to order food and understand menus.',
                        slug: 'restaurant-english-basics',
                        levelSlug: 'travel-essentials',
                        uploads: ['menu-guide.pdf', 'dialogue-practice.mp3'],
                    },
                    {
                        title: 'Transportation Vocabulary',
                        subTitle: 'Words and phrases for buses, trains, and taxis.',
                        slug: 'transportation-vocabulary',
                        levelSlug: 'travel-essentials',
                        uploads: ['transport-vocab.pdf', 'roleplay.mp3'],
                    },
                    {
                        title: 'Cultural Tips for Travelers',
                        subTitle: 'Advice on cultural norms and etiquette.',
                        slug: 'cultural-tips-for-travelers',
                        levelSlug: 'travel-essentials',
                        uploads: ['cultural-guide.pdf', 'tips-video.mp4'],
                    },
                ],
            },
            {
                name: 'Intermediate Socializing Skills', slug: 'intermediate-socializing', materials: [
                    {
                        title: 'Common Travel Phrases',
                        subTitle: 'Essential phrases for airport, hotel, and transportation.',
                        slug: 'common-travel-phrases',
                        levelSlug: 'travel-essentials',
                        uploads: ['phrasebook.pdf', 'audio-guide.mp3'],
                    },
                    {
                        title: 'Hotel Booking Vocabulary',
                        subTitle: 'Key terms and phrases for reserving accommodations.',
                        slug: 'hotel-booking-vocabulary',
                        levelSlug: 'travel-essentials',
                        uploads: ['vocabulary-list.pdf', 'dialogue-samples.mp3'],
                    },
                    {
                        title: 'Airport Navigation Guide',
                        subTitle: 'Learn English for navigating through airports.',
                        slug: 'airport-navigation-guide',
                        levelSlug: 'travel-essentials',
                        uploads: ['navigation-tips.pdf', 'interactive-map.html'],
                    },
                    {
                        title: 'Restaurant English Basics',
                        subTitle: 'Phrases to order food and understand menus.',
                        slug: 'restaurant-english-basics',
                        levelSlug: 'travel-essentials',
                        uploads: ['menu-guide.pdf', 'dialogue-practice.mp3'],
                    },
                    {
                        title: 'Transportation Vocabulary',
                        subTitle: 'Words and phrases for buses, trains, and taxis.',
                        slug: 'transportation-vocabulary',
                        levelSlug: 'travel-essentials',
                        uploads: ['transport-vocab.pdf', 'roleplay.mp3'],
                    },
                    {
                        title: 'Cultural Tips for Travelers',
                        subTitle: 'Advice on cultural norms and etiquette.',
                        slug: 'cultural-tips-for-travelers',
                        levelSlug: 'travel-essentials',
                        uploads: ['cultural-guide.pdf', 'tips-video.mp4'],
                    },
                ],
            },
            {
                name: 'Advanced Socializing in English', slug: 'advanced-socializing', materials: [
                    {
                        title: 'Common Travel Phrases',
                        subTitle: 'Essential phrases for airport, hotel, and transportation.',
                        slug: 'common-travel-phrases',
                        levelSlug: 'travel-essentials',
                        uploads: ['phrasebook.pdf', 'audio-guide.mp3'],
                    },
                    {
                        title: 'Hotel Booking Vocabulary',
                        subTitle: 'Key terms and phrases for reserving accommodations.',
                        slug: 'hotel-booking-vocabulary',
                        levelSlug: 'travel-essentials',
                        uploads: ['vocabulary-list.pdf', 'dialogue-samples.mp3'],
                    },
                    {
                        title: 'Airport Navigation Guide',
                        subTitle: 'Learn English for navigating through airports.',
                        slug: 'airport-navigation-guide',

                        levelSlug: 'travel-essentials',
                        uploads: ['navigation-tips.pdf', 'interactive-map.html'],
                    },
                    {
                        title: 'Restaurant English Basics',
                        subTitle: 'Phrases to order food and understand menus.',
                        slug: 'restaurant-english-basics',
                        levelSlug: 'travel-essentials',
                        uploads: ['menu-guide.pdf', 'dialogue-practice.mp3'],
                    },
                    {
                        title: 'Transportation Vocabulary',
                        subTitle: 'Words and phrases for buses, trains, and taxis.',
                        slug: 'transportation-vocabulary',
                        levelSlug: 'travel-essentials',
                        uploads: ['transport-vocab.pdf', 'roleplay.mp3'],
                    },
                    {
                        title: 'Cultural Tips for Travelers',
                        subTitle: 'Advice on cultural norms and etiquette.',
                        slug: 'cultural-tips-for-travelers',
                        levelSlug: 'travel-essentials',
                        uploads: ['cultural-guide.pdf', 'tips-video.mp4'],
                    },
                ],
            }
        ],
        ...generateTimestamps()
    },
    {
        name: 'Business Email Writing in English',
        slug: 'business-email-writing-in-english',
        image: '/public/contact_us_large.png',
        description: 'Master the art of writing professional emails in English for business communication.',
        groupPrice: 1300, privatePrice: 3400, instructorPrice: 2700,
        levels: [
            {
                name: 'Email Writing Basics', slug: 'email-writing-basics', materials: [
                    {
                        title: 'Common Travel Phrases',
                        subTitle: 'Essential phrases for airport, hotel, and transportation.',
                        slug: 'common-travel-phrases',
                        levelSlug: 'travel-essentials',
                        uploads: ['phrasebook.pdf', 'audio-guide.mp3'],
                    },
                    {
                        title: 'Hotel Booking Vocabulary',
                        subTitle: 'Key terms and phrases for reserving accommodations.',
                        slug: 'hotel-booking-vocabulary',
                        levelSlug: 'travel-essentials',
                        uploads: ['vocabulary-list.pdf', 'dialogue-samples.mp3'],
                    },
                    {
                        title: 'Airport Navigation Guide',
                        subTitle: 'Learn English for navigating through airports.',
                        slug: 'airport-navigation-guide',
                        levelSlug: 'travel-essentials',
                        uploads: ['navigation-tips.pdf', 'interactive-map.html'],
                    },
                    {
                        title: 'Restaurant English Basics',
                        subTitle: 'Phrases to order food and understand menus.',
                        slug: 'restaurant-english-basics',
                        levelSlug: 'travel-essentials',
                        uploads: ['menu-guide.pdf', 'dialogue-practice.mp3'],
                    },
                    {
                        title: 'Transportation Vocabulary',
                        subTitle: 'Words and phrases for buses, trains, and taxis.',
                        slug: 'transportation-vocabulary',
                        levelSlug: 'travel-essentials',
                        uploads: ['transport-vocab.pdf', 'roleplay.mp3'],
                    },
                    {
                        title: 'Cultural Tips for Travelers',
                        subTitle: 'Advice on cultural norms and etiquette.',
                        slug: 'cultural-tips-for-travelers',
                        levelSlug: 'travel-essentials',
                        uploads: ['cultural-guide.pdf', 'tips-video.mp4'],
                    },
                ],
            },
            {
                name: 'Intermediate Business Email Writing', slug: 'intermediate-email-writing', materials: [
                    {
                        title: 'Common Travel Phrases',
                        subTitle: 'Essential phrases for airport, hotel, and transportation.',
                        slug: 'common-travel-phrases',
                        levelSlug: 'travel-essentials',
                        uploads: ['phrasebook.pdf', 'audio-guide.mp3'],
                    },
                    {
                        title: 'Hotel Booking Vocabulary',
                        subTitle: 'Key terms and phrases for reserving accommodations.',
                        slug: 'hotel-booking-vocabulary',
                        levelSlug: 'travel-essentials',
                        uploads: ['vocabulary-list.pdf', 'dialogue-samples.mp3'],
                    },
                    {
                        title: 'Airport Navigation Guide',
                        subTitle: 'Learn English for navigating through airports.',
                        slug: 'airport-navigation-guide',
                        levelSlug: 'travel-essentials',
                        uploads: ['navigation-tips.pdf', 'interactive-map.html'],
                    },
                    {
                        title: 'Restaurant English Basics',
                        subTitle: 'Phrases to order food and understand menus.',
                        slug: 'restaurant-english-basics',
                        levelSlug: 'travel-essentials',
                        uploads: ['menu-guide.pdf', 'dialogue-practice.mp3'],
                    },
                    {
                        title: 'Transportation Vocabulary',
                        subTitle: 'Words and phrases for buses, trains, and taxis.',
                        slug: 'transportation-vocabulary',
                        levelSlug: 'travel-essentials',
                        uploads: ['transport-vocab.pdf', 'roleplay.mp3'],
                    },
                    {
                        title: 'Cultural Tips for Travelers',
                        subTitle: 'Advice on cultural norms and etiquette.',
                        slug: 'cultural-tips-for-travelers',
                        levelSlug: 'travel-essentials',
                        uploads: ['cultural-guide.pdf', 'tips-video.mp4'],
                    },
                ],
            },
            {
                name: 'Advanced Email Communication', slug: 'advanced-email-communication', materials: [
                    {
                        title: 'Common Travel Phrases',
                        subTitle: 'Essential phrases for airport, hotel, and transportation.',
                        slug: 'common-travel-phrases',
                        levelSlug: 'travel-essentials',
                        uploads: ['phrasebook.pdf', 'audio-guide.mp3'],
                    },
                    {
                        title: 'Hotel Booking Vocabulary',
                        subTitle: 'Key terms and phrases for reserving accommodations.',
                        slug: 'hotel-booking-vocabulary',
                        levelSlug: 'travel-essentials',
                        uploads: ['vocabulary-list.pdf', 'dialogue-samples.mp3'],
                    },
                    {
                        title: 'Airport Navigation Guide',
                        subTitle: 'Learn English for navigating through airports.',
                        slug: 'airport-navigation-guide',
                        levelSlug: 'travel-essentials',
                        uploads: ['navigation-tips.pdf', 'interactive-map.html'],
                    },
                    {
                        title: 'Restaurant English Basics',
                        subTitle: 'Phrases to order food and understand menus.',
                        slug: 'restaurant-english-basics',
                        levelSlug: 'travel-essentials',
                        uploads: ['menu-guide.pdf', 'dialogue-practice.mp3'],
                    },
                    {
                        title: 'Transportation Vocabulary',
                        subTitle: 'Words and phrases for buses, trains, and taxis.',
                        slug: 'transportation-vocabulary',
                        levelSlug: 'travel-essentials',
                        uploads: ['transport-vocab.pdf', 'roleplay.mp3'],
                    },
                    {
                        title: 'Cultural Tips for Travelers',
                        subTitle: 'Advice on cultural norms and etiquette.',
                        slug: 'cultural-tips-for-travelers',
                        levelSlug: 'travel-essentials',
                        uploads: ['cultural-guide.pdf', 'tips-video.mp4'],
                    },
                ],
            }
        ],
        ...generateTimestamps()
    },
    {
        name: 'English for Negotiations',
        slug: 'english-for-negotiations',
        image: '/public/contact_us_large.png',
        description: 'Learn essential English phrases and strategies for successful negotiations.',
        groupPrice: 700, privatePrice: 1700, instructorPrice: 1350,
        levels: [
            {
                name: 'Negotiation Basics', slug: 'negotiation-basics', materials: [
                    {
                        title: 'Common Travel Phrases',
                        subTitle: 'Essential phrases for airport, hotel, and transportation.',
                        slug: 'common-travel-phrases',
                        levelSlug: 'travel-essentials',
                        uploads: ['phrasebook.pdf', 'audio-guide.mp3'],
                    },
                    {
                        title: 'Hotel Booking Vocabulary',
                        subTitle: 'Key terms and phrases for reserving accommodations.',
                        slug: 'hotel-booking-vocabulary',
                        levelSlug: 'travel-essentials',
                        uploads: ['vocabulary-list.pdf', 'dialogue-samples.mp3'],
                    },
                    {
                        title: 'Airport Navigation Guide',
                        subTitle: 'Learn English for navigating through airports.',
                        slug: 'airport-navigation-guide',
                        levelSlug: 'travel-essentials',
                        uploads: ['navigation-tips.pdf', 'interactive-map.html'],
                    },
                    {
                        title: 'Restaurant English Basics',
                        subTitle: 'Phrases to order food and understand menus.',
                        slug: 'restaurant-english-basics',
                        levelSlug: 'travel-essentials',
                        uploads: ['menu-guide.pdf', 'dialogue-practice.mp3'],
                    },
                    {
                        title: 'Transportation Vocabulary',
                        subTitle: 'Words and phrases for buses, trains, and taxis.',
                        slug: 'transportation-vocabulary',
                        levelSlug: 'travel-essentials',
                        uploads: ['transport-vocab.pdf', 'roleplay.mp3'],
                    },
                    {
                        title: 'Cultural Tips for Travelers',
                        subTitle: 'Advice on cultural norms and etiquette.',
                        slug: 'cultural-tips-for-travelers',
                        levelSlug: 'travel-essentials',
                        uploads: ['cultural-guide.pdf', 'tips-video.mp4'],
                    },
                ],
            },
            {
                name: 'Intermediate Negotiation Strategies', slug: 'intermediate-negotiation', materials: [
                    {
                        title: 'Common Travel Phrases',
                        subTitle: 'Essential phrases for airport, hotel, and transportation.',
                        slug: 'common-travel-phrases',
                        levelSlug: 'travel-essentials',
                        uploads: ['phrasebook.pdf', 'audio-guide.mp3'],
                    },
                    {
                        title: 'Hotel Booking Vocabulary',
                        subTitle: 'Key terms and phrases for reserving accommodations.',
                        slug: 'hotel-booking-vocabulary',
                        levelSlug: 'travel-essentials',
                        uploads: ['vocabulary-list.pdf', 'dialogue-samples.mp3'],
                    },
                    {
                        title: 'Airport Navigation Guide',
                        subTitle: 'Learn English for navigating through airports.',
                        slug: 'airport-navigation-guide',
                        levelSlug: 'travel-essentials',
                        uploads: ['navigation-tips.pdf', 'interactive-map.html'],
                    },
                    {
                        title: 'Restaurant English Basics',
                        subTitle: 'Phrases to order food and understand menus.',
                        slug: 'restaurant-english-basics',
                        levelSlug: 'travel-essentials',
                        uploads: ['menu-guide.pdf', 'dialogue-practice.mp3'],
                    },
                    {
                        title: 'Transportation Vocabulary',
                        subTitle: 'Words and phrases for buses, trains, and taxis.',
                        slug: 'transportation-vocabulary',
                        levelSlug: 'travel-essentials',
                        uploads: ['transport-vocab.pdf', 'roleplay.mp3'],
                    },
                    {
                        title: 'Cultural Tips for Travelers',
                        subTitle: 'Advice on cultural norms and etiquette.',
                        slug: 'cultural-tips-for-travelers',
                        levelSlug: 'travel-essentials',
                        uploads: ['cultural-guide.pdf', 'tips-video.mp4'],
                    },
                ],
            },
            {
                name: 'Advanced Negotiation Tactics', slug: 'advanced-negotiation', materials: [
                    {
                        title: 'Common Travel Phrases',
                        subTitle: 'Essential phrases for airport, hotel, and transportation.',
                        slug: 'common-travel-phrases',
                        levelSlug: 'travel-essentials',
                        uploads: ['phrasebook.pdf', 'audio-guide.mp3'],
                    },
                    {
                        title: 'Hotel Booking Vocabulary',
                        subTitle: 'Key terms and phrases for reserving accommodations.',
                        slug: 'hotel-booking-vocabulary',
                        levelSlug: 'travel-essentials',
                        uploads: ['vocabulary-list.pdf', 'dialogue-samples.mp3'],
                    },
                    {
                        title: 'Airport Navigation Guide',
                        subTitle: 'Learn English for navigating through airports.',
                        slug: 'airport-navigation-guide',
                        levelSlug: 'travel-essentials',
                        uploads: ['navigation-tips.pdf', 'interactive-map.html'],
                    },
                    {
                        title: 'Restaurant English Basics',
                        subTitle: 'Phrases to order food and understand menus.',
                        slug: 'restaurant-english-basics',
                        levelSlug: 'travel-essentials',
                        uploads: ['menu-guide.pdf', 'dialogue-practice.mp3'],
                    },
                    {
                        title: 'Transportation Vocabulary',
                        subTitle: 'Words and phrases for buses, trains, and taxis.',
                        slug: 'transportation-vocabulary',
                        levelSlug: 'travel-essentials',
                        uploads: ['transport-vocab.pdf', 'roleplay.mp3'],
                    },
                    {
                        title: 'Cultural Tips for Travelers',
                        subTitle: 'Advice on cultural norms and etiquette.',
                        slug: 'cultural-tips-for-travelers',
                        levelSlug: 'travel-essentials',
                        uploads: ['cultural-guide.pdf', 'tips-video.mp4'],
                    },
                ],
            }
        ],
        ...generateTimestamps()
    },
    {
        name: 'Academic English for Students',
        slug: 'academic-english-for-students',
        image: '/public/contact_us_large.png',
        description: 'Develop academic English proficiency to excel in university and exams.',
        groupPrice: 900, privatePrice: 2200, instructorPrice: 1800,
        levels: [
            {
                name: 'Academic Writing Basics', slug: 'academic-writing-basics', materials: [
                    {
                        title: 'Common Travel Phrases',
                        subTitle: 'Essential phrases for airport, hotel, and transportation.',
                        slug: 'common-travel-phrases',
                        levelSlug: 'travel-essentials',
                        uploads: ['phrasebook.pdf', 'audio-guide.mp3'],
                    },
                    {
                        title: 'Hotel Booking Vocabulary',
                        subTitle: 'Key terms and phrases for reserving accommodations.',
                        slug: 'hotel-booking-vocabulary',
                        levelSlug: 'travel-essentials',
                        uploads: ['vocabulary-list.pdf', 'dialogue-samples.mp3'],
                    },
                    {
                        title: 'Airport Navigation Guide',
                        subTitle: 'Learn English for navigating through airports.',
                        slug: 'airport-navigation-guide',
                        levelSlug: 'travel-essentials',
                        uploads: ['navigation-tips.pdf', 'interactive-map.html'],
                    },
                    {
                        title: 'Restaurant English Basics',
                        subTitle: 'Phrases to order food and understand menus.',
                        slug: 'restaurant-english-basics',
                        levelSlug: 'travel-essentials',
                        uploads: ['menu-guide.pdf', 'dialogue-practice.mp3'],
                    },
                    {
                        title: 'Transportation Vocabulary',
                        subTitle: 'Words and phrases for buses, trains, and taxis.',
                        slug: 'transportation-vocabulary',
                        levelSlug: 'travel-essentials',
                        uploads: ['transport-vocab.pdf', 'roleplay.mp3'],
                    },
                    {
                        title: 'Cultural Tips for Travelers',
                        subTitle: 'Advice on cultural norms and etiquette.',
                        slug: 'cultural-tips-for-travelers',
                        levelSlug: 'travel-essentials',
                        uploads: ['cultural-guide.pdf', 'tips-video.mp4'],
                    },
                ],
            },
            {
                name: 'Intermediate Academic English', slug: 'intermediate-academic-english', materials: [
                    {
                        title: 'Common Travel Phrases',
                        subTitle: 'Essential phrases for airport, hotel, and transportation.',
                        slug: 'common-travel-phrases',
                        levelSlug: 'travel-essentials',
                        uploads: ['phrasebook.pdf', 'audio-guide.mp3'],
                    },
                    {
                        title: 'Hotel Booking Vocabulary',
                        subTitle: 'Key terms and phrases for reserving accommodations.',
                        slug: 'hotel-booking-vocabulary',
                        levelSlug: 'travel-essentials',
                        uploads: ['vocabulary-list.pdf', 'dialogue-samples.mp3'],
                    },
                    {
                        title: 'Airport Navigation Guide',
                        subTitle: 'Learn English for navigating through airports.',
                        slug: 'airport-navigation-guide',
                        levelSlug: 'travel-essentials',
                        uploads: ['navigation-tips.pdf', 'interactive-map.html'],
                    },
                    {
                        title: 'Restaurant English Basics',
                        subTitle: 'Phrases to order food and understand menus.',
                        slug: 'restaurant-english-basics',
                        levelSlug: 'travel-essentials',
                        uploads: ['menu-guide.pdf', 'dialogue-practice.mp3'],
                    },
                    {
                        title: 'Transportation Vocabulary',
                        subTitle: 'Words and phrases for buses, trains, and taxis.',
                        slug: 'transportation-vocabulary',
                        levelSlug: 'travel-essentials',
                        uploads: ['transport-vocab.pdf', 'roleplay.mp3'],
                    },
                    {
                        title: 'Cultural Tips for Travelers',
                        subTitle: 'Advice on cultural norms and etiquette.',
                        slug: 'cultural-tips-for-travelers',
                        levelSlug: 'travel-essentials',
                        uploads: ['cultural-guide.pdf', 'tips-video.mp4'],
                    },
                ],
            },
            {
                name: 'Advanced Academic English', slug: 'advanced-academic-english', materials: [
                    {
                        title: 'Common Travel Phrases',
                        subTitle: 'Essential phrases for airport, hotel, and transportation.',
                        slug: 'common-travel-phrases',
                        levelSlug: 'travel-essentials',
                        uploads: ['phrasebook.pdf', 'audio-guide.mp3'],
                    },
                    {
                        title: 'Hotel Booking Vocabulary',
                        subTitle: 'Key terms and phrases for reserving accommodations.',
                        slug: 'hotel-booking-vocabulary',
                        levelSlug: 'travel-essentials',
                        uploads: ['vocabulary-list.pdf', 'dialogue-samples.mp3'],
                    },
                    {
                        title: 'Airport Navigation Guide',
                        subTitle: 'Learn English for navigating through airports.',
                        slug: 'airport-navigation-guide',
                        levelSlug: 'travel-essentials',
                        uploads: ['navigation-tips.pdf', 'interactive-map.html'],
                    },
                    {
                        title: 'Restaurant English Basics',
                        subTitle: 'Phrases to order food and understand menus.',
                        slug: 'restaurant-english-basics',
                        levelSlug: 'travel-essentials',
                        uploads: ['menu-guide.pdf', 'dialogue-practice.mp3'],
                    },
                    {
                        title: 'Transportation Vocabulary',
                        subTitle: 'Words and phrases for buses, trains, and taxis.',
                        slug: 'transportation-vocabulary',
                        levelSlug: 'travel-essentials',
                        uploads: ['transport-vocab.pdf', 'roleplay.mp3'],
                    },
                    {
                        title: 'Cultural Tips for Travelers',
                        subTitle: 'Advice on cultural norms and etiquette.',
                        slug: 'cultural-tips-for-travelers',
                        levelSlug: 'travel-essentials',
                        uploads: ['cultural-guide.pdf', 'tips-video.mp4'],
                    },
                ],
            }
        ],
        ...generateTimestamps()
    },
    {
        name: 'English for Public Speaking',
        slug: 'english-for-public-speaking',
        image: '/public/contact_us_large.png',
        description: 'Gain confidence and skills for delivering speeches and presentations in English.',
        groupPrice: 1200, privatePrice: 4000, instructorPrice: 3200,
        levels: [
            {
                name: 'Public Speaking Fundamentals', slug: 'public-speaking-fundamentals', materials: [
                    {
                        title: 'Common Travel Phrases',
                        subTitle: 'Essential phrases for airport, hotel, and transportation.',
                        slug: 'common-travel-phrases',
                        levelSlug: 'travel-essentials',
                        uploads: ['phrasebook.pdf', 'audio-guide.mp3'],
                    },
                    {
                        title: 'Hotel Booking Vocabulary',
                        subTitle: 'Key terms and phrases for reserving accommodations.',
                        slug: 'hotel-booking-vocabulary',
                        levelSlug: 'travel-essentials',
                        uploads: ['vocabulary-list.pdf', 'dialogue-samples.mp3'],
                    },
                    {
                        title: 'Airport Navigation Guide',
                        subTitle: 'Learn English for navigating through airports.',
                        slug: 'airport-navigation-guide',
                        levelSlug: 'travel-essentials',
                        uploads: ['navigation-tips.pdf', 'interactive-map.html'],
                    },
                    {
                        title: 'Restaurant English Basics',
                        subTitle: 'Phrases to order food and understand menus.',
                        slug: 'restaurant-english-basics',
                        levelSlug: 'travel-essentials',
                        uploads: ['menu-guide.pdf', 'dialogue-practice.mp3'],
                    },
                    {
                        title: 'Transportation Vocabulary',
                        subTitle: 'Words and phrases for buses, trains, and taxis.',
                        slug: 'transportation-vocabulary',
                        levelSlug: 'travel-essentials',
                        uploads: ['transport-vocab.pdf', 'roleplay.mp3'],
                    },
                    {
                        title: 'Cultural Tips for Travelers',
                        subTitle: 'Advice on cultural norms and etiquette.',
                        slug: 'cultural-tips-for-travelers',
                        levelSlug: 'travel-essentials',
                        uploads: ['cultural-guide.pdf', 'tips-video.mp4'],
                    },
                ],
            },
            {
                name: 'Intermediate Speaking Skills', slug: 'intermediate-speaking-skills', materials: [
                    {
                        title: 'Common Travel Phrases',
                        subTitle: 'Essential phrases for airport, hotel, and transportation.',
                        slug: 'common-travel-phrases',
                        levelSlug: 'travel-essentials',
                        uploads: ['phrasebook.pdf', 'audio-guide.mp3'],
                    },
                    {
                        title: 'Hotel Booking Vocabulary',
                        subTitle: 'Key terms and phrases for reserving accommodations.',
                        slug: 'hotel-booking-vocabulary',
                        levelSlug: 'travel-essentials',
                        uploads: ['vocabulary-list.pdf', 'dialogue-samples.mp3'],
                    },
                    {
                        title: 'Airport Navigation Guide',
                        subTitle: 'Learn English for navigating through airports.',
                        slug: 'airport-navigation-guide',
                        levelSlug: 'travel-essentials',
                        uploads: ['navigation-tips.pdf', 'interactive-map.html'],
                    },
                    {
                        title: 'Restaurant English Basics',
                        subTitle: 'Phrases to order food and understand menus.',
                        slug: 'restaurant-english-basics',
                        levelSlug: 'travel-essentials',
                        uploads: ['menu-guide.pdf', 'dialogue-practice.mp3'],
                    },
                    {
                        title: 'Transportation Vocabulary',
                        subTitle: 'Words and phrases for buses, trains, and taxis.',
                        slug: 'transportation-vocabulary',
                        levelSlug: 'travel-essentials',
                        uploads: ['transport-vocab.pdf', 'roleplay.mp3'],
                    },
                    {
                        title: 'Cultural Tips for Travelers',
                        subTitle: 'Advice on cultural norms and etiquette.',
                        slug: 'cultural-tips-for-travelers',
                        levelSlug: 'travel-essentials',
                        uploads: ['cultural-guide.pdf', 'tips-video.mp4'],
                    },
                ],
            },
            {
                name: 'Advanced Public Speaking', slug: 'advanced-public-speaking', materials: [
                    {
                        title: 'Common Travel Phrases',
                        subTitle: 'Essential phrases for airport, hotel, and transportation.',
                        slug: 'common-travel-phrases',
                        levelSlug: 'travel-essentials',
                        uploads: ['phrasebook.pdf', 'audio-guide.mp3'],
                    },
                    {
                        title: 'Hotel Booking Vocabulary',
                        subTitle: 'Key terms and phrases for reserving accommodations.',
                        slug: 'hotel-booking-vocabulary',
                        levelSlug: 'travel-essentials',
                        uploads: ['vocabulary-list.pdf', 'dialogue-samples.mp3'],
                    },
                    {
                        title: 'Airport Navigation Guide',
                        subTitle: 'Learn English for navigating through airports.',
                        slug: 'airport-navigation-guide',
                        levelSlug: 'travel-essentials',
                        uploads: ['navigation-tips.pdf', 'interactive-map.html'],
                    },
                    {
                        title: 'Restaurant English Basics',
                        subTitle: 'Phrases to order food and understand menus.',
                        slug: 'restaurant-english-basics',
                        levelSlug: 'travel-essentials',
                        uploads: ['menu-guide.pdf', 'dialogue-practice.mp3'],
                    },
                    {
                        title: 'Transportation Vocabulary',
                        subTitle: 'Words and phrases for buses, trains, and taxis.',
                        slug: 'transportation-vocabulary',
                        levelSlug: 'travel-essentials',
                        uploads: ['transport-vocab.pdf', 'roleplay.mp3'],
                    },
                    {
                        title: 'Cultural Tips for Travelers',
                        subTitle: 'Advice on cultural norms and etiquette.',
                        slug: 'cultural-tips-for-travelers',
                        levelSlug: 'travel-essentials',
                        uploads: ['cultural-guide.pdf', 'tips-video.mp4'],
                    },
                ],
            }
        ],
        ...generateTimestamps()
    },
    {
        name: 'English for Everyday Life',
        slug: 'english-for-everyday-life',
        image: '/public/contact_us_large.png',
        description: 'Learn practical English for day-to-day activities, from shopping to dining out.',
        groupPrice: 1000, privatePrice: 3200, instructorPrice: 2600,
        levels: [
            {
                name: 'Everyday English Basics', slug: 'everyday-english-basics', materials: [
                    {
                        title: 'Common Travel Phrases',
                        subTitle: 'Essential phrases for airport, hotel, and transportation.',
                        slug: 'common-travel-phrases',
                        levelSlug: 'travel-essentials',
                        uploads: ['phrasebook.pdf', 'audio-guide.mp3'],
                    },
                    {
                        title: 'Hotel Booking Vocabulary',
                        subTitle: 'Key terms and phrases for reserving accommodations.',
                        slug: 'hotel-booking-vocabulary',
                        levelSlug: 'travel-essentials',
                        uploads: ['vocabulary-list.pdf', 'dialogue-samples.mp3'],
                    },
                    {
                        title: 'Airport Navigation Guide',
                        subTitle: 'Learn English for navigating through airports.',
                        slug: 'airport-navigation-guide',
                        levelSlug: 'travel-essentials',
                        uploads: ['navigation-tips.pdf', 'interactive-map.html'],
                    },
                    {
                        title: 'Restaurant English Basics',
                        subTitle: 'Phrases to order food and understand menus.',
                        slug: 'restaurant-english-basics',
                        levelSlug: 'travel-essentials',
                        uploads: ['menu-guide.pdf', 'dialogue-practice.mp3'],
                    },
                    {
                        title: 'Transportation Vocabulary',
                        subTitle: 'Words and phrases for buses, trains, and taxis.',
                        slug: 'transportation-vocabulary',
                        levelSlug: 'travel-essentials',
                        uploads: ['transport-vocab.pdf', 'roleplay.mp3'],
                    },
                    {
                        title: 'Cultural Tips for Travelers',
                        subTitle: 'Advice on cultural norms and etiquette.',
                        slug: 'cultural-tips-for-travelers',
                        levelSlug: 'travel-essentials',
                        uploads: ['cultural-guide.pdf', 'tips-video.mp4'],
                    },
                ],
            },
            {
                name: 'Intermediate Everyday English', slug: 'intermediate-everyday-english', materials: [
                    {
                        title: 'Common Travel Phrases',
                        subTitle: 'Essential phrases for airport, hotel, and transportation.',
                        slug: 'common-travel-phrases',
                        levelSlug: 'travel-essentials',
                        uploads: ['phrasebook.pdf', 'audio-guide.mp3'],
                    },
                    {
                        title: 'Hotel Booking Vocabulary',
                        subTitle: 'Key terms and phrases for reserving accommodations.',
                        slug: 'hotel-booking-vocabulary',
                        levelSlug: 'travel-essentials',
                        uploads: ['vocabulary-list.pdf', 'dialogue-samples.mp3'],
                    },
                    {
                        title: 'Airport Navigation Guide',
                        subTitle: 'Learn English for navigating through airports.',
                        slug: 'airport-navigation-guide',
                        levelSlug: 'travel-essentials',
                        uploads: ['navigation-tips.pdf', 'interactive-map.html'],
                    },
                    {
                        title: 'Restaurant English Basics',
                        subTitle: 'Phrases to order food and understand menus.',
                        slug: 'restaurant-english-basics',
                        levelSlug: 'travel-essentials',
                        uploads: ['menu-guide.pdf', 'dialogue-practice.mp3'],
                    },
                    {
                        title: 'Transportation Vocabulary',
                        subTitle: 'Words and phrases for buses, trains, and taxis.',
                        slug: 'transportation-vocabulary',
                        levelSlug: 'travel-essentials',
                        uploads: ['transport-vocab.pdf', 'roleplay.mp3'],
                    },
                    {
                        title: 'Cultural Tips for Travelers',
                        subTitle: 'Advice on cultural norms and etiquette.',
                        slug: 'cultural-tips-for-travelers',
                        levelSlug: 'travel-essentials',
                        uploads: ['cultural-guide.pdf', 'tips-video.mp4'],
                    },
                ],
            },
            {
                name: 'Advanced Everyday English', slug: 'advanced-everyday-english', materials: [
                    {
                        title: 'Common Travel Phrases',
                        subTitle: 'Essential phrases for airport, hotel, and transportation.',
                        slug: 'common-travel-phrases',
                        levelSlug: 'travel-essentials',
                        uploads: ['phrasebook.pdf', 'audio-guide.mp3'],
                    },
                    {
                        title: 'Hotel Booking Vocabulary',
                        subTitle: 'Key terms and phrases for reserving accommodations.',
                        slug: 'hotel-booking-vocabulary',
                        levelSlug: 'travel-essentials',
                        uploads: ['vocabulary-list.pdf', 'dialogue-samples.mp3'],
                    },
                    {
                        title: 'Airport Navigation Guide',
                        subTitle: 'Learn English for navigating through airports.',
                        slug: 'airport-navigation-guide',
                        levelSlug: 'travel-essentials',
                        uploads: ['navigation-tips.pdf', 'interactive-map.html'],
                    },
                    {
                        title: 'Restaurant English Basics',
                        subTitle: 'Phrases to order food and understand menus.',
                        slug: 'restaurant-english-basics',
                        levelSlug: 'travel-essentials',
                        uploads: ['menu-guide.pdf', 'dialogue-practice.mp3'],
                    },
                    {
                        title: 'Transportation Vocabulary',
                        subTitle: 'Words and phrases for buses, trains, and taxis.',
                        slug: 'transportation-vocabulary',
                        levelSlug: 'travel-essentials',
                        uploads: ['transport-vocab.pdf', 'roleplay.mp3'],
                    },
                    {
                        title: 'Cultural Tips for Travelers',
                        subTitle: 'Advice on cultural norms and etiquette.',
                        slug: 'cultural-tips-for-travelers',
                        levelSlug: 'travel-essentials',
                        uploads: ['cultural-guide.pdf', 'tips-video.mp4'],
                    },
                ],
            }
        ],
        ...generateTimestamps()
    },
];

export const systemFormData = {
    placementTest: {
        title: "Travel Essentials Placement Test",
        description: "Assess your understanding of basic travel-related English vocabulary and phrases.",
        type: SystemFormTypes.PlacementTest, // Valid type
        items: [
            {
                type: ItemType.QuestionItem, // Valid item type
                title: "Common Travel Phrases",
                imageUrl: "/travel_phrases.jpg",
                questions: [
                    {
                        questionText: "What should you say if you want to ask for directions?",
                        required: true,
                        shuffle: true,
                        points: 5,
                        type: ItemQuestionType.Choice, // Valid question type
                        choiceType: QuestionChoiceType.Radio, // Valid choice type
                        options: [
                            { value: "Where is the nearest station?", isCorrect: true },
                            { value: "Can I have the menu, please?", isCorrect: false },
                            { value: "What time is it?", isCorrect: false },
                        ],
                    },
                    {
                        questionText: "How do you say 'thank you' in English?",
                        required: true,
                        shuffle: false,
                        points: 5,
                        type: ItemQuestionType.Choice,
                        choiceType: QuestionChoiceType.Radio,
                        options: [
                            { value: "Goodbye", isCorrect: false },
                            { value: "Thank you", isCorrect: true },
                            { value: "Hello", isCorrect: false },
                        ],
                    },
                ],
            },
        ],
    },
    finalTest: {
        title: "Advanced Travel English Final Test",
        description: "Evaluate your mastery of advanced travel English skills.",
        type: SystemFormTypes.FinalTest, // Valid type
        items: [
            {
                type: ItemType.QuestionItem,
                title: "Complex Situations at the Airport",
                imageUrl: "/airport_complex.jpg",
                questions: [
                    {
                        questionText: "What would you say if your luggage is lost?",
                        required: true,
                        shuffle: true,
                        points: 10,
                        type: ItemQuestionType.Choice,
                        choiceType: QuestionChoiceType.Radio,
                        options: [
                            { value: "I want a ticket, please.", isCorrect: false },
                            { value: "My luggage is missing. Can you help me?", isCorrect: true },
                            { value: "What gate should I go to?", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                type: ItemType.TextItem, // Valid type
                title: "Booking a Hotel Room",
                imageUrl: null,
                questions: [
                    {
                        questionText: "Complete the phrase: 'I'd like to ______ a room for two nights.'",
                        required: true,
                        shuffle: false,
                        points: 15,
                        type: ItemQuestionType.Text,
                        choiceType: QuestionChoiceType.Radio, // Defaults as `Text` question doesn't allow multiple choices
                        options: [
                            { value: "book", isCorrect: true },
                        ],
                    },
                ],
            },
        ],
    },
    quiz: {
        title: "Transportation Vocabulary Quiz",
        description: "Check your knowledge of transportation-related English terms.",
        type: SystemFormTypes.Quiz, // Valid type
        items: [
            {
                type: ItemType.QuestionItem,
                title: "Understanding Directions",
                imageUrl: "/directions.jpg",
                questions: [
                    {
                        questionText: "The phrase 'turn left' means to move to your left side.",
                        required: true,
                        shuffle: false,
                        points: 5,
                        type: ItemQuestionType.Choice,
                        choiceType: QuestionChoiceType.Checkbox, // Valid choice type
                        options: [
                            { value: "True", isCorrect: true },
                            { value: "False", isCorrect: false },
                        ],
                    },
                ],
            },
        ],
    },
    assignment: {
        title: "Email Writing Basics Assignment",
        description: "Practice writing professional emails in English.",
        type: SystemFormTypes.Assignment, // Valid type
        items: [
            {
                type: ItemType.QuestionItem,
                title: "Compose a Formal Email",
                imageUrl: null,
                questions: [
                    {
                        questionText: "Write a formal email introducing yourself to a potential client.",
                        required: true,
                        shuffle: false,
                        points: 20,
                        type: ItemQuestionType.Text,
                        choiceType: QuestionChoiceType.Radio, // Defaults as `Text` question doesn't allow multiple choices
                        options: [],
                    },
                ],
            },
        ],
    },
};

export const salesAgentsData = [
    {
        name: "Ahmed El-Masry",
        email: "ahmed.elmasry@gmail.com",
        password: "$2b$10$eBcWICrtSsH.I3YnB4y1xub2pY4AVFF.3DyGMPgoxP7YYCju7lbCO",
        phone: "201112345678",
        image: "/avatars/avatar-anika-visser.png", // Correct image URL
        agentType: UserRoles.OperationAgent,
    },
    {
        name: "Fatma Abdelrahman",
        email: "fatma.abdelrahman@gmail.com",
        password: "$2b$10$eBcWICrtSsH.I3YnB4y1xub2pY4AVFF.3DyGMPgoxP7YYCju7lbCO",
        phone: "201022234567",
        image: "/avatars/avatar-carson-darrin.png", // Correct image URL
        agentType: UserRoles.OperationAgent,
    },
    {
        name: "Mohamed Hossam",
        email: "mohamed.hossam@gmail.com",
        password: "$2b$10$eBcWICrtSsH.I3YnB4y1xub2pY4AVFF.3DyGMPgoxP7YYCju7lbCO",
        phone: "201512345678",
        image: "/avatars/avatar-fran-perez.png", // Correct image URL
        agentType: UserRoles.SalesAgent,
    },
    {
        name: "Sara Mohamed",
        email: "sara.mohamed@gmail.com",
        password: "$2b$10$eBcWICrtSsH.I3YnB4y1xub2pY4AVFF.3DyGMPgoxP7YYCju7lbCO",
        phone: "201222233344",
        image: "/avatars/avatar-iulia-albu.png", // Correct image URL
        agentType: UserRoles.SalesAgent,
    },
    {
        name: "Omar Ahmed",
        email: "omar.ahmed@gmail.com",
        password: "$2b$10$eBcWICrtSsH.I3YnB4y1xub2pY4AVFF.3DyGMPgoxP7YYCju7lbCO",
        phone: "201012345678",
        image: "/avatars/avatar-jie-yan-song.png", // Correct image URL
        agentType: UserRoles.SalesAgent,
    },
    {
        name: "Ali Hassan",
        email: "ali.hassan@gmail.com",
        password: "$2b$10$eBcWICrtSsH.I3YnB4y1xub2pY4AVFF.3DyGMPgoxP7YYCju7lbCO",
        phone: "201222233345",
        image: "/avatars/avatar-miron-vitold.png", // Correct image URL
        agentType: UserRoles.SalesAgent,
    },
    {
        name: "Mona Maher",
        email: "mona.maher@gmail.com",
        password: "$2b$10$eBcWICrtSsH.I3YnB4y1xub2pY4AVFF.3DyGMPgoxP7YYCju7lbCO",
        phone: "201512345679",
        image: "/avatars/avatar-nasimiyu-danai.png", // Correct image URL
        agentType: UserRoles.SalesAgent,
    },
]

export const trainersData = [
    // Teachers (10)
    {
        name: "Ali Mustafa",
        email: "ali.mustafa123@gmail.com",
        password: "$2b$10$eBcWICrtSsH.I3YnB4y1xub2pY4AVFF.3DyGMPgoxP7YYCju7lbCO",
        phone: "201112233445",
        image: "/avatars/avatar-anika-visser.png",
        trainerRole: UserRoles.Teacher,
    },
    {
        name: "Laila Abdelrahman",
        email: "laila.abdelrahman456@gmail.com",
        password: "$2b$10$eBcWICrtSsH.I3YnB4y1xub2pY4AVFF.3DyGMPgoxP7YYCju7lbCO",
        phone: "201055544332",
        image: "/avatars/avatar-carson-darrin.png",
        trainerRole: UserRoles.Teacher,
    },
    {
        name: "Karim Hassan",
        email: "karim.hassan789@gmail.com",
        password: "$2b$10$eBcWICrtSsH.I3YnB4y1xub2pY4AVFF.3DyGMPgoxP7YYCju7lbCO",
        phone: "201066677779",
        image: "/avatars/avatar-fran-perez.png",
        trainerRole: UserRoles.Teacher,
    },
    {
        name: "Mona Youssef",
        email: "mona.youssef101@gmail.com",
        password: "$2b$10$eBcWICrtSsH.I3YnB4y1xub2pY4AVFF.3DyGMPgoxP7YYCju7lbCO",
        phone: "201077788880",
        image: "/avatars/avatar-iulia-albu.png",
        trainerRole: UserRoles.Teacher,
    },
    {
        name: "Ahmed Fathy",
        email: "ahmed.fathy202@gmail.com",
        password: "$2b$10$eBcWICrtSsH.I3YnB4y1xub2pY4AVFF.3DyGMPgoxP7YYCju7lbCO",
        phone: "201088899991",
        image: "/avatars/avatar-jie-yan-song.png",
        trainerRole: UserRoles.Teacher,
    },
    {
        name: "Nadia Said",
        email: "nadia.said303@gmail.com",
        password: "$2b$10$eBcWICrtSsH.I3YnB4y1xub2pY4AVFF.3DyGMPgoxP7YYCju7lbCO",
        phone: "201099900112",
        image: "/avatars/avatar-miron-vitold.png",
        trainerRole: UserRoles.Teacher,
    },
    {
        name: "Youssef Ibrahim",
        email: "youssef.ibrahim404@gmail.com",
        password: "$2b$10$eBcWICrtSsH.I3YnB4y1xub2pY4AVFF.3DyGMPgoxP7YYCju7lbCO",
        phone: "201110011223",
        image: "/avatars/avatar-nasimiyu-danai.png",
        trainerRole: UserRoles.Teacher,
    },
    {
        name: "Dalia Khalil",
        email: "dalia.khalil505@gmail.com",
        password: "$2b$10$eBcWICrtSsH.I3YnB4y1xub2pY4AVFF.3DyGMPgoxP7YYCju7lbCO",
        phone: "201121122334",
        image: "/avatars/avatar-omar-darboe.png",
        trainerRole: UserRoles.Teacher,
    },
    {
        name: "Mohamed Gamal",
        email: "mohamed.gamal606@gmail.com",
        password: "$2b$10$eBcWICrtSsH.I3YnB4y1xub2pY4AVFF.3DyGMPgoxP7YYCju7lbCO",
        phone: "201132233445",
        image: "/avatars/avatar-penjani-inyene.png",
        trainerRole: UserRoles.Teacher,
    },
    {
        name: "Reem Ayman",
        email: "reem.ayman707@gmail.com",
        password: "$2b$10$eBcWICrtSsH.I3YnB4y1xub2pY4AVFF.3DyGMPgoxP7YYCju7lbCO",
        phone: "201143344556",
        image: "/avatars/avatar-siegbert-gottfried.png",
        trainerRole: UserRoles.Teacher,
    },

    // Testers (3)
    {
        name: "Amira El-Din",
        email: "amira.eldin808@gmail.com",
        password: "$2b$10$eBcWICrtSsH.I3YnB4y1xub2pY4AVFF.3DyGMPgoxP7YYCju7lbCO",
        phone: "201154455667",
        image: "/avatars/avatar-anika-visser.png",
        trainerRole: UserRoles.Tester,
    },
    {
        name: "Tamer Ashraf",
        email: "tamer.ashraf909@gmail.com",
        password: "$2b$10$eBcWICrtSsH.I3YnB4y1xub2pY4AVFF.3DyGMPgoxP7YYCju7lbCO",
        phone: "201165566778",
        image: "/avatars/avatar-carson-darrin.png",
        trainerRole: UserRoles.Tester,
    },
    {
        name: "Huda Zaki",
        email: "huda.zaki010@gmail.com",
        password: "$2b$10$eBcWICrtSsH.I3YnB4y1xub2pY4AVFF.3DyGMPgoxP7YYCju7lbCO",
        phone: "201176677889",
        image: "/avatars/avatar-fran-perez.png",
        trainerRole: UserRoles.Tester,
    },
];
