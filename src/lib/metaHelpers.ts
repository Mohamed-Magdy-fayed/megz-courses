import axios, { AxiosResponse } from "axios";

export type GetConversationsResponse = {
    data: MessangerConversation[];
    paging: Paging;
}

type MessangerConversation = {
    id: string;
    senders: {
        data: User[];
    };
    messages: {
        data: Message[];
    };
};

type User = {
    name: string;
    email: string;
    id: string;
};

type Message = {
    from: User;
    message: string;
    id: string;
    created_time: Date
};

type Paging = {
    cursors: {
        before: string;
        after: string;
    };
    next?: string;
};

// Function to find conversation by sender ID
export async function findConversationBySenderId({ accessToken, senderId }: { senderId: string, accessToken: string }) {
    const conversations: AxiosResponse<GetConversationsResponse> = await axios.get(`https://graph.facebook.com/v20.0/me/conversations`,
        {
            params: {
                access_token: accessToken,
                fields: `senders`
            }
        }
    )

    const conversation = conversations.data.data.find(conv => conv.senders.data.some(sender => sender.id === senderId))

    return conversation
};

// Function to find conversation by ID
export async function findConversationById({ accessToken, conversationId }: { conversationId: string, accessToken: string }) {
    const conversationRes: AxiosResponse<MessangerConversation> = await axios.get(`https://graph.facebook.com/v20.0/${conversationId}`,
        {
            params: {
                access_token: accessToken,
            }
        }
    )

    const conversation = conversationRes.data

    return conversation
};

export async function sendMessageToUser({ metaUserId, text, accessToken }: { metaUserId: string; text: string; accessToken: string; }) {
    try {
        const response = await axios.post(`https://graph.facebook.com/v20.0/me/messages`, {
            recipient: { id: metaUserId },
            message: { text: text }
        }, {
            params: {
                access_token: accessToken
            },
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.data;
        return { data }
    } catch (error) {
        console.error('Error:', error);
    }
}
