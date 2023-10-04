import { ConceptTitle } from "@/components/ui/Typoghraphy";
import { ApiAlert } from "@/components/ui/api-alert";
import { Button } from "@/components/ui/button";
import AppLayout from "@/layouts/AppLayout";
import { Typography } from "@mui/material";
import { ArrowRightFromLineIcon } from "lucide-react";
import type { NextPage } from "next";

const ConfigPage: NextPage = () => {
    return (
        <AppLayout>
            <ConceptTitle>Configure Facebook webhooks</ConceptTitle>
            <Typography></Typography>
            <ApiAlert title="webhook callback url" description="https://megz-courses.vercel.app/api/facebook" />
            <div className="flex items-center justify-between p-4">
                <Typography>once verified successfully your potintial customers will be added to your database</Typography>
                <Button>Go to Database <ArrowRightFromLineIcon></ArrowRightFromLineIcon></Button>
            </div>
        </AppLayout>
    )
}

export default ConfigPage