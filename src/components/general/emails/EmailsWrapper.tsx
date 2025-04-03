import { EmailSignatureProps } from '@/components/general/emails/EmailSignature';
import { PrismaClient } from '@prisma/client';
import { render } from '@react-email/render';

export async function EmailsWrapper<T>({ EmailComp, props, prisma }: {
    EmailComp: (args: T & EmailSignatureProps) => React.JSX.Element;
    props: T;
    prisma: PrismaClient
}) {
    const siteIdentity = await prisma.siteIdentity.findFirst({})

    const signatureProps: EmailSignatureProps = {
        logoUrl: siteIdentity?.logoPrimary ?? "No logoUrl",
        brandName1: siteIdentity?.name1 ?? "No brandName1",
        brandName2: siteIdentity?.name2 ?? "No brandName2",
        brandEmail: "siteIdentity.brandEmail",
        brandEmailDisclaimer: "siteIdentity.brandEmailDisclaimer",
        brandLocation: "siteIdentity.brandLocation",
        brandPhone: "siteIdentity.brandPhone",
        brandWebsite: "siteIdentity.brandWebsite",
        brandFacebookLink: siteIdentity?.facebook ?? "No facebook",
        brandLinkedinLink: siteIdentity?.linkedin ?? "No linkedin",
        brandInstagramLink: siteIdentity?.instagram ?? "No instagram",
        brandYoutubeLink: siteIdentity?.youtube ?? "No youtube",
    }

    return render(<EmailComp {...props} {...signatureProps} />, { pretty: true })
}
