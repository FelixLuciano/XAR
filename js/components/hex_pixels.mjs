class HexPixels {
    constructor(width, height, proxy, base=16) {
        this.width = width
        this.height = height
        this.size = width * height
        this.base = base

        const buffer = new Array(this.size).fill(false)
        this.buffer = proxy ? proxy(buffer) : buffer
    }

    get displayCode() {
        return this.encode(this.buffer, this.base, "<small>0x</small><strong>", "</strong>", ", ")
    }

    get code() {
        return this.encode(this.buffer)
    }

    set code(code) {
        const buffer = this.parse(code)

        this.setPixels(buffer)
    }

    get binaries() {
        return this.getBinaries()
    }

    get pixels() {
        const currentcolor = getComputedStyle(document.documentElement).getPropertyValue("color")

        return this.getPixels(this.buffer, currentcolor)
    }

    setPixels (buffer) {
        const alpha = this.width / this.height
        const tick = 32

        for (let i = 0; i < buffer.length; i++) {
            const column = i % this.width
            const row = Math.floor(i / this.width)
            
            const delay = tick * (row * alpha + column / alpha)

            setTimeout(() => {
                this.buffer[i] = !this.buffer[i]

                setTimeout(() => {
                    this.buffer[i] = buffer[i]
                }, tick)
            }, delay)
        }
    }

    getBinaries(buffer = this.buffer) {
        const binaries = []
    
        for (let i = 0; i < this.size; i += this.width) {
            const bools = buffer.slice(i, i + this.width)
            const bits = bools.join("").replaceAll("true", "1").replaceAll("false", "0")
            const bin = parseInt(bits, 2)
    
            binaries.push(bin)
        }
    
        return binaries
    }

    encode(buffer=this.buffer, codeBase=36, prefix="", sufix="", separator="") {
        const range = 2 ** this.width
        const base = Math.min(range, codeBase)
        const padLength = Math.ceil(Math.log(range) / Math.log(base))

        const code = this.getBinaries(buffer)
            .map((binnarie) => {
                const encoded = binnarie.toString(base).toUpperCase().padStart(padLength, "0")

                return prefix + encoded + sufix
            })
            .join(separator)

        return code
    }

    parse(code) {
        const bitRange = 2 ** this.width
        const base = Math.min(bitRange, 36)
        const padLength = Math.ceil(Math.log(bitRange) / Math.log(base))
        const matchCodeBit = new RegExp(`.{${padLength}}`, "g")
        const matches = code.match(matchCodeBit)

        const boools = []
        
        for (let chunck of matches) {
            const bin = parseInt(chunck, base)
            const bits = bin.toString(2).padStart(this.width, "0")
            
            for (let bit of bits) {
                const bool = bit == "1" ? true : false
                boools.push(bool)
            }
        }

        return boools
    }

    getPixels(buffer=this.buffer, fill="#000") {
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")

        canvas.width = this.width
        canvas.height = this.height
        ctx.fillStyle = fill

        for (let i = 0; i < this.size; i++) {
            if (buffer[i]) {
                const x = i % this.width
                const y = Math.floor(i / this.width)

                ctx.fillRect(x, y, 1, 1)
            }
        }

        return canvas.toDataURL()
    }
}

export default HexPixels
