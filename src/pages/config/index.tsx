import { ConceptTitle, Typography } from "@/components/ui/Typoghraphy";
import { ApiAlert } from "@/components/ui/api-alert";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import AppLayout from "@/components/layout/AppLayout";
import { ArrowRightFromLineIcon } from "lucide-react";
import type { NextPage } from "next";
import Link from "next/link";

const ConfigPage: NextPage = () => {
    return (
        <AppLayout>
            <ConceptTitle>Configure Facebook webhooks</ConceptTitle>
            <ApiAlert title="webhook callback url" description="https://megz-courses.vercel.app/api/facebook" />
            <div className="flex items-center justify-between p-4">
                <Typography>once verified successfully your potintial customers will be added to your database</Typography>
                <Link href={`/database`}>
                    <Button className="whitespace-nowrap space-x-2" customeColor={"primaryOutlined"} variant={"outline"}>
                        <Typography variant={"buttonText"}>Go to Database</Typography>
                        <ArrowRightFromLineIcon></ArrowRightFromLineIcon>
                    </Button>
                </Link>
            </div>
        </AppLayout>
    )
}

export default ConfigPage