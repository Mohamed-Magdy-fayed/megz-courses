import { EmailSignatureProps } from '@/components/general/emails/EmailSignature';
import {
    Body,
    Button,
    Column,
    Container,
    Head,
    Heading,
    Hr,
    Html,
    Img,
    Link,
    Preview,
    Row,
    Section,
    Tailwind,
    Text,
} from '@react-email/components';

interface EmailProps {
    adminName: string;
    userEmail: string;
    orderNumber: string;
    orderAmount: string;
    orderCreatedAt: string;
    product: {
        productName: string;
        productPrice: string;
    };
}

export const OrderNotificationEmail = ({
    adminName,
    userEmail,
    orderNumber,
    orderAmount,
    orderCreatedAt,
    product,
    ...emailSignatureProps
}: EmailProps & EmailSignatureProps) => {
    const previewText = `New order received: ${orderNumber}`;

    return (
        <Html>
            <Head />
            <Preview>{previewText}</Preview>
            <Tailwind>
                <Body className="bg-white font-sans">
                    <Container className="border border-gray-200 rounded-md my-10 mx-auto p-6 w-[465px]">
                        <Section className="text-center">
                            <Img
                                src={emailSignatureProps.logoUrl}
                                width="60"
                                height="60"
                                alt="Logo"
                                className="mx-auto mb-4"
                            />
                            <Heading className="text-xl font-semibold text-orange-600">
                                🎉 New Order Received!
                            </Heading>
                            <Text className="text-sm text-gray-600">
                                Order #{orderNumber} placed on {orderCreatedAt}
                            </Text>
                        </Section>

                        <Hr className="my-6" />

                        <Section>
                            <Text className="text-base text-gray-800 mb-2">
                                Hello <strong>{adminName}</strong>,
                            </Text>
                            <Text className="text-sm text-gray-700 mb-4">
                                A new order has been placed with a total amount of{' '}
                                <strong>{orderAmount}</strong>. Please find the details below:
                            </Text>

                            <Row className="mb-4">
                                <Column>
                                    <Text className="text-xs text-gray-500">Customer Email</Text>
                                    <Link className="text-sm text-blue-600 underline">
                                        {userEmail}
                                    </Link>
                                </Column>
                            </Row>

                            <Row className="mb-4">
                                <Column>
                                    <Text className="text-xs text-gray-500">Product</Text>
                                    <Text className="text-sm font-medium text-gray-900">
                                        {product.productName}
                                    </Text>
                                </Column>
                                <Column align="right">
                                    <Text className="text-xs text-gray-500">Price</Text>
                                    <Text className="text-sm font-medium text-gray-900">
                                        {product.productPrice}
                                    </Text>
                                </Column>
                            </Row>

                            <Hr className="my-4" />

                            <Row>
                                <Column>
                                    <Text className="text-xs text-gray-500">Order Total</Text>
                                </Column>
                                <Column align="right">
                                    <Text className="text-lg font-bold text-gray-800">
                                        {orderAmount}
                                    </Text>
                                </Column>
                            </Row>
                        </Section>

                        <Hr className="my-6" />

                        <Section className="text-center">
                            <Text className="text-xs text-gray-400">Gateling Solutions</Text>
                        </Section>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
};

export default OrderNotificationEmail;
