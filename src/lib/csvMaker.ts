export const csvMaker = function <Data>(data: Data[]) {

    let csvRows = [];

    const headers = Object.keys(data[0] as object);

    csvRows.push(headers.join(','));

    for (const row of data) {
        const values = headers.map(e => {
            return row[e as keyof typeof data[0]]
        })
        csvRows.push(values.join(','))
    }

    const csvData = csvRows.join('\n')
    const blob = new Blob([csvData], { type: 'text/csv' });

    const url = window.URL.createObjectURL(blob)

    const a = document.createElement('a')

    a.setAttribute('href', url)

    a.setAttribute('download', 'download.csv');

    a.click()
}
