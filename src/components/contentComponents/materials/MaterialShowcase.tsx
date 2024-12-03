import ControlledPracticeContainer from "@/components/materialsShowcaseComponents/ControlledPracticeContainer";
import FirstTestContainer from "@/components/materialsShowcaseComponents/FirstTestContainer";
import TeachingContainer from "@/components/materialsShowcaseComponents/TeachingContainer";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@/components/ui/context-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Typography } from "@/components/ui/Typoghraphy";
import { useToast } from "@/components/ui/use-toast";
import { storage } from "@/config/firebase";
import useFileDownload from "@/hooks/useFileDownload";
import { cn } from "@/lib/utils";
import { useDraggingStore } from "@/zustand/store";
import { Course, CourseLevel, MaterialItem, SystemForm, ZoomSession } from "@prisma/client";
import { getDownloadURL, listAll, ListResult, ref } from "firebase/storage";
import { Download, Copy, Trash } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/router";
import { FC, useEffect, useState } from "react";

type MaterialShowcaseProps = {
    course: Course & {
        levels: (CourseLevel & {
            materialItems: MaterialItem[];
        })[];
    };
    materialItem: MaterialItem & {
        zoomSessions: ZoomSession[];
        systemForms: SystemForm[];
    }
}

const MaterialShowcase: FC<MaterialShowcaseProps> = ({ materialItem, course }) => {
    const pathQuery = `uploads/content/courses/${course.slug}/${course.levels.find(lvl => lvl.materialItems.some(item => item.id === materialItem.id))?.slug}/${materialItem.slug}`
    const router = useRouter();
    const { submission } = useDraggingStore();
    const { downloadFile } = useFileDownload()
    const { toastInfo } = useToast()

    const [loading, setLoading] = useState(false)
    const [items, setItems] = useState<ListResult["items"]>([])

    const handleDownload = async (path: string) => {
        downloadFile(path)
    }

    const handleCopy = async (path: string) => {
        const fileRef = ref(storage, path)
        const url = await getDownloadURL(fileRef)
        navigator.clipboard.writeText(url);
        toastInfo("Link copied to the clipboard");
    }

    const loadData = () => {
        const storageRef = ref(
            storage,
            pathQuery
        );

        console.log(pathQuery);


        setLoading(true)
        listAll(storageRef).then((data) => {
            setItems(data.items);
            setLoading(false)
        })
    }

    useEffect(() => {
        if (!pathQuery || pathQuery === "") {
            if (!router.query.path) return
            const currentPath = router.query.path as string
            const storageRef = ref(
                storage,
                currentPath
            );


            setLoading(true)
            listAll(storageRef).then((data) => {
                setItems(data.items);
                setLoading(false)
            })

        } else {
            loadData()
        }
    }, [pathQuery])

    if (materialItem.type === "Upload") return (
        <div className="flex flex-col gap-2 p-2">
            <Typography variant={"secondary"}>{materialItem.title} Downloadables</Typography>
            {loading ? (
                <div className="p-4 grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                    {[1, 2, 3, 4, 5].map(item => (
                        <Skeleton key={`skele${item}`} className="h-40" />
                    ))}
                </div>
            ) : (
                <div className="p-4 grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                    {items.map(item => {
                        const fileType = () => {
                            if (item.fullPath.toLocaleLowerCase().endsWith("ppt") || item.fullPath.toLocaleLowerCase().endsWith("pptx")) return "Power Point"
                            if (item.fullPath.toLocaleLowerCase().endsWith("doc") || item.fullPath.toLocaleLowerCase().endsWith("docx")) return "Word"
                            if (item.fullPath.toLocaleLowerCase().endsWith("jpg") || item.fullPath.toLocaleLowerCase().endsWith("png")) return "Image"
                        }
                        const fileLogo = fileType() === "Image"
                            ? "/svgs/png.png"
                            : fileType() === "Power Point"
                                ? "/svgs/pptx.png"
                                : fileType() === "Word"
                                    ? "/svgs/docx.png"
                                    : ""

                        return (
                            <ContextMenu key={item.fullPath}>
                                <ContextMenuTrigger asChild>
                                    <Card className="[&>*]:p-2 justify-between flex flex-col cursor-pointer" key={item.fullPath} onClick={() => handleDownload(item.fullPath)}>
                                        <CardContent className="grid place-content-center">
                                            <Image src={fileLogo} alt={item.fullPath.split(".")[1] || ""} height={100} width={100} />
                                        </CardContent>
                                        <CardFooter className="text-sm">
                                            {item.name}
                                        </CardFooter>
                                    </Card>
                                </ContextMenuTrigger>
                                <ContextMenuContent>
                                    <ContextMenuItem onClick={() => handleDownload(item.fullPath)}>
                                        <Download className="w-4 h-4 mr-2" />
                                        <Typography>Download</Typography>
                                    </ContextMenuItem>
                                    <ContextMenuItem onClick={() => handleCopy(item.fullPath)}>
                                        <Copy className="w-4 h-4 mr-2" />
                                        <Typography>Copy Link</Typography>
                                    </ContextMenuItem>
                                </ContextMenuContent>
                            </ContextMenu>
                        )
                    })}
                </div>
            )}
        </div>
    )

    return (
        <div>
            <div className="flex flex-col items-center p-4">
                <Typography className="text-center text-2xl font-bold">
                    {materialItem.manual?.leadinText}
                </Typography>
                <img src={materialItem.manual?.leadinImageUrl} className="max-h-[50vh] object-cover" />
            </div>
            <div className="flex items-center justify-between">
                <div className="flex flex-col items-center whitespace-nowrap p-4">
                    <Typography className="w-full text-left text-4xl font-bold text-cyan-600">
                        {materialItem.title}
                    </Typography>
                    <Typography className="w-full text-left text-base text-warning">
                        {materialItem.subTitle}
                    </Typography>
                </div>
                {submission.Completed && (
                    <div className="flex flex-col gap-2 whitespace-nowrap p-4 [&>*]:text-sm">
                        <Typography
                            className={cn(
                                "",
                                submission.highestScore > 50 ? "text-success" : "text-error"
                            )}
                        >
                            HighestScore: {submission.highestScore.toFixed(2)}%
                        </Typography>
                        <Typography>Attempts: {submission.attempts}</Typography>
                    </div>
                )}
            </div>
            <div className="flex flex-col items-center p-4">
                <Typography className="text-center text-2xl font-bold">{ }</Typography>
                <div className="flex flex-col gap-4">
                    <FirstTestContainer
                        DBcards={materialItem.manual?.answerCards!}
                        DBareas={materialItem.manual?.answerAreas!}
                        firstTestTitle={materialItem.manual?.firstTestTitle!}
                    />
                    <TeachingContainer vocabularyCards={materialItem.manual?.vocabularyCards!} />
                    <ControlledPracticeContainer practiceQuestions={materialItem.manual?.practiceQuestions!} />
                </div>
            </div>
        </div>
    )
}

export default MaterialShowcase