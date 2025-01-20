import { Facebook, Instagram, Linkedin, Youtube } from "lucide-react";

export type EmailSignatureProps = {
    logoUrl: string;
    brandName1: string;
    brandName2: string;
    brandPhone: string;
    brandEmail: string;
    brandWebsite: string;
    brandLocation: string;
    brandEmailDisclaimer: string;
    brandFacebookLink: string;
    brandLinkedinLink: string;
    brandInstagramLink: string;
    brandYoutubeLink: string;
}

export const emailColors = {
    muted: '32 12% 45%',
    primary: "23 100% 50%",
    info: '201.2 98.1% 41.4%',
    background: '40 100% 98.8%',
    foreground: '0 0% 27.1%',
}

export function EmailSignature({
    logoUrl,
    brandName1,
    brandName2,
    brandPhone,
    brandEmail,
    brandWebsite,
    brandLocation,
    brandFacebookLink,
    brandLinkedinLink,
    brandInstagramLink,
    brandYoutubeLink,
    brandEmailDisclaimer
}: EmailSignatureProps) {

    return (
        <div style={{ borderTop: `1px solid ${emailColors.muted}`, paddingTop: '1.25rem', marginTop: '1.25rem', fontFamily: 'sans-serif', fontSize: '0.875rem', color: emailColors.foreground }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <img src={logoUrl} alt="Logo" width="50" style={{ borderRadius: '50%', marginRight: '0.625rem' }} />
                    <div>
                        <p style={{ fontWeight: 'bold', fontSize: '1.125rem', color: emailColors.primary }}>
                            {brandName1.toUpperCase()} {brandName2.toUpperCase()}
                        </p>
                        <p style={{ color: emailColors.muted }}>Courses - Gateling TMS</p>
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                            <a href={brandFacebookLink} style={{ backgroundColor: 'inherit', borderRadius: '0.125rem', padding: '0.125rem' }}>
                                <Facebook style={{ fontSize: '1.25rem', color: '#1877F2' }} />
                            </a>
                            <a href={brandLinkedinLink} style={{ backgroundColor: 'inherit', borderRadius: '0.125rem', padding: '0.125rem' }}>
                                <Linkedin style={{ fontSize: '1.25rem', color: '#0A66C2' }} />
                            </a>
                            <a href={brandInstagramLink} style={{ backgroundColor: 'inherit', borderRadius: '0.125rem', padding: '0.125rem' }}>
                                <Instagram style={{ fontSize: '1.25rem', color: '#E1306C' }} />
                            </a>
                            <a href={brandYoutubeLink} style={{ backgroundColor: 'inherit', borderRadius: '0.125rem', padding: '0.125rem' }}>
                                <Youtube style={{ fontSize: '1.25rem', color: '#FF0000' }} />
                            </a>
                        </div>
                    </div>
                </div>
                <div style={{ textAlign: 'right', display: "grid", gap: "2px" }}>
                    <p style={{ whiteSpace: 'nowrap' }}> {brandPhone}</p>
                    <p style={{ whiteSpace: 'nowrap' }}> {brandEmail}</p>
                    <p style={{ whiteSpace: 'nowrap' }}> {brandWebsite}</p>
                    <p style={{ whiteSpace: 'nowrap' }}> {brandLocation}</p>
                </div>
            </div>
            <p style={{ marginTop: '1.25rem', color: emailColors.muted }}>
                {brandEmailDisclaimer}
            </p>
        </div>
    )
};
