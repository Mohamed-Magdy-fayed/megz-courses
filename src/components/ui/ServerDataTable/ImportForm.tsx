import { SpinnerButton } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Typography } from '@/components/ui/Typoghraphy';
import { useToast } from '@/components/ui/use-toast';
import { useDropFile } from '@/hooks/useDropFile';
import { downloadTemplate, importFromExcel } from '@/lib/exceljs';
import { cn } from '@/lib/utils';
import { DownloadIcon, UploadIcon } from 'lucide-react';
import React, { Dispatch, ReactNode, SetStateAction, useRef } from 'react'

export default function ImportForm<TData>(importConfig: {
    templateName: string;
    sheetName: string;
    reqiredFields: Extract<keyof TData, string>[]
    extraDetails?: ReactNode;
    handleImport?: (data: TData[]) => void;
    setIsImportOpen: Dispatch<SetStateAction<boolean>>;
}) {
    const {
        isDragActive,
        handleDragEnter,
        handleDragLeave,
        handleDragOver,
        handleDrop,
        handleFileChange,
        setSelectedFile,
        selectedFile,
    } = useDropFile();
    const inputRef = useRef<HTMLInputElement>(null)
    const { toast } = useToast()

    return (
        <div className="flex flex-col items-center gap-4 p-4">
            <div
                onClick={() => inputRef.current?.click()}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className={cn("border-dashed border-2 border-primary p-8 text-center w-full", isDragActive ? "bg-primary-foreground" : "bg-muted/10")}
            >
                <Input
                    ref={inputRef}
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                    id="fileInput"
                />
                <Typography>
                    {isDragActive
                        ? 'Drop your files here...'
                        : 'Drag and drop files here, or click to select file'}
                </Typography>

                {!!selectedFile && (
                    <div>
                        <Typography variant={"secondary"}>Selected File:</Typography>
                        <Typography>{selectedFile.name}</Typography>
                    </div>
                )}
            </div>
            {!!importConfig.extraDetails && importConfig.extraDetails}
            <div className="flex items-center justify-center gap-4">
                <SpinnerButton
                    customeColor={"info"}
                    loadingText="Downloading"
                    icon={DownloadIcon}
                    isLoading={false}
                    onClick={() => downloadTemplate(importConfig)}
                    text="Download Template"
                />

                <SpinnerButton
                    loadingText="Importing..."
                    icon={UploadIcon}
                    isLoading={false}
                    onClick={() => {
                        if (!selectedFile) return toast({ title: "Error", description: "No file selected!", variant: "destructive" })
                        if (!importConfig.handleImport) return toast({ title: "Error", description: "No import configured!", variant: "destructive" })
                        importFromExcel(selectedFile, importConfig.handleImport)
                        setSelectedFile(undefined)
                        if (inputRef.current) {
                            inputRef.current.value = ""
                        }
                        importConfig.setIsImportOpen(false)
                    }}
                    text="Import Data"
                />
            </div>
        </div>
    )
}
