import Observer from "./observer.mjs"

const defaults = {
	name: undefined,
	legacyNames: [],
	encode: undefined,
	decode: undefined
}

export default class Storage extends Observer {
	constructor(config) {
		super()

		this.config = {...defaults, ...config}
		this.buffer = undefined

		this.updateLegacy()
		this.load()
	}

	updateLegacy() {
		for (let legacyName of this.config.legacyNames) {
			const legacyStorage = window.localStorage.getItem(legacyName)

			if (legacyStorage) {
				const newStorage = window.localStorage.getItem(this.config.name) || ""
				window.localStorage.setItem(
					this.config.name,
					newStorage + legacyStorage
				)
				window.localStorage.removeItem(legacyName)
			}
		}
	}

	save() {
		const data = this.config.encode(this.buffer)
		
		window.localStorage.setItem(this.config.name, data)
		this.emit("save", this)
	}

	load() {
		const localStorage = window.localStorage.getItem(this.config.name)
		const data = this.config.decode(localStorage)

		this.buffer = data
		this.emit("load", data)
	}

	store(value, key = this.buffer.length) {
		this.buffer[key] = value
		this.save()
		this.emit("store", value, key)
	}

	remove(index) {
		this.buffer.splice(index, 1)
		this.save()
		this.emit("remove", index)
	}
}
