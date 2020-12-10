"use strict"

const { ref, reactive, computed } = Vue


const bool2bit  = bool => bool ? 1 : 0
const bits2bin  = bits => parseInt(bits.join(""), 2)
const bin2code  = (base, length) => bin => bin.toString(base).toUpperCase().padStart(length, "0")
const hexPrefix = hex => "0x" + hex

const code2dec = (hex, base, length) => hex.match(new RegExp(`.{${length}}`, 'g')).map(chunck => parseInt(chunck, base))
const dec2bits = (bins, length) => bins.map(bin => bin.toString(2).padStart(length, "0"))

const XAR_app = {
    setup () {
        const columns = 5
        const rows = 8


        const size = columns * rows
        const _bools = new Array(size).fill(false)
        const  bools = reactive(_bools)

        const chunks = computed(() => {
            const length = Math.ceil(size / columns)

            const chuncks = [ ...Array(length).keys() ]
                .map((i) => {
                    const sliceStart = columns * i
                    const sliceEnd   = columns + sliceStart
                    const chunck     = bools.slice(sliceStart, sliceEnd)

                    return chunck
                })

            return chuncks
        })

        const bins = computed(() => {
            return chunks.value
                .map(chunck => chunck.map(bool2bit))
                .map(bits2bin)
        })


        const base        = 16
        const bitRange    = 2**columns
        const hexLength   = Math.ceil(Math.log(bitRange) / Math.log(base))
        const bin2hex     = bin2code(16, hexLength)
        const displayCode = computed(() => bins.value.map(bin2hex).map(hexPrefix).join(", "))
        
        const dotsDisplay = computed(() => {
            return {
                "--columns": columns,
                "--rows": rows,
            }
        })
        

        const wideBase    = Math.min(bitRange, 36)
        const wideLength  = Math.ceil(Math.log(bitRange) / Math.log(wideBase))
        const bin2wide    = bin2code(wideBase, wideLength)
        const compactCode = computed(() => bins.value.map(bin2wide).join(""))


        const storage = reactive([])

        const storeCharacter = () => storage.push(compactCode.value)

        const getBits = (code) => dec2bits(code2dec(code, wideBase, wideLength), columns)

        // const localStorage = window.localStorage.getItem('XAR_characters')
        
        // if (localStorage)
        //     storage = localStorage
        //     .match()
        //     .map(color => 
        //         color.match(/./g)
        //         .map(tone => parseInt(tone, 16))
        //     )
    
        // else window.localStorage.setItem('XAR_characters', this.stringifyedColors)

        const bits2url = (bits) => {
            const canvas = document.createElement("canvas")
  
            canvas.width = columns
            canvas.height = rows
            
            const ctx = canvas.getContext('2d')
            
            ctx.fillStyle = "#351"
            
            for (let x in Array(columns).fill()) {
              for (let y in Array(rows).fill()) {
                const pixel = bits[y][x]
                
                if (pixel == "1") {
                  ctx.rect(x, y, 1, 1) 
                }
              }
            }
            
            ctx.fill()
            
            const url = canvas.toDataURL()
            
            return url
        }


        function draw ({target: dot}) {
            const state = !dot.checked
            const dots_tree = dot.parentNode.children
            const dots = [...dots_tree]
            const index = dots.indexOf(dot)
            
            const startDrawing = () => {
                bools[index] = state
                dot.removeEventListener('pointerleave', startDrawing)
                dots.forEach(dot => dot.addEventListener('pointerenter', drawing))
            }
            
            const drawing = ({target: dot}) => {
                const index = dots.indexOf(dot)
                
                bools[index] = state
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

        return {
            bools, dotsDisplay, draw, displayCode, storage, storeCharacter, getBits, bits2url
        }
    }
}

Vue.createApp(XAR_app).mount("#app")
