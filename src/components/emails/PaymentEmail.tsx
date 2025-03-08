import { EmailSignatureProps } from '@/components/emails/EmailSignature';
import { formatPrice } from '@/lib/utils';
import {
    Body,
    Container,
    Column,
    Head,
    Heading,
    Html,
    Img,
    Link,
    Preview,
    Row,
    Section,
    Tailwind,
    Text,
} from '@react-email/components';

interface PaymentEmailProps {
    name: string;
    email: string;
    orderNumber: string;
    paidAmount: string;
    remainingAmount: number;
    paymentDate: string;
    orderDate: string;
    orderTotal: string;
}

export const PaymentEmail = ({
    email,
    name,
    orderNumber,
    paidAmount,
    orderDate,
    paymentDate,
    orderTotal,
    remainingAmount,
    logoUrl,
}: PaymentEmailProps & EmailSignatureProps) => {
    const previewText = `Payment successfull ${orderNumber}`;

    return (
        <Html>
            <Head />
            <Preview>{previewText}</Preview>
            <Tailwind>
                <Body className="bg-white my-auto mx-auto font-sans">
                    <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] w-[465px]">
                        <Section className="mt-[32px]">
                            <Img
                                src={logoUrl}
                                width="60"
                                height="60"
                                alt="logo"
                                className="my-0 mx-auto"
                            />
                        </Section>
                        <Heading className="text-white text-[24px] font-normal text-center p-0 my-[30px] mx-0 bg-orange-500">
                            <Row>
                                <strong>Payment successful</strong>{" "}
                            </Row>
                            <Row>
                                <p>{orderNumber}</p>
                            </Row>
                            <Row>
                                <strong>{paidAmount}</strong>
                            </Row>
                        </Heading>
                        <Text className="text-black text-[14px] leading-[24px] px-[16px]">
                            Hello {name},
                        </Text>
                        <Text className="text-black text-[14px] leading-[24px] px-[16px]">
                            We have successfully recieved your payment of {paidAmount} to order {orderNumber}
                        </Text>
                        <Text className="text-black text-[14px] leading-[24px] px-[16px]">
                            {remainingAmount > 0 ? `the remaining amount is ${formatPrice(remainingAmount)}` : `this order is now full paid!`}
                        </Text>
                        <Section style={informationTable}>
                            <Row style={informationTableRow}>
                                <Column colSpan={2}>
                                    <Row align='left'>
                                        <Column style={informationTableColumn}>
                                            <Text style={informationTableLabel}>Email</Text>
                                            <Link
                                                style={{
                                                    ...informationTableValue,
                                                    color: '#15c',
                                                    textDecoration: 'underline',
                                                }}
                                            >
                                                {email}
                                            </Link>
                                        </Column>
                                    </Row>

                                    <Row align='left'>
                                        <Column style={informationTableColumn}>
                                            <Text style={informationTableLabel}>Invoice Date</Text>
                                            <Text style={informationTableValue}>{orderDate}</Text>
                                        </Column>
                                        <Column style={informationTableColumn}>
                                            <Text style={informationTableLabel}>Payment Date</Text>
                                            <Text style={informationTableValue}>{paymentDate}</Text>
                                        </Column>
                                    </Row>

                                    <Row align='left'>
                                        <Column style={{
                                            ...informationTableColumn,

                                        }}>
                                            <Text style={informationTableLabel}>Order Number</Text>
                                            <Link
                                                style={{
                                                    ...informationTableValue,
                                                    color: '#15c',
                                                    textDecoration: 'underline',
                                                }}
                                            >
                                                {orderNumber}
                                            </Link>
                                        </Column>
                                        <Column style={informationTableColumn}>
                                            <Text style={informationTableLabel}>Order Total</Text>
                                            <Text style={informationTableValue}>{orderTotal}</Text>
                                        </Column>
                                    </Row>
                                </Column>
                                <Column style={{ ...informationTableColumn, paddingRight: "22px" }} colSpan={2}>
                                    <Img
                                        src={logoUrl}
                                        width="64"
                                        height="64"
                                        alt="logo"
                                        style={productIcon}
                                    />
                                </Column>
                            </Row>
                        </Section>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
};

const resetText = {
    margin: '0',
    padding: '0',
    lineHeight: 1.4,
};

const informationTable = {
    borderCollapse: 'collapse' as const,
    borderSpacing: '0px',
    color: 'rgb(51,51,51)',
    backgroundColor: 'rgb(250,250,250)',
    borderRadius: '3px',
    fontSize: '12px',
};

const informationTableRow = {
    height: '46px',
};

const informationTableColumn = {
    paddingLeft: '20px',
    borderStyle: 'solid',
    borderColor: 'white',
    borderWidth: '0px 1px 1px 0px',
    height: '44px',
};

const informationTableLabel = {
    ...resetText,
    color: 'rgb(102,102,102)',
    fontSize: '10px',
};

const informationTableValue = {
    fontSize: '12px',
    margin: '0',
    padding: '0',
    lineHeight: 1.4,
};

const productIcon = {
    margin: '0 0 0 20px',
    borderRadius: '100%',
    border: '1px solid rgba(128,128,128,0.2)',
};

export default PaymentEmail;