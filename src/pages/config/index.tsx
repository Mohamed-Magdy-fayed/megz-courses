import { ConceptTitle } from "@/components/ui/Typoghraphy";
import { ApiAlert } from "@/components/ui/api-alert";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AppLayout from "@/layouts/AppLayout";
import { Typography } from "@mui/material";
import { ArrowRightFromLineIcon } from "lucide-react";
import type { NextPage } from "next";

const ConfigPage: NextPage = () => {
    return (
        <AppLayout>
            <ConceptTitle>Configure Facebook webhooks</ConceptTitle>
            <Typography></Typography>
            <Tabs defaultValue="facebook" className="w-full mt-8 p-4">
                <TabsList>
                    <TabsTrigger value="facebook">Facebook</TabsTrigger>
                    <TabsTrigger value="other">Other</TabsTrigger>
                </TabsList>
                <TabsContent value="facebook">
                    <ApiAlert title="webhook callback url" description="https://megz-courses.vercel.app/api/facebook" />
                    <div className="flex items-center justify-between p-4">
                        <Typography>once verified successfully your potintial customers will be added to your database</Typography>
                        <Button>Go to Database <ArrowRightFromLineIcon></ArrowRightFromLineIcon></Button>
                    </div>
                </TabsContent>
                <TabsContent value="other">
                    Comming Soon...
                </TabsContent>
            </Tabs>

        </AppLayout>
    )
}

export default ConfigPage