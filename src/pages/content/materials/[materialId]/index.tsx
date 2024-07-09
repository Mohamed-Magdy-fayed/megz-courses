import Spinner from "@/components/Spinner";
import MaterialsEditForm from "@/components/contentComponents/materials/MaterialsEditForm";
import AppLayout from "@/components/layout/AppLayout";
import { api } from "@/lib/api";
import { useRouter } from "next/router";
import { ref, listAll, ListResult, getDownloadURL } from "firebase/storage";
import { useEffect, useRef, useState } from "react";
import { storage } from "@/config/firebase";
import { ConceptTitle, Typography } from "@/components/ui/Typoghraphy";
import { PaperContainer } from "@/components/ui/PaperContainers";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Button, LoadingButton } from "@/components/ui/button";
import { ArrowLeftToLine, Copy, Download, Trash, Upload } from "lucide-react";
import { Input } from "@/components/ui/input";
import useFileUpload from "@/hooks/useFileUpload";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import useFileDownload from "@/hooks/useFileDownload";
import { deleteFile } from "@/lib/firebaseStorage";
import { useToast } from "@/components/ui/use-toast";

const EditMaterialPage = () => {
  const router = useRouter();
  const id = router.query.materialId as string;
  const { data } = api.materials.getById.useQuery({ id });
  const inputRef = useRef<HTMLInputElement>(null)
  const { progress, uploadFile } = useFileUpload()
  const { downloadFile } = useFileDownload()
  const { toastInfo } = useToast()

  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [pathQuery, setPathQuery] = useState("")
  const [items, setItems] = useState<ListResult["items"]>([])
  const [prefixes, setPrefixes] = useState<ListResult["prefixes"]>([])
  const [breadcrumbData, setBreadcrumbData] = useState<{ label: string, href: string }[]>([])

  const getBreadcrumbLabel = (segment: string, index: number) => {
    if (segment === "uploads") return "Root"
    if (segment === "content") return "Content"
    if (segment === "courses") return "Courses"
    if (index === 3) return data?.materialItem?.course?.name || ""
    if (index === 4) return data?.materialItem?.title || ""
    return ""
  }

  const handleUpload = async (file: File) => {
    if (!file) return
    setUploading(true)
    uploadFile(file, `${pathQuery}/${file.name}`)
      .then(() => setUploading(false))
  }

  const handleDownload = async (path: string) => {
    downloadFile(path)
  }

  const handleCopy = async (path: string) => {
    const fileRef = ref(storage, path)
    const url = await getDownloadURL(fileRef)
    navigator.clipboard.writeText(url);
    toastInfo("Link copied to the clipboard");
  }

  const handleDelete = async (path: string) => {
    setLoading(true)
    deleteFile(path)
      .then(() => {
        loadData()
      })
  }

  const loadData = () => {
    const storageRef = ref(
      storage,
      pathQuery
    );

    setLoading(true)
    listAll(storageRef).then((data) => {
      setItems(data.items);
      setPrefixes(data.prefixes);
      setLoading(false)
    })

    const items = pathQuery.split("/")
    const paths = items.map((segment, index) => {
      const href = items.slice(0, index + 1).join('/');
      const label = getBreadcrumbLabel(segment, index)

      return {
        label,
        href,
      };
    })

    setBreadcrumbData(paths)
  }

  useEffect(() => {
    if (!pathQuery) {
      if (!router.query.path) return
      const currentPath = router.query.path as string
      const storageRef = ref(
        storage,
        currentPath
      );

      setLoading(true)
      listAll(storageRef).then((data) => {
        setItems(data.items);
        setPrefixes(data.prefixes);
        setLoading(false)
      })

      const items = currentPath.split("/")
      const paths = items.map((segment, index) => {
        const href = items.slice(0, index + 1).join('/');
        const label = getBreadcrumbLabel(segment, index)

        return {
          label,
          href,
        };
      })

      setBreadcrumbData(paths)
    } else {
      loadData()
    }
  }, [pathQuery])

  useEffect(() => {
    setPathQuery(router.query.path as string)
  }, [router.query.path])

  if (!data?.materialItem) return <Spinner className="mx-auto" />

  if (data.materialItem.type === "upload") return (
    <AppLayout>
      <div className="flex items-center gap-2">
        <Button variant={"icon"} customeColor={"infoIcon"} onClick={() => router.push(`/content/courses/${data.materialItem?.courseId}`)}>
          <ArrowLeftToLine className="w-4 h-4" />
        </Button>
        <ConceptTitle>Uploads</ConceptTitle>
      </div>
      <PaperContainer>
        <div className="flex items-center justify-between">
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbData.map((item, index) => (
                <div key={item.href} className="flex items-center gap-2">
                  <BreadcrumbItem>
                    <BreadcrumbLink className="cursor-pointer" onClick={() => router.push(`${id}?path=${item.href}`)}>{item.label}</BreadcrumbLink>
                  </BreadcrumbItem>
                  {index !== breadcrumbData.length - 1 && <BreadcrumbSeparator />}
                </div>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
          <Input
            disabled={uploading}
            onChange={(e) => handleUpload(e.target.files![0]!)}
            type="file"
            className="hidden"
            ref={inputRef}
          />
          <LoadingButton progress={progress} disabled={uploading} onClick={() => inputRef.current?.click()}>
            <div className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              <Typography>Upload</Typography>
            </div>
          </LoadingButton>
        </div>
        {loading ? (
          <div className="p-4 grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {[1, 2, 3, 4, 5].map(item => (
              <Skeleton key={`skele${item}`} className="h-40" />
            ))}
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-2 p-2">
              <Typography variant={"secondary"}>Files</Typography>
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
                        <Card className="[&>*]:p-2 justify-between flex flex-col cursor-pointer" key={item.fullPath} onClick={() => router.push(`${id}?path=${item.fullPath}`)}>
                          <CardContent className="grid place-content-center">
                            <Image src={fileLogo} alt={item.fullPath.split(".")[1] || ""} height={100} width={100} />
                          </CardContent>
                          <CardFooter className="text-sm truncate">
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
                        <ContextMenuItem onClick={() => handleDelete(item.fullPath)}>
                          <Trash className="w-4 h-4 mr-2" />
                          <Typography>Delete</Typography>
                        </ContextMenuItem>
                      </ContextMenuContent>
                    </ContextMenu>
                  )
                })}
              </div>
            </div>
            <Separator />
            <div className="flex flex-col gap-2 p-2">
              <Typography variant={"secondary"}>Folders</Typography>
              <div className="p-4 grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                {prefixes.map(item => (
                  <ContextMenu key={item.fullPath}>
                    <ContextMenuTrigger asChild>
                      <Card key={item.fullPath} className="[&>*]:p-2 cursor-pointer" onClick={() => router.push(`${id}?path=${item.fullPath}`)}>
                        <CardContent className="grid place-content-center">
                          <Image src="/svgs/folder.png" alt={item.fullPath.split("/")[item.fullPath.split("/").length - 1] || ""} height={100} width={100} />
                        </CardContent>
                        <CardFooter className="text-sm">{item.name}</CardFooter>
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
                      <ContextMenuItem onClick={() => handleDelete(item.fullPath)}>
                        <Trash className="w-4 h-4 mr-2" />
                        <Typography>Delete</Typography>
                      </ContextMenuItem>
                    </ContextMenuContent>
                  </ContextMenu>
                )
                )}
              </div>
            </div>
          </>
        )}
      </PaperContainer>
    </AppLayout>
  )

  return (
    <AppLayout>
      <MaterialsEditForm materialItem={data.materialItem} />
    </AppLayout>
  );
};

export default EditMaterialPage;
