import Observer from "./observer.mjs"


export default class Reactive extends Observer {
    constructor(source) {
        super()
        
        return new Proxy(source, {
            get: (target, key) => {
                this.emit("get", target, key)
    
                return source[key] || this[key]
            },
            set: (target, key, value) => {
                source[key] = value
                
                this.emit("set", target, key, value)

                return true
            }
        })
    }
}
