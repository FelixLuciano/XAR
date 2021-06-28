import HexPixels from "../modules/hex_pixels.mjs"
import History from "../modules/history.mjs"
import Encoder from "../modules/encoder.mjs"
import DrawingGesture from "../modules/drawing_gesture.mjs"
import Template from "../modules/template.mjs"

// Creating

const params = new URLSearchParams(location.search)
const width = parseInt(params.get("width")) || 5
const height = parseInt(params.get("height")) || 8
const character = new HexPixels(width, height)

// Mounting

const characterDot = new Template("character-dot-template")
const drawing = new DrawingGesture()

characterDot.on("mount", (dot, index) => {
    dot.addEventListener("click", () => {
        const value = !character.buffer[index]

        character.toggleDot(index, value)
    })

    dot.addEventListener("pointerdown", (event) => {
        const value = !character.buffer[index]

        drawing.dispatch(index, value, event)
    })

    character.buffer.on("set", (target, key, value) => {
        if (key === index)
            if (value)
                dot.classList.add("active")
            else
                dot.classList.remove("active")
    })
})

drawing.on("all", (index, value, type) => {
    if (type !== "end")
        character.toggleDot(index, value)
})

for (let index in character.buffer)
    characterDot.mount(characterDot.parent, characterDot.next, index)

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

// Character hexadecimal code

const characterCode_node = document.getElementById("character-code")
const codeEncoder = new Encoder(16, character.width, "<small>0x</small><strong>", "</strong>", ", ")


characterCode_node.addEventListener("click", () => {
    window.getSelection().selectAllChildren(characterCode_node)
})

character.buffer.on("set", () => {
    characterCode_node.innerHTML = codeEncoder.encode(character.binaries)
})

characterCode_node.innerHTML = codeEncoder.encode(character.binaries)

// Page URL parameters

function updateParam(name, value, href = location.href) {
    const matchValuePattern = `(?<=[?|&]${name}\=)\\w+`;
    const matchValue = new RegExp(matchValuePattern, "g")
    const newHref = href.replace(matchValue, value)

    window.history.pushState(null, "", newHref)
}

const initialParams = location.origin + location.pathname + `?width=${character.width}&height=${character.height}&code=${character.code}`

character.on("all", () => {
    updateParam("code", character.code)
})

window.history.pushState(null, "", initialParams)

// Clear button

const clearButton_node = document.getElementById("clear-button")

clearButton_node.addEventListener("click", () => character.clear())

// Share character button

const shareCharacterButton_node = document.getElementById("share-character-button")

shareCharacterButton_node.addEventListener("click", (event) => {
    event.preventDefault()

    window.navigator.share({
        url: location.href
    })
})

// Others

document.documentElement.style.setProperty("--character-width", character.width)
document.documentElement.style.setProperty("--character-height", character.height)

const code = params.get("code")

async function introAnimation() {
    if (character.width === 5 && character.height === 8) {
        await character.setCode("DLI449LM", true)
        await new Promise(resolve => setTimeout(resolve, 1024))
        await character.clear(true)
    }

    if (code)
        character.setCode(code)
}

introAnimation()


export default character
