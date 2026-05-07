import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Typography } from "@/components/ui/Typoghraphy";
import { api } from "@/lib/api";

type CertificateCanvasProps = {
  studentName: string;
  courseName: string;
  trainerName: string;
  completionDate: string;
  certificateId: string;
  levelName?: string;
};

const CertificateCanvas = ({
  studentName,
  courseName,
  levelName,
  trainerName,
  completionDate,
  certificateId,
}: CertificateCanvasProps) => {
  const { data } = api.siteIdentity.getSiteIdentity.useQuery();

  return (
    <div className="w-full">
      <Card
        data-certificate-canvas="true"
        className="printable relative max-w-3xl mx-auto border-8 border-primary bg-white overflow-hidden"
      >
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-foreground/10" />
        <div className="absolute -left-24 -bottom-24 h-72 w-72 rounded-full bg-secondary/10" />

        <div className="relative z-10 flex h-full flex-col text-center p-4">
          <div className="mx-auto flex w-fit items-center gap-4 rounded-xl border border-primary/20 bg-white/90 p-4">
            <Avatar className="h-16 w-16 border-2 border-primary/40 bg-white">
              <AvatarImage src={data?.siteIdentity.logoPrimary} />
              <AvatarFallback>Logo</AvatarFallback>
            </Avatar>
            <div className="text-left space-x-2">
              <Typography className="text-lg font-semibold text-primary">
                {data?.siteIdentity.name1} {data?.siteIdentity.name2}
              </Typography>
              <Typography className="text-sm text-muted">Official Certificate</Typography>
            </div>
          </div>

          <CardHeader>
            <CardTitle>
              Certificate of Completion
            </CardTitle>
            <CardDescription>This certifies that</CardDescription>
          </CardHeader>

          <CardContent>
            <h2 className="text-3xl font-bold uppercase tracking-wider">{studentName}</h2>
            <p className="text-muted">has successfully completed the course</p>
            <h3 className="text-2xl font-semibold">{courseName}</h3>
            <p className="pt-2 text-lg text-muted">on {completionDate}</p>

            <div className="mx-auto w-fit rounded-md border border-primary/20 bg-[#F8FAFC] px-4 py-2">
              <Typography>
                Certificate ID: <span className="font-mono">{certificateId}</span>
              </Typography>
            </div>
          </CardContent>

          <CardFooter className="grid grid-cols-2 gap-8 p-4">
            <div className="text-center flex flex-col gap-2 items-center">
              <Separator className="mx-auto mb-2 m-4 bg-primary/70" />
              <Typography className="text-base font-semibold text-primary">Manager Signature</Typography>
              <Typography className="text-sm text-[#475569]">
                {data?.siteIdentity.name1} {data?.siteIdentity.name2}
              </Typography>
            </div>
            <div className="text-center flex flex-col gap-2 items-center">
              <Separator className="mx-auto mb-2 m-4 bg-primary/70" />
              <Typography className="text-base font-semibold text-primary">Trainer Signature</Typography>
              <Typography className="text-sm text-[#475569]">{trainerName || "Course Instructor"}</Typography>
            </div>
          </CardFooter>
        </div>
      </Card>
    </div>
  );
};

export default CertificateCanvas;
