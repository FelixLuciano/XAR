import Encoder from "./encoder.mjs"
import Reactive from "./reactive.mjs"
import Observer from "./observer.mjs"
import Binaries from "./binaries.mjs"



export default class HexPixels extends Observer {
    constructor(width, height) {
        super()
        
        this.width = width
        this.height = height
        this.encoder = new Encoder(36, width)

        const buffer = new Array(width * height).fill(false)
        this.buffer = new Reactive(buffer)
    }

    get binaries() {
        return Binaries.getChunks(this.buffer, this.width)
    }
    set binaries(binaries) {
        const buffer = Binaries.toBooleans(binaries, this.width)

        let i = 0
        for (let dotValue of buffer) {
            this.buffer[i] = dotValue
            i++
        }
    }
    setBinaries(binaries, tick = 32, isSilent = false) {
        const buffer = Binaries.toBooleans(binaries, this.width)
        const alpha = this.height / this.width

        return new Promise(resolve => {
            let i = 0
            for (let dotValue of buffer) {
                const x = i % this.width
                const y = Math.floor(i / this.width)
                const delay = tick * (x * alpha + y / alpha)

                setTimeout(i => this.buffer[i] = !this.buffer[i], delay, i)
                setTimeout(i => this.buffer[i] = dotValue, tick + delay, i)

                if (i === this.width * this.height - 1)
                    setTimeout(() => {
                        resolve()

                        if (!isSilent)
                            this.emit("change")
                    }, tick + delay, this)
                i++
            }
        })
    }


    get code() {
        return this.encoder.encode(this.binaries)
    }
    set code(code) {
        this.binaries = this.encoder.parse(code)
    }
    async setCode(code, isSilent = false) {
        await this.setBinaries(this.encoder.parse(code), 32, isSilent)
    }

    get pixels() {
        const currentcolor = getComputedStyle(document.documentElement).getPropertyValue("color")

        return this.getPixels(this.binaries, currentcolor)
    }

    toggleDot(index, value, isSilent = false) {
        const newValue = value || !this.buffer[index]
        const oldValue = this.buffer[index]

        this.buffer[index] = newValue

        if (!isSilent && oldValue !== newValue)
            this.emit("input")
    }

    async clear(isSilent = false) {
        const binaries = new Array(this.height).fill(0)

        await this.setBinaries(binaries, 32, true)

        if (!isSilent)
            this.emit("clear")
    }

    getPixels(binaries=this.binaries, fill="#000") {
        const buffer = Binaries.toBooleans(binaries, this.width)
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")

        canvas.width = this.width
        canvas.height = this.height
        ctx.fillStyle = fill

        let i = 0
        for (let dot of buffer) {
            if (dot) {
                const x = i % canvas.width
                const y = Math.floor(i / canvas.width)

                ctx.fillRect(x, y, 1, 1)
            }
            i++
        }

        return canvas.toDataURL()
    }
}
