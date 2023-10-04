'use client'

export const advancedSearch = (query: string, data: string[]) => {
    const queryArr = query.toLowerCase().split("")
    const result = []
    console.log(query);
    console.log(data);


    for (let item of data) {
        let match = false
        let nextItem = item.toLowerCase()
        for (let letter of queryArr) {
            const exists = nextItem.includes(letter)

            if (!exists) {
                match = false
                break
            }

            nextItem = nextItem.slice(nextItem.indexOf(letter) + 1)
            console.log(nextItem);

            match = true
        }
        if (match) result.push(item)
    }

    console.log(result);

    return result
}