import { ConceptTitle, Typography } from "@/components/ui/Typoghraphy";
import { ApiAlert } from "@/components/ui/api-alert";
import { Button } from "@/components/ui/button";
import AppLayout from "@/components/layout/AppLayout";
import { ArrowRightFromLineIcon, PlusSquare } from "lucide-react";
import type { NextPage } from "next";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import PlacementTestTimesClient from "@/components/placementTest/PlacementTestTimesClient";
import Modal from "@/components/ui/modal";
import { useState } from "react";
import { TimePicker } from "@/components/ui/TimePicker";

const ConfigPage: NextPage = () => {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <AppLayout>
            <Modal
                title="Create"
                description="Create a test time"
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
            >
                <TestTimesForm />
            </Modal>
            <Tabs defaultValue="config">
                <TabsList>
                    <TabsTrigger value="config">
                        Facebook Configuration
                    </TabsTrigger>
                    <TabsTrigger value="placement-test-times">
                        Placement Test Times
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="config">
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
                </TabsContent>
                <TabsContent value="placement-test-times">
                    <div className="flex items-center justify-between w-full">
                        <ConceptTitle>Placement Test Times</ConceptTitle>
                        <Button onClick={() => setIsOpen(true)} >
                            <PlusSquare className="w-4 h-4 mr-2" />
                            Create a Time
                        </Button>
                    </div>
                    <PlacementTestTimesClient />
                </TabsContent>
            </Tabs>
        </AppLayout>
    )
}

const TestTimesForm = () => {
    const [time, setTime] = useState<Date>()

    return (
        <div className="space-y-4">
            <TimePicker
                date={time}
                setDate={setTime}
            />
            <Button onClick={() => { }}>Create</Button>
        </div>
    )
}

export default ConfigPage