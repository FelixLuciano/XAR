class Watcher {
    #watchers = {}

    watch(name, callback) {
        if (!(name in this.#watchers))
            this.#watchers[name] = []

        this.#watchers[name].push(callback)
    }

    emit(name) {
        if(name in this.#watchers) {
            const value = this.records[this.pointer]
            console.log(value)

            for (let watcher of this.#watchers[name])
                watcher.call(this, value, name)
        }

        if (name !== "all")
            this.emit("all")
    }
}

export default Watcher
