import Observer from "./observer.mjs"

class History extends Observer {
    records = []
    pointer = -1

    constructor(target, key, update=true) {
        super()
        
        this.target = target
        this.key = key
        this.update = update

        this.recordStep()
    }

    recordStep(value = this.target[this.key]) {
        this.pointer++
        this.records[this.pointer] = value
        
        this.clearRedo()
        this.emit("step", value)
    }

    undo(steps = 1) {
        if (this.pointer - steps >= 0) {
            const value = this.records[this.pointer - steps]

            if (this.update)
                this.target[this.key] = value

            this.pointer -= steps
            this.emit("undo", value)
        }
    }

    redo(steps = 1) {
        if (this.pointer + steps <= this.records.length - 1) {
            const value = this.records[this.pointer + steps]

            if (this.update)
                this.target[this.key] = value

            this.pointer += steps
            this.emit("redo", value)
        }
    }

    clearRedo() {
        this.records.length = this.pointer + 1
    }
}

export default History
