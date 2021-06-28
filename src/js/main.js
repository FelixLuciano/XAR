document.addEventListener("DOMContentLoaded", () => {
    const collectionSectionName_node = document.getElementById("collection-section-name")

    collectionSectionName_node.innerText = localStorage.getItem("com.lucianofelix.xar-collection_name") || "MY CHARACTERS"
    
    import("./components/character.mjs")
    import("./components/collection.mjs")
})
