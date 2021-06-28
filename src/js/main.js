const collectionSectionName_node = document.getElementById("collection-section-name")

collectionSectionName_node.innerText = localStorage.getItem("com.lucianofelix.xar-collection_name") || "MY CHARACTERS"

async function create() {
    await import("./components/character.mjs")
    await import("./components/collection.mjs")
}
create.call(this)
