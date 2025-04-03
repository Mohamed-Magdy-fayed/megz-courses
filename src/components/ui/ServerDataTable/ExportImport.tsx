import { Button } from "@/components/ui/button";
import Modal from "@/components/ui/modal";
import ExportForm from "@/components/ui/ServerDataTable/ExportForm";
import ImportForm from "@/components/ui/ServerDataTable/ImportForm";
import WrapWithTooltip from "@/components/ui/wrap-with-tooltip";
import { DownloadCloudIcon, UploadCloudIcon } from "lucide-react";
import { ReactNode, useState } from "react";

export default function ExportImport<TData>(props: {
    isLoading: boolean;
    data?: TData[];
    selectedData?: TData[];
    handleImport?: (data: TData[]) => void;
    handleExport?: (keys: Extract<keyof TData, string>[]) => void;
    importConfig?: {
        templateName: string;
        sheetName: string;
        reqiredFields: Extract<keyof TData, string>[]
        extraDetails?: ReactNode;
    },
    exportConfig?: {
        fileName: string;
        sheetName: string;
        fields?: Extract<keyof TData, string>[];
    },
} | undefined) {
    const [isImportOpen, setIsImportOpen] = useState<boolean>(false);
    const [isExportOpen, setIsExportOpen] = useState<boolean>(false);

    return (
        <div className="flex items-center gap-8">
            {props?.exportConfig && props?.data && props.handleExport && (
                <>
                    <WrapWithTooltip text="Export">
                        <Button
                            variant={"icon"}
                            customeColor={"mutedIcon"}
                            onClick={() => setIsExportOpen(true)}>
                            <DownloadCloudIcon className="text-primary" />
                        </Button>
                    </WrapWithTooltip>
                    <Modal
                        title="Export Data"
                        description="Select the fields to export"
                        isOpen={isExportOpen}
                        onClose={() => setIsExportOpen(false)}
                        children={
                            <ExportForm isLoading={props.isLoading} handleExport={props.handleExport} setIsExportOpen={setIsExportOpen} selectedData={props.selectedData || []} data={props?.data} fileName={props?.exportConfig.fileName} sheetName={props?.exportConfig.sheetName} />
                        }
                    />
                </>
            )}

            {props?.importConfig && (
                <>
                    <WrapWithTooltip text="Import">
                        <Button variant={"icon"} customeColor={"mutedIcon"} onClick={() => setIsImportOpen(true)}>
                            <UploadCloudIcon className="text-primary" />
                        </Button>
                    </WrapWithTooltip>
                    <Modal
                        title="Import Data"
                        description="Select a file to import"
                        isOpen={isImportOpen}
                        onClose={() => setIsImportOpen(false)}
                        children={
                            <ImportForm {...props?.importConfig} setIsImportOpen={setIsImportOpen} handleImport={props?.handleImport} />
                        }
                    />
                </>
            )}
        </div>
    )
}
