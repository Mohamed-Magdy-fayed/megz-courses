import { Button } from '@/components/ui/button';
import SelectField from '@/components/ui/SelectField';
import { StringKeyOf } from '@/components/ui/ServerDataTable/utils/types';
import { exportToExcel } from '@/lib/exceljs';
import { upperFirst } from 'lodash';
import { Dispatch, SetStateAction, useState } from 'react';

export default function ExportForm<TData>({ data, fileName, sheetName, selectedData, handleExport, setIsExportOpen, isLoading }: {
    data: TData[]; fileName: string; sheetName: string; isLoading: boolean; selectedData: TData[];
    setIsExportOpen: Dispatch<SetStateAction<boolean>>;
    handleExport: (keys: Extract<keyof TData, string>[]) => void;
}) {
    const [exportKeys, setExportKeys] = useState<StringKeyOf<TData>[]>([]);

    return (
        <div className="space-y-4">
            <SelectField
                multiSelect
                data={Object.keys(data[0]!).map(key => ({
                    Active: true,
                    label: upperFirst(key),
                    value: key as StringKeyOf<TData>,
                }))}
                listTitle="Fields"
                placeholder="Select fields"
                setValues={setExportKeys}
                values={exportKeys}
            />
            <Button
                disabled={isLoading}
                onClick={() => {
                    setIsExportOpen(false)
                    if (selectedData.length > 0) {
                        const exportData = selectedData.map((item) =>
                            exportKeys.reduce((acc, key) => {
                                acc[key] = item[key];
                                return acc;
                            }, {} as Partial<TData>)
                        );
                        return exportToExcel(exportData, fileName, sheetName)
                    }
                    handleExport(exportKeys);
                }}>
                Export
            </Button>
        </div>
    )
}
