import { createApp, ref, reactive, computed } from "https://cdnjs.cloudflare.com/ajax/libs/vue/3.1.1/vue.esm-browser.prod.js"

import HexPixels from "./components/hex_pixels.mjs"
import Storage from "./components/storage.mjs"
import History from "./components/history.mjs"


const XAR_app = {
    setup() {
        const character = new HexPixels(5, 8, reactive)
        const history = new History(character, "code")

        function clear() {
            const cleanCharacter = [...character.buffer].fill(false)

            character.setPixels(cleanCharacter)
            history.recordStep()
        }


        const dotsNode = ref(null)

        function draw({ target: dot }) {
            const state = !dot.checked
            const dots_tree = dotsNode.value.children
            const dots = [...dots_tree]
            let index = dots.indexOf(dot)

            const startDrawing = () => {
                toggle(index, state)
                dots.forEach(dot => dot.addEventListener("mouseenter", drawing))
            }
            const drawing = ({ target: dot }) => {
                index = dots.indexOf(dot)

                toggle(index, state)
                dot.focus()
            }
            const endDrawing = () => {
                dot.removeEventListener("mouseleave", startDrawing)
                dots.forEach(dot => dot.removeEventListener("mouseenter", drawing))
            }

            dot.addEventListener("mouseleave", startDrawing, { once: true })
            window.addEventListener("mouseup", endDrawing, { once: true })
        }
        function toggle(index, value) {
            const newValue = value || !character.buffer[index]
            const oldValue = character.buffer[index]

            character.buffer[index] = newValue

            if (oldValue !== newValue)
                history.recordStep()
        }

        const currentcolor = getComputedStyle(document.documentElement).getPropertyValue("color")

        const storage = new Storage({
            name: "com.lucianofelix.xar-storage:5x8",
            legacyNames: ["XAR_5x8"],
            encode(buffer = []) {
                let data = ""

                for (let character of buffer)
                    data += character.code

                return data
            },
            decode(storedData) {
                const buffer = []
                const codeLength = character.code.length
                const matchCode = new RegExp(`.{${codeLength}}`, "g")
                const matches = storedData?.match(matchCode)

                if (matches?.length) {
                    for (let code of matches) {
                        const pixels = character.getPixels(character.parse(code), currentcolor)

                        buffer.push({
                            code,
                            pixels
                        })
                    }
                }

                return reactive(buffer)
            }
        })

        function press(index) {
            let doHold = false

            const hold = setTimeout(() => doHold = true, 450)

            window.addEventListener("pointerup", (event) => {
                clearTimeout(hold)

                if (doHold) {
                    event.preventDefault()
                    storage.remove(index)
                }
                else {
                    history.recordStep()
                    character.setPixels(character.parse(storage.buffer[index].code))
                }
            }, { once: true })
        }

        function recordStep() {
            return history.recordStep()
        }
        function store() {
            storage.store({
                code: character.code,
                pixels: character.pixels
            })
        }

        const styleScope = computed(() => {
            return {
                "--size-columns": character.width,
                "--size-rows": character.height
            }
        })

        return {
            dotsNode,
            character,
            draw,
            styleScope,
            clear,
            storage,
            recordStep,
            store,
            press
        }
    }
}

createApp(XAR_app).mount("#app")
