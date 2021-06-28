export default class Binaries {
    static fromBooleans(booleans) {
        let acumulador = 0
    
        for (let index in booleans)
            acumulador += booleans[index] ? 2**(booleans.length - index - 1) : 0
    
        return acumulador
    }
    
    static *toBooleans(binaries, bits) {
        for (let binarie of binaries) {
            const booleans = binarie.toString(2).padStart(bits, "0")
                    
            for (let boolean of booleans)
                yield boolean == "1" ? true : false
        }
    }

    static *getChunks(source, size) {
        for (let i = 0; i < source.length; i += size)
            yield this.fromBooleans(source.slice(i, i + size))
    }
}
