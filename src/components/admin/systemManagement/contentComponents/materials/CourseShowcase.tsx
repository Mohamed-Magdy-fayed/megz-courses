import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ConceptTitle, Typography } from "@/components/ui/Typoghraphy";
import { Prisma } from "@prisma/client";

type CourseShowcaseProps = {
    course: Prisma.CourseGetPayload<{ include: { levels: { include: { materialItems: true } } } }>;
}

const CourseShowcase = ({ course }: CourseShowcaseProps) => {
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
                            {lvl.materialItems.sort((a, b) => a.sessionOrder - b.sessionOrder).map(item => (
                                <Card key={item.id} className="grid gap-2 rounded-xl mt-2 p-2">
                                    <CardHeader>
                                        <CardTitle>{item.title}</CardTitle>
                                        <CardDescription>{item.subTitle}</CardDescription>
                                    </CardHeader>
                                    <CardContent>{item.uploads.length}{" "}{item.type === "Manual" ? "Interactive Session" : "Downloadable Content"}</CardContent>
                                    <CardFooter className="grid">
                                        {item.uploads.map(url => {
                                            const itemName = url.split(`${item.slug}%2F`)[1]?.split("?alt=")[0]
                                            return (
                                                <Typography key={url} className="in-table-link">
                                                    {itemName || url}
                                                </Typography>
                                            )
                                        })}
                                    </CardFooter>
                                </Card>
                            ))}
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
    )
}

export default CourseShowcase
