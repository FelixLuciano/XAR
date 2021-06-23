import Watcher from "./watcher.mjs"

class History extends Watcher{
    records = []
    pointer = -1

    constructor(target, key, update=true) {
        super()
        
        this.target = target
        this.key = key
        this.update = update

        this.recordStep()

        document.addEventListener("keydown", ({ ctrlKey, key }) => {
            if (ctrlKey) {
                if (key === "z") this.undo()
                else if (key === "y") this.redo()
            }
        })
    }

    recordStep() {
        this.pointer++
        this.records[this.pointer] = this.target[this.key]
        this.records.length = this.pointer + 1

        this.emit("step")
    }

    undo(steps = 1) {
        if (this.pointer - steps >= 0) {
            this.pointer -= steps
            this.emit("undo")

            if (this.update)
                this.target[this.key] = this.records[this.pointer]
        }
    }

    redo(steps = 1) {
        if (this.pointer + steps <= this.records.length - 1) {
            this.pointer += steps
            this.emit("redo")

            if (this.update)
                this.target[this.key] = this.records[this.pointer]
        }
    }
}

export default History
