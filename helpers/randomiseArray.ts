export default (array: Array<any>): any =>
    array[
        Math.floor(
            Math.random() * array.length
        )
    ]