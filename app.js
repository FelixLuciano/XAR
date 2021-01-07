import { createApp, reactive, computed } from "https://cdnjs.cloudflare.com/ajax/libs/vue/3.0.2/vue.esm-browser.prod.js"

const sleep = time => new Promise(resolve => setTimeout(resolve, time))

const XAR_app = {
    setup() {
        const sizeColumns = 5
        const sizeRows = 8
        const size = sizeColumns * sizeRows

        const _character = new Array(size).fill(false)
        const character = reactive(_character)

        const binaries = computed(() => {
            const binaries = []

            for (let i = 0; i < size; i += sizeColumns) {
                const bools = character.slice(i, i + sizeColumns)
                const bits = bools.join("").replaceAll("true", "1").replaceAll("false", "0")
                const bin = parseInt(bits, 2)

                binaries.push(bin)
            }

            return binaries
        })

        function draw({ target: dot }) {
            const state = !dot.checked
            const dots_tree = dot.parentNode.children
            const dots = [...dots_tree]
            let index = dots.indexOf(dot)

            const startDrawing = () => {
                character[index] = state

                dots.forEach(dot => dot.addEventListener("pointerenter", drawing))
            }

            const drawing = ({ target: dot }) => {
                index = dots.indexOf(dot)

                character[index] = state
                dot.focus()
            }

            const endDrawing = () => {
                dot.removeEventListener("pointerleave", startDrawing)
                dots.forEach(dot => dot.removeEventListener("pointerenter", drawing))
            }

            dot.addEventListener("pointerleave", startDrawing, { once: true })
            window.addEventListener("pointerup", endDrawing, { once: true })
        }

        function clear() {
            const cleanCharacter = new Array(sizeRows).fill(
                new Array(sizeColumns).fill(false)
            )

            setCharacter(cleanCharacter)
        }

        const base = 16
        const bitRange = 2 ** sizeColumns
        const hexLength = Math.ceil(Math.log(bitRange) / Math.log(base))

        const hexCode = computed(() => {
            return binaries.value
            .map((bin) =>
                "0x" + bin.toString(16).toUpperCase().padStart(hexLength, "0")
            )
            .join(", ")
        })

        function selectText({ target }) {
            window.getSelection().selectAllChildren(target)
        }

        const codeBase = Math.min(bitRange, 36)
        const codeLength = Math.ceil(Math.log(bitRange) / Math.log(codeBase))
        const matchCodeBit = new RegExp(`.{${codeLength}}`, "g")
        const codeSize = codeLength * sizeRows
        const matchCode = new RegExp(`.{${codeSize}}`, "g")

        const characterCode = computed(() => {
            return binaries.value
            .map((bin) =>
                bin.toString(codeBase).toUpperCase().padStart(codeLength, "0")
            )
            .join("")
        })

        function parseCode(code) {
            const match = code.match(matchCodeBit)

            const bools = match.map((chunck) => {
                const bin = parseInt(chunck, codeBase)
                const bits = bin.toString(2).padStart(sizeColumns, "0").split("")
                const bools = bits.map((bit) => bit == "1" ? true : false)

                return bools
            })

            return bools
        }

        function getCharacter(code) {
            const bools = parseCode(code)
            const canvas = document.createElement("canvas")
            const ctx = canvas.getContext("2d")

            const width = canvas.width = sizeColumns
            const height = canvas.height = sizeRows
            ctx.fillStyle = "#351"

            for (let x = 0; x < width; x++) {
                for (let y = 0; y < height; y++) {
                    if (bools[y][x]) {
                    ctx.fillRect(x, y, 1, 1)
                    }
                }
            }

            const image = canvas.toDataURL()

            return image
        }

        const characterImg = computed(() => getCharacter(characterCode.value))

        const storage = reactive([])
        const buffer = reactive([])

        const storage_name    = `XAR_${sizeColumns}x${sizeRows}`
        const refreshStorage  = () => window.localStorage.setItem(storage_name, storage.join(""))
        const storeCharacter  = () => storage.unshift(characterCode.value) && buffer.unshift(characterImg.value) && refreshStorage()
        const deleteCharacter = i  => storage.splice(i, 1) && buffer.splice(i, 1) && refreshStorage()

        const localStorage = window.localStorage.getItem(storage_name)
        
        if (localStorage)
            for (let code of localStorage.match(matchCode)) {
                storage.push(code)
                buffer.push(getCharacter(code))
            }
        else refreshStorage()

        function setCharacter(bools) {
            const alpha = sizeColumns / sizeRows
            const tick = 32

            bools.forEach(async (row, i) => {
                const time = tick * i * alpha

                await sleep(time)

                row.forEach(async (bool, j) => {
                    const index = sizeColumns * i + j
                    const time = tick * j / alpha

                    await sleep(time)
                    character[index] = !bool
                    await sleep(tick)
                    character[index] = bool
                })
            })
        }

        function press(index) {
            let doHold = false

            const hold = setTimeout(() => doHold = true, 450)

            window.addEventListener("mouseup", () => {
                clearTimeout(hold)

                if (doHold) deleteCharacter(index)
                else setCharacter(parseCode(storage[index]))
            }, { once: true })
        }

        const styleScope = computed(() => {
            return {
                "--size-columns": sizeColumns,
                "--size-rows": sizeRows
            }
        })

        return {
            styleScope,
            character,
            draw,
            hexCode,
            selectText,
            clear,
            buffer,
            storeCharacter,
            press
        }
    }
}

createApp(XAR_app).mount("#app")
