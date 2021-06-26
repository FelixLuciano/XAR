class Encoder {
    constructor(base, bits, prefix="", sufix="", separator="") {
        const range = 2 ** bits

        this.prefix = prefix
        this.sufix = sufix
        this.separator = separator
        this.base = Math.min(range, base)
        this.padLength = Math.ceil(Math.log(range) / Math.log(this.base))
    }

    encode(binaries, prefix=this.prefix, sufix=this.sufix, separator=this.separator) {
        let code = []

        for (let binarie of binaries) {
            const encoded = binarie
                .toString(this.base)
                .toUpperCase()
                .padStart(this.padLength, "0")
            
            code.push(`${prefix}${encoded}${sufix}`)
        }

        return code.join(separator)
    }

    *parse(code, prefix=this.prefix, sufix=this.sufix, separator=this.separator) {
        const sliced = code.slice(prefix.length, code.length - sufix.length)
        const splitSeparator = sufix + separator + prefix

        let chuncks = null
        if (splitSeparator.length > 0) {
            chuncks = sliced.split(splitSeparator)
        }
        else {
            const matchChunks = new RegExp(`.{${this.padLength}}`, "g")

            chuncks = sliced.match(matchChunks)
        }
        
        for (let chunck of chuncks)
            yield parseInt(chunck, this.base)
    }
}

export default Encoder
