"use strict"

const { ref, reactive, computed } = Vue

const XAR_app = {
    setup () {
        const sizeColumns = 5
        const sizeRows = 8
        const size = sizeColumns * sizeRows

        const _character = new Array(size).fill(false)
        const  character = reactive(_character)

        const rows = computed(() => {
            const length = Math.ceil(size / sizeColumns)

            const rows = [ ...Array(length).keys() ]
                .map((i) => {
                    const start = sizeColumns * i
                    const end   = sizeColumns + start
                    const row   = character.slice(start, end)

                    return row
                })

            return rows
        })

        const bool2bit = bool => bool ? 1 : 0
        const bits2bin = bits => parseInt(bits.join(""), 2)

        const bins = computed(() => {
            return rows.value
                .map(row => row.map(bool2bit))
                .map(bits2bin)
        })


        const base        = 16
        const bitRange    = 2**sizeColumns
        const hexLength   = Math.ceil(Math.log(bitRange) / Math.log(base))

        const displayCode = computed(() => bins.value.map(bin2hex).map(hexPrefix).join(", "))
        const bin2code    = (base, length) => bin => bin.toString(base).toUpperCase().padStart(length, "0")
        const bin2hex     = bin2code(16, hexLength)
        const hexPrefix   = hex => "0x" + hex
        
        const characterDisplay = computed(() => {
            return {
                "--columns": sizeColumns,
                "--rows": sizeRows,
            }
        })
        

        const wideBase    = Math.min(bitRange, 36)
        const wideLength  = Math.ceil(Math.log(bitRange) / Math.log(wideBase))

        const bin2wide    = bin2code(wideBase, wideLength)
        const compactCode = computed(() => bins.value.map(bin2wide).join(""))


        const storage = reactive([])

        const toStore = computed(() => storage.join(""))
        const updateStorage = () => window.localStorage.setItem("XAR_storage", toStore.value)

        const localStorage = window.localStorage.getItem("XAR_storage")
        if (localStorage) {
            const size = wideLength * sizeRows

            localStorage
                .match(new RegExp(`.{${size}}`, 'g'))
                .forEach(character => {
                    storage.push(character)
                })
        }
        else updateStorage()

        const storeCharacter  = () => storage.unshift(compactCode.value) && updateStorage()
        const deleteCharacter = i => storage.splice(i, 1) && updateStorage()


        const getBools = (code) => bits2bool(dec2bits(code2dec(code, wideBase, wideLength), sizeColumns))
        
        const code2dec  = (hex, base, length) => hex.match(new RegExp(`.{${length}}`, 'g')).map(chunck => parseInt(chunck, base))
        const dec2bits  = (bins, length) => bins.map(bin => bin.toString(2).padStart(length, "0"))
        const bits2bool = bits => bits.map(bit => bit.split("").map(bit2bool))
        const bit2bool  = bit => bit == "1" ? true : false

        const bits2url = (bits) => {
            const canvas = document.createElement("canvas")
            const ctx = canvas.getContext('2d')
            
            const width  = canvas.width  = sizeColumns
            const height = canvas.height = sizeRows
            ctx.fillStyle = "#351"
            
            for (let x = 0; x < width; x++)
              for (let y = 0; y < height; y++)
                if (bits[y][x])
                  ctx.fillRect(x, y, 1, 1)
            
            return canvas.toDataURL()
        }

        function setCharacter (rows) {
            const interval = 32
            
            rows.forEach((row, i) => {
                const time = interval * i

                setTimeout(() => {
                    row.forEach((bool, j) => {
                        const index = sizeColumns * i + j
                        const time = interval * j

                        setTimeout(() => character[index] = bool, time)
                    })
                }, time)
            })
        }

        function clear () {
            const cleanCharacter = new Array(sizeRows).fill(new Array(sizeColumns).fill(false))

            setCharacter(cleanCharacter)
        }


        function draw ({target: dot}) {
            const state = !dot.checked
            const dots_tree = dot.parentNode.children
            const dots = [...dots_tree]
            const index = dots.indexOf(dot)
            
            const startDrawing = () => {
                character[index] = state
                dot.removeEventListener('pointerleave', startDrawing)
                dots.forEach(dot => dot.addEventListener('pointerenter', drawing))
            }
            
            const drawing = ({target: dot}) => {
                const index = dots.indexOf(dot)
                
                character[index] = state
                dot.focus()
            }
            
            const endDrawing = () => {
                dot.removeEventListener('pointerleave', startDrawing)
                dots.forEach(dot => dot.removeEventListener('pointerenter', drawing))
                window.removeEventListener('pointerup', endDrawing)
            }
            
            dot.addEventListener('pointerleave', startDrawing)
            window.addEventListener('pointerup', endDrawing)
        }

        function select (index) {
            let doHold = false

            const hold = setTimeout(() => doHold = true, 450)

            const release = () => {
                clearTimeout(hold)
                window.removeEventListener("mouseup", release)
                window.removeEventListener("mousemove", release)

                if (doHold) deleteCharacter(index)
                else setCharacter(getBools(storage[index]))
            }
            window.addEventListener("mouseup", release)
            window.addEventListener("mousemove", release)
        }

        return {
            character, characterDisplay, draw, select, displayCode, storage, storeCharacter, getBools, bits2url, clear
        }
    }
}

Vue.createApp(XAR_app).mount("#app")
