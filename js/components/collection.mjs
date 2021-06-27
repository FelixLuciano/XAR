import Storage from "../modules/storage.mjs"
import PressGesture from "../modules/press_gesture.mjs"
import Template from "../modules/template.mjs"
import character from "./character.mjs"

// Creating

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
        return buffer
    }
})

// Collection name

const collectionSectionName_node = document.getElementById("collection-section-name")

collectionSectionName_node.addEventListener("input", ({ target }) => {
    localStorage.setItem("com.lucianofelix.xar-collection_name", target.innerText)
})
collectionSectionName_node.addEventListener("focus", () => {
    window.getSelection().selectAllChildren(collectionSectionName_node)
})
collectionSectionName_node.addEventListener("keydown", ({ target, key }) => {
    if (key === "Enter")
        target.blur()
})

// Store button

const storeButton_node = document.getElementById("store-button")

storeButton_node.addEventListener("click", () => {
    character.setBinaries(character.binaries, 32, true)

    collection.store({
        code: character.code,
        pixels: character.pixels
    })
})

// Mounting items

const collectionItem = new Template("collection-item-template")
const press = new PressGesture()
    .on("click", (index) => {
        const { code } = collection.buffer[index]

        if (character.code !== code)
            character.setCode(code)
    })
    .on("press", (index, event) => {
        event.preventDefault()
        collection.remove(index)
})

collectionItem.on("mount", (item, data) => {
    const image_node = item.querySelector("img")

    image_node.src = data.pixels

    item.addEventListener("pointerdown", () => {
        const index = collection.buffer.indexOf(data)

        press.dispatch(index)
    })

    collection.on("remove", () => {
        const index = collection.buffer.indexOf(data)
        
        if (index === -1)
            item.remove()
    })
})

collection.on("store", (item) => {
    collectionItem.mount(collectionItem.parent, collectionItem.next, item)
})

for (let item of collection.buffer)
    collectionItem.mount(collectionItem.parent, collectionItem.next, item)


export default collection
