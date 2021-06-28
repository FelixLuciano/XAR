import Observer from "./observer.mjs"

export default class Press extends Observer {
    dispatch(...args) {
        let doHold = false
        const hold = setTimeout(() => doHold = true, 450)

        window.addEventListener("pointerup", async (event) => {
            clearTimeout(hold)

            if (doHold) this.emit("press", ...args, event)
            else this.emit("click", ...args, event)
        }, {
            once: true
        })
    }
}
