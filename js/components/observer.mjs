export default class Obsever {
    #observers = {}

    on(name, callback) {
        if (!(name in this.#observers))
            this.#observers[name] = []

        this.#observers[name].push(callback)

        return this
    }

    emit(observerName, ...args) {
        if (observerName in this.#observers) {
            for (let observer of this.#observers[observerName])
                observer.call(this, ...args)
        }

        if ("all" in this.#observers) {
            for (let observer of this.#observers["all"])
                observer.call(this, ...args, observerName)
        }
    }
}
