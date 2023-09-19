export const csvMaker = function <Data>(data: Data[]) {

    let csvRows = [];

    const headers = Object.keys(data[0] as object);
    console.log(headers);

    csvRows.push(headers.join(','));
    console.log(csvRows);

    for (const row of data) {
        const values = headers.map(e => {
            return row[e as keyof typeof data[0]]
        })
        csvRows.push(values.join(','))
    }
    console.log(csvRows);

    const csvData = csvRows.join('\n')
    console.log(csvData);
    const blob = new Blob([csvData], { type: 'text/csv' });

    const url = window.URL.createObjectURL(blob)
    console.log(url);

    const a = document.createElement('a')

    a.setAttribute('href', url)

    a.setAttribute('download', 'download.csv');

    a.click()
}
