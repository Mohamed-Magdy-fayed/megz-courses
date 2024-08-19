import { env } from '@/env.mjs';
import {
    Body,
    Button,
    Container,
    Column,
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
    customerName: string;
    userEmail: string;
    orderNumber: string;
    paymentLink: string;
    orderAmount: string;
    orderCreatedAt: string;
    logoUrl: string;
    courses: {
        courseName: string;
        coursePrice: string;
    }[]
}

export const Email = ({
    customerName,
    userEmail,
    orderNumber,
    paymentLink,
    orderAmount,
    orderCreatedAt,
    courses,
    logoUrl,
}: EmailProps) => {
    const previewText = `Thanks for your order ${orderNumber}`;

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
                                alt="Logo"
                                className="my-0 mx-auto"
                            />
                        </Section>
                        <Heading className="text-white text-[24px] font-normal text-center p-0 my-[30px] mx-0 bg-orange-500">
                            <Row>
                                <strong>Thanks</strong> for your order{" "}
                            </Row>
                            <Row>
                                <strong>{orderNumber}</strong>
                            </Row>
                        </Heading>
                        <Text className="text-black text-[14px] leading-[24px] px-[16px]">
                            Hello {customerName},
                        </Text>
                        <Text className="text-black text-[14px] leading-[24px] px-[16px]">
                            Your order <strong>{orderNumber}</strong> is pending payment now{' '}
                            <strong>{orderAmount}</strong>
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
                                                {userEmail}
                                            </Link>
                                        </Column>
                                    </Row>

                                    <Row align='left'>
                                        <Column style={informationTableColumn}>
                                            <Text style={informationTableLabel}>Invoice Date</Text>
                                            <Text style={informationTableValue}>{orderCreatedAt}</Text>
                                        </Column>
                                    </Row>

                                    <Row align='left'>
                                        <Column style={informationTableColumn}>
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
                                            <Text style={informationTableValue}>{orderAmount}</Text>
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
                        <Section style={productTitleTable}>
                            <Text style={productsTitle}>Courses</Text>
                        </Section>
                        {courses.map(({ courseName, coursePrice }, i) => (
                            <Section key={`mailCourseId${i}`}>
                                <Column style={{ paddingLeft: '22px', paddingBottom: "22px" }}>
                                    <Text style={productTitle}>{courseName}</Text>
                                    <Link
                                        href={`${env.NEXT_PUBLIC_NEXTAUTH_URL}help`}
                                        style={productLink}
                                        data-saferedirecturl={`https://www.google.com/url?q=${env.NEXT_PUBLIC_NEXTAUTH_URL}help&amp;source=gmail&amp;ust=1673963081204000&amp;usg=AOvVaw2DFCLKMo1snS-Swk5H26Z1`}
                                    >
                                        Write a Review
                                    </Link>
                                    <span style={divisor}>|</span>
                                    <Link
                                        href={`${env.NEXT_PUBLIC_NEXTAUTH_URL}help`}
                                        style={productLink}
                                        data-saferedirecturl={`https://www.google.com/url?q=${env.NEXT_PUBLIC_NEXTAUTH_URL}help&amp;source=gmail&amp;ust=1673963081204000&amp;usg=AOvVaw2DFCLKMo1snS-Swk5H26Z1`}
                                    >
                                        Report a Problem
                                    </Link>
                                </Column>

                                <Column style={productPriceWrapper} align="right">
                                    <Text style={productPrice}>{coursePrice}</Text>
                                </Column>
                            </Section>
                        ))}

                        <Hr style={productPriceLine} />
                        <Section align="right">
                            <Column style={tableCell} align="right">
                                <Text style={productPriceTotal}>TOTAL</Text>
                            </Column>
                            <Column style={productPriceVerticalLine}></Column>
                            <Column style={productPriceLargeWrapper}>
                                <Text style={productPriceLarge}>{orderAmount}</Text>
                            </Column>
                        </Section>

                        <Section className="text-center mt-[32px] mb-[32px]">
                            <Button
                                className="bg-orange-500 rounded text-white text-[12px] p-[14px_20px_14px_20px] font-semibold no-underline text-center"
                                href={paymentLink}
                            >
                                Proceed to payment
                            </Button>
                        </Section>
                        <Text className="text-black text-sm leading-6 px-[16px]">
                            or copy and paste this URL into your browser:{' '}
                            <Link
                                href={paymentLink}
                                className="text-blue-600 no-underline"
                            >
                                {paymentLink}
                            </Link>
                        </Text>
                        <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
                        <Text className="text-[#666666] text-[12px] leading-[24px] p-[16px]">
                            This email was intended for{' '}
                            <span className="text-black">{customerName} </span>. If you were not
                            expecting this email, you can ignore this email. If you are
                            concerned about your account's safety, please reply to this email to
                            get in touch with us.
                        </Text>
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

const tableCell = { display: 'table-cell' };

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

const productTitleTable = {
    ...informationTable,
    margin: '30px 0 15px 0',
    height: '24px',
};

const productsTitle = {
    background: '#fafafa',
    paddingLeft: '10px',
    fontSize: '14px',
    fontWeight: '500',
    margin: '0',
};

const productIcon = {
    margin: '0 0 0 20px',
    borderRadius: '100%',
    border: '1px solid rgba(128,128,128,0.2)',
};

const productTitle = { fontSize: '12px', fontWeight: '600', ...resetText };

const productDescription = {
    fontSize: '12px',
    color: 'rgb(102,102,102)',
    ...resetText,
};

const productLink = {
    fontSize: '12px',
    color: 'rgb(0,112,201)',
    textDecoration: 'none',
};

const divisor = {
    marginLeft: '4px',
    marginRight: '4px',
    color: 'rgb(51,51,51)',
    fontWeight: 200,
};

const productPriceTotal = {
    margin: '0',
    color: 'rgb(102,102,102)',
    fontSize: '10px',
    fontWeight: '600',
    padding: '0px 30px 0px 0px',
    textAlign: 'right' as const,
};

const productPrice = {
    fontSize: '12px',
    fontWeight: '600',
    margin: '0',
};

const productPriceLarge = {
    margin: '0px 20px 0px 0px',
    fontSize: '16px',
    fontWeight: '600',
    whiteSpace: 'nowrap' as const,
    textAlign: 'right' as const,
};

const productPriceWrapper = {
    display: 'table-cell',
    padding: '0px 20px 0px 0px',
    width: '100px',
    verticalAlign: 'top',
};

const productPriceLine = { margin: '30px 0 0 0' };

const productPriceVerticalLine = {
    height: '48px',
    borderLeft: '1px solid',
    borderColor: 'rgb(238,238,238)',
};

const productPriceLargeWrapper = { display: 'table-cell', width: '90px' };

const productPriceLineBottom = { margin: '0 0 75px 0' };

export default Email;