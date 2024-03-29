import Observer from "./observer.mjs"

export default class Drawing extends Observer {
    dispatch(index, state, { target: dot }) {
        const dots = [...dot.parentNode.children]

        const startDrawing = () => {
            this.emit("start", index, state)
    
            for (let dot of dots)
                dot.addEventListener("mouseenter", drawing, { once: true })
        }
    
        const drawing = ({ target: dot }) => {
            index = dots.indexOf(dot)
    
            dot.focus()
            this.emit("drawing", index, state)
        }
    
        const endDrawing = () => {
            dot.removeEventListener("mouseleave", startDrawing)
    
            for (let dot of dots)
                dot.removeEventListener("mouseenter", drawing)
    
            this.emit("end", index, state)
        }

        dot.addEventListener("mouseleave", startDrawing, { once: true })
        window.addEventListener("mouseup", endDrawing, { once: true })
    }
}
