export interface ZoomMeeting {
    agenda?: string;
    default_password?: boolean;
    duration?: number;
    password?: string;
    pre_schedule?: boolean;
    recurrence?: {
        end_date_time?: string;
        end_times?: number;
        monthly_day?: number;
        monthly_week?: number;
        monthly_week_day?: number;
        repeat_interval?: number;
        type?: number;
        weekly_days?: string;
    };
    schedule_for?: string;
    settings?: {
        additional_data_center_regions?: string[];
        allow_multiple_devices?: boolean;
        alternative_hosts?: string;
        alternative_hosts_email_notification?: boolean;
        approval_type?: number;
        approved_or_denied_countries_or_regions?: {
            approved_list?: string[];
            denied_list?: string[];
            enable?: boolean;
            method?: string;
        };
        audio?: string;
        audio_conference_info?: string;
        authentication_domains?: string;
        authentication_exception?: {
            email?: string;
            name?: string;
        }[];
        authentication_option?: string;
        auto_recording?: string;
        breakout_room?: {
            enable?: boolean;
            rooms?: {
                name?: string;
                participants?: string[];
            }[];
        };
        calendar_type?: number;
        close_registration?: boolean;
        contact_email?: string;
        contact_name?: string;
        email_notification?: boolean;
        encryption_type?: string;
        focus_mode?: boolean;
        global_dial_in_countries?: string[];
        host_video?: boolean;
        jbh_time?: number;
        join_before_host?: boolean;
        language_interpretation?: {
            enable?: boolean;
            interpreters?: {
                email?: string;
                languages?: string;
            }[];
        };
        sign_language_interpretation?: {
            enable?: boolean;
            interpreters?: {
                email?: string;
                sign_language?: string;
            }[];
        };
        meeting_authentication?: boolean;
        meeting_invitees?: {
            email?: string;
        }[];
        mute_upon_entry?: boolean;
        participant_video?: boolean;
        private_meeting?: boolean;
        registrants_confirmation_email?: boolean;
        registrants_email_notification?: boolean;
        registration_type?: number;
        show_share_button?: boolean;
        use_pmi?: boolean;
        waiting_room?: boolean;
        watermark?: boolean;
        host_save_video_order?: boolean;
        alternative_host_update_polls?: boolean;
        internal_meeting?: boolean;
        continuous_meeting_chat?: {
            enable?: boolean;
            auto_add_invited_external_users?: boolean;
        };
        participant_focused_meeting?: boolean;
        push_change_to_calendar?: boolean;
        resources?: {
            resource_type?: string;
            resource_id?: string;
            permission_level?: string;
        }[];
        auto_start_meeting_summary?: boolean;
        auto_start_ai_companion_questions?: boolean;
        device_testing?: boolean;
    };
    start_time?: string;
    template_id?: string;
    timezone?: string;
    topic?: string;
    tracking_fields?: {
        field?: string;
        value?: string;
    }[];
    type?: number;
}

export interface MeetingResponse {
    assistant_id: string;
    host_email: string;
    id: number;
    registration_url: string;
    agenda: string;
    created_at: string;
    duration: number;
    encrypted_password: string;
    pstn_password: string;
    h323_password: string;
    join_url: string;
    chat_join_url: string;
    occurrences: {
        duration: number;
        occurrence_id: string;
        start_time: string;
        status: string;
    }[];
    password: string;
    pmi: string;
    pre_schedule: boolean;
    recurrence: {
        end_date_time: string;
        end_times: number;
        monthly_day: number;
        monthly_week: number;
        monthly_week_day: number;
        repeat_interval: number;
        type: number;
        weekly_days: string;
    };
    settings: {
        allow_multiple_devices: boolean;
        alternative_hosts: string;
        alternative_hosts_email_notification: boolean;
        alternative_host_update_polls: boolean;
        approval_type: number;
        approved_or_denied_countries_or_regions: {
            approved_list: string[];
            denied_list: string[];
            enable: boolean;
            method: string;
        };
        audio: string;
        audio_conference_info: string;
        authentication_domains: string;
        authentication_exception: {
            email: string;
            name: string;
            join_url: string;
        }[];
        authentication_name: string;
        authentication_option: string;
        auto_recording: string;
        breakout_room: {
            enable: boolean;
            rooms: {
                name: string;
                participants: string[];
            }[];
        };
        calendar_type: number;
        close_registration: boolean;
        contact_email: string;
        contact_name: string;
        custom_keys: {
            key: string;
            value: string;
        }[];
        email_notification: boolean;
        encryption_type: string;
        focus_mode: boolean;
        global_dial_in_countries: string[];
        global_dial_in_numbers: {
            city: string;
            country: string;
            country_name: string;
            number: string;
            type: string;
        }[];
        host_video: boolean;
        jbh_time: number;
        join_before_host: boolean;
        language_interpretation: {
            enable: boolean;
            interpreters: {
                email: string;
                languages: string;
            }[];
        };
        sign_language_interpretation: {
            enable: boolean;
            interpreters: {
                email: string;
                sign_language: string;
            }[];
        };
        meeting_authentication: boolean;
        mute_upon_entry: boolean;
        participant_video: boolean;
        private_meeting: boolean;
        registrants_confirmation_email: boolean;
        registrants_email_notification: boolean;
        registration_type: number;
        show_share_button: boolean;
        use_pmi: boolean;
        waiting_room: boolean;
        watermark: boolean;
        host_save_video_order: boolean;
        internal_meeting: boolean;
        meeting_invitees: {
            email: string;
        }[];
        continuous_meeting_chat: {
            enable: boolean;
            auto_add_invited_external_users: boolean;
            channel_id: string;
        };
        participant_focused_meeting: boolean;
        push_change_to_calendar: boolean;
        resources: {
            resource_type: string;
            resource_id: string;
            permission_level: string;
        }[];
        auto_start_meeting_summary: boolean;
        auto_start_ai_companion_questions: boolean;
        device_testing: boolean;
    };
    start_time: string;
    start_url: string;
    timezone: string;
    topic: string;
    tracking_fields: {
        field: string;
        value: string;
        visible: boolean;
    }[];
    type: number;
    dynamic_host_key: string;
}
