import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { ConceptTitle, Typography } from "@/components/ui/Typoghraphy";
import { Course, CourseLevel, MaterialItem } from "@prisma/client";
import { FC } from "react";

type CourseShowcaseProps = {
    course: Course & {
        levels: (CourseLevel & {
            materialItems: MaterialItem[];
        })[];
    };
}

const CourseShowcase: FC<CourseShowcaseProps> = ({ course }) => {
    return (
        <div className="space-y-8 p-4 w-full">
            <div className="space-y-2">
                <ConceptTitle>Describtion</ConceptTitle>
                <Typography>{course.description}</Typography>
            </div>
            <Accordion type="multiple">
                {course.levels.map(lvl => (
                    <AccordionItem key={lvl.id} value={lvl.id}>
                        <AccordionTrigger>
                            <Typography variant={"secondary"} className="text-primary">{lvl.name}</Typography>
                        </AccordionTrigger>
                        <AccordionContent>
                            <Typography variant={"secondary"}>Materials Overview</Typography>
                            {lvl.materialItems.map(item => (
                                <div key={item.id} className="grid gap-2 border-primary border rounded-xl mt-2 p-2">
                                    <Typography>{item.title}</Typography>
                                    <Typography>{item.subTitle}</Typography>
                                    <Typography>{item.type === "Manual" ? "Interactive Session" : "Downloadable Content"}</Typography>
                                    <div className="grid">
                                        {item.uploads.map(url => {
                                            const itemName = url.split(`${item.slug}%2F`)[1]?.split("?alt=")[0]
                                            return (
                                                <Button variant={"link"} className="text-info">
                                                    {itemName}
                                                </Button>
                                            )
                                        })}
                                    </div>
                                </div>
                            ))}
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
    )
}

export default CourseShowcase