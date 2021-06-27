import Observer from "./observer.mjs"

export default class Template extends Observer {
    constructor(id) {
        super()

        const template = document.getElementById(id)
        this.parent = template.parentNode
        this.prev = template.previousSibling
        this.next = template.nextSibling

        this.node = template.content.firstElementChild.cloneNode(true)

        template.remove()
        this.emit("created", this.node)
    }

    mount(parentNode = this.parent, nextSibling, ...args) {
        const node = this.node.cloneNode(true)

        if (nextSibling === undefined)
            parentNode.appendChild(node)
        else
            parentNode.insertBefore(node, this.next)

        this.emit("mount", node, ...args)
    }
}
