import { api } from "@/lib/api";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { LoadingButton } from "@/components/ui/button";
import { StorageReference, getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { storage } from "@/config/firebase";
import useFileUpload from "@/hooks/useFileUpload";

export type UploadStatus = { state: "Idle" | "Working", progress: number }

const UploadMaterialForm = ({
    setIsUploadOpen,
    id,
}: {
    setIsUploadOpen: (val: boolean) => void;
    id: string;
}) => {
    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState("");
    const [file, setFile] = useState<File>();

    const uploadMaterialMutation = api.materials.uploadMaterialItem.useMutation({
        onSuccess: ({ materialItem }) =>
            trpcUtils.courses.invalidate().then(() => {
                toastSuccess(`Your new material (${materialItem.upload?.title}) is ready!`)
                setIsUploadOpen(false)
            }),
        onError: ({ message }) => toastError(message),
        onSettled: () => setLoading(false),
    });
    const trpcUtils = api.useContext();
    const { toastError, toastSuccess } = useToast();
    const { progress, uploadFile } = useFileUpload();

    const handleSubmit = async () => {
        if (!file) return toastError("no file selected")
        if (title === "") return toastError("please enter a title")

        setLoading(true)
        
        const url = await uploadFile(file, `uploads/content/courses/${id}/${title}/${file.name}`) || ""
        
        uploadMaterialMutation.mutateAsync({ title: title, url, courseId: id });
    };


    return (
        <form>
            <div className="p-4">
                <label>Material Title</label>
                <Input disabled={loading} placeholder="Vocab, Grammar, ...etc" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="p-4">
                <label>Upload Material</label>
                <Input disabled={loading} type="file" placeholder="Upload Material" onChange={(e) => setFile(e.target.files![0])} />
            </div>
            <LoadingButton progress={progress} disabled={loading} type="button" onClick={() => handleSubmit()}>Submit</LoadingButton>
        </form>
    );
};

export default UploadMaterialForm;
