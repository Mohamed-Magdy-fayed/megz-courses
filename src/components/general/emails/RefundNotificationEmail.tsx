import { EmailSignatureProps } from '@/components/general/emails/EmailSignature';
import { env } from '@/env.mjs';
import {
    Body,
    Button,
    Container,
    Head,
    Hr,
    Html,
    Img,
    Preview,
    Section,
    Tailwind,
    Text,
} from '@react-email/components';

interface RefundNotificationEmailProps {
    name: string;
    refundAmount: string;
    orderNumber: string;
}

export const RefundNotificationEmail = ({
    name,
    refundAmount,
    orderNumber,
    logoUrl,
    brandName1,
    brandName2,
}: RefundNotificationEmailProps & EmailSignatureProps) => (
    <Html className="bg-white font-sans">
        <Head />
        <Preview>Refund Issued for Order #{orderNumber}</Preview>
        <Tailwind>
            <Body className="bg-white text-[#333]">
                <Container className="border border-gray-200 rounded-md my-10 mx-auto p-6 w-[465px]">
                    <Img
                        src={logoUrl}
                        width="60"
                        height="60"
                        alt="Logo"
                        className="mx-auto mb-4"
                    />

                    <Text className="text-center text-xl font-semibold my-4">💸 Refund Issued</Text>

                    <Text className="text-base leading-6">Hello {name},</Text>

                    <Text className="text-base leading-6">
                        A refund of <strong>{refundAmount}</strong> has been successfully processed for <strong>Order #{orderNumber}</strong>.
                    </Text>

                    <Text className="text-base leading-6">
                        You can view more details in your admin dashboard.
                    </Text>

                    <Section className="text-center mt-[32px] mb-[32px]">
                        <Button
                            className="bg-orange-500 rounded text-white text-[12px] p-[14px_20px_14px_20px] font-semibold no-underline text-center"
                            href={`${env.NEXTAUTH_URL}/admin/sales_management/orders/${orderNumber}`}
                        >
                            Proceed to payment
                        </Button>
                    </Section>

                    <Hr className="my-6 border-t border-gray-300" />

                    <Section className="text-center">
                        <Text className="text-xs text-gray-400">Gateling Solutions</Text>
                    </Section>
                </Container>
            </Body>
        </Tailwind>
    </Html>
);

export default RefundNotificationEmail;
