import * as XLSX from 'xlsx';

export const importFromExcel = (file: File, onFileLoad: (data: any[]) => void) => {
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            if (!event.target) return alert("error line 8: useXlsx.ts")
            const data = new Uint8Array(event.target.result as ArrayBufferLike);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName!];
            const jsonData = XLSX.utils.sheet_to_json(sheet!);
            onFileLoad(jsonData);
        };
        reader.readAsArrayBuffer(file);
    }
};

export function exportToExcel(data: any[], fileName: string, sheetName: string) {
    const formattedData = data.map(item => {
        const stringKeys = Object.keys(item).filter(key => typeof item[key] === "string")
        const formattedObject: { [key: string]: string } = {};
        stringKeys.map(key => formattedObject[key] = item[key])
        return formattedObject
    })
    const worksheet = XLSX.utils.json_to_sheet(formattedData);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });

    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.setAttribute('href', url)
    a.setAttribute('download', `${fileName}.xlsx`);
    a.click()
};

export function downloadTemplate({ reqiredFields, sheetName, templateName }: { reqiredFields: string[], templateName: string, sheetName: string }) {
    const worksheet = XLSX.utils.json_to_sheet(reqiredFields.map(key => ({ [key]: "" })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });

    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.setAttribute('href', url)
    a.setAttribute('download', `${templateName}.xlsx`);
    a.click()
};