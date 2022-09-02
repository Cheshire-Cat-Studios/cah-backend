module.exports = (reference, traits) => {
    !traits.length
        ? Object.assign(reference, typeof (traits) === 'function' ? traits() : traits)
        : traits.forEach(trait => {
            Object.assign(reference, typeof (trait) === 'function' ? trait() : trait)
        })
}