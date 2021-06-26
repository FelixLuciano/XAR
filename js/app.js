import { createApp, reactive, computed } from "https://cdnjs.cloudflare.com/ajax/libs/vue/3.1.1/vue.esm-browser.prod.js"

import HexPixels from "./components/hex_pixels.mjs"
import Storage from "./components/storage.mjs"
import History from "./components/history.mjs"
import Encoder from "./components/encoder.mjs"
import DrawingGesture from "./components/drawing_gesture.mjs"
import PressGesture from "./components/press_gesture.mjs"


const XAR_app = {
    setup() {
        // Character
        const character = new HexPixels(5, 8, reactive)
        const codeEncoder = new Encoder(16, character.width, "<small>0x</small><strong>", "</strong>", ", ")
        
        character.introAnimation = async function() {
            await character.setCode("DLI449LM", true)
            await new Promise(resolve => setTimeout(resolve, 1024))
            await character.clear(true)
        }
        character.displayCode = computed(() => {
            return codeEncoder.encode(character.binaries)
        })
        character.store = function() {
            character.setBinaries(character.binaries, 32, true)

            collection.store({
                code: character.code,
                pixels: character.pixels
            })
        }

        character.drawing = new DrawingGesture()
            .on("all", (index, value, type) => {
                if (type !== "end")
                    character.toggleDot(index, value)
            })

        document.documentElement.style.setProperty("--character-width", character.width)
        document.documentElement.style.setProperty("--character-height", character.height)
        character.introAnimation()

        // History

        const history = new History(character, "code")

        character.on("all", () => {
            history.recordStep()
        })

        document.addEventListener("keydown", ({ ctrlKey, key }) => {
            if (ctrlKey) {
                if (key === "z") history.undo()
                else if (key === "y") history.redo()
            }
        })

        // Collection


        const collection = new Storage({
            name: `com.lucianofelix.xar-collection:${character.width}x${character.height}`,
            legacyNames: [
                `XAR_${character.width}x${character.height}`,
                `com.lucianofelix.xar-storage:${character.width}x${character.height}`
            ],
            encode(buffer = []) {
                let data = ""
                for (let character of buffer)
                    data += character.code
                return data
            },
            decode(storedData) {
                const codeLength = character.encoder.padLength * character.height
                const matchCode = new RegExp(`.{${codeLength}}`, "g")
                const matches = storedData?.match(matchCode)
                const buffer = []
                
                if (matches?.length) {
                    const currentcolor = getComputedStyle(document.documentElement).getPropertyValue("color")

                    for (let code of matches) {
                        const pixels = character.getPixels(character.encoder.parse(code), currentcolor)

                        buffer.push({ code, pixels })
                    }
                }
                return reactive(buffer)
            }
        })

        collection.displayName = localStorage.getItem("com.lucianofelix.xar-collection_name") || "MY CHARACTERS"
        
        collection.inputName = function ({target}) {
            localStorage.setItem("com.lucianofelix.xar-collection_name", target.innerText)
        }

        collection.press = new PressGesture()
            .on("click", (index) => {
                const { code } = collection.buffer[index]

                if (character.code !== code)
                    character.setCode(code)
            })
            .on("press", (index, event) => {
                event.preventDefault()
                collection.remove(index)
        })

        // Others

        function selectText({ target }) {
            window.getSelection().selectAllChildren(target)
        }


        return {
            character,
            collection,
            history,
            selectText
        }
    }
}

createApp(XAR_app).mount("#app")
