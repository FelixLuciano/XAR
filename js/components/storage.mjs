const defaults = {
	name: undefined,
	legacyNames: [],
	encode: undefined,
	decode: undefined
}

class Storage {
	constructor(config) {
		this.config = Object.assign(defaults, config)
		this.buffer = undefined

		this.updateLegacy()
		this.load()
	}

	store(item) {
		this.buffer.unshift(item)
		this.save()
	}

	remove(index) {
		this.buffer.splice(index, 1)
		this.save()
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
		const toStore = this.config.encode(this.buffer)
		window.localStorage.setItem(this.config.name, toStore)
	}

	load() {
		const localStorage = window.localStorage.getItem(this.config.name)

		if (!localStorage) this.save()

		const data = this.config.decode(localStorage)

		this.buffer = data
	}
}

export default Storage
