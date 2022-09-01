module.exports = () => ({
    when(expression, true_closure, false_closure) {
        expression
            ? true_closure(this, expression)
            : false_closure && false_closure(this, expression)

        return this
    }

})