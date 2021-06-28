(() => {
  var __defProp = Object.defineProperty;
  var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
  var __esm = (fn, res) => function __init() {
    return fn && (res = (0, fn[Object.keys(fn)[0]])(fn = 0)), res;
  };
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[Object.keys(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __export = (target, all) => {
    __markAsModule(target);
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };

  // src/js/modules/encoder.mjs
  var Encoder, encoder_default;
  var init_encoder = __esm({
    "src/js/modules/encoder.mjs"() {
      Encoder = class {
        constructor(base, bits, prefix = "", sufix = "", separator = "") {
          const range = 2 ** bits;
          this.prefix = prefix;
          this.sufix = sufix;
          this.separator = separator;
          this.base = Math.min(range, base);
          this.padLength = Math.ceil(Math.log(range) / Math.log(this.base));
        }
        encode(binaries, prefix = this.prefix, sufix = this.sufix, separator = this.separator) {
          let code2 = [];
          for (let binarie of binaries) {
            const encoded = binarie.toString(this.base).toUpperCase().padStart(this.padLength, "0");
            code2.push(`${prefix}${encoded}${sufix}`);
          }
          return code2.join(separator);
        }
        *parse(code2, prefix = this.prefix, sufix = this.sufix, separator = this.separator) {
          const sliced = code2.slice(prefix.length, code2.length - sufix.length);
          const splitSeparator = sufix + separator + prefix;
          let chuncks = null;
          if (splitSeparator.length > 0) {
            chuncks = sliced.split(splitSeparator);
          } else {
            const matchChunks = new RegExp(`.{${this.padLength}}`, "g");
            chuncks = sliced.match(matchChunks);
          }
          for (let chunck of chuncks)
            yield parseInt(chunck, this.base);
        }
      };
      encoder_default = Encoder;
    }
  });

  // src/js/modules/observer.mjs
  var Obsever;
  var init_observer = __esm({
    "src/js/modules/observer.mjs"() {
      Obsever = class {
        observers = {};
        on(name, callback) {
          if (!(name in this.observers))
            this.observers[name] = [];
          this.observers[name].push(callback);
          return this;
        }
        emit(observerName, ...args) {
          if (observerName in this.observers) {
            for (let observer of this.observers[observerName])
              observer.call(this, ...args);
          }
          if ("all" in this.observers) {
            for (let observer of this.observers["all"])
              observer.call(this, ...args, observerName);
          }
        }
      };
    }
  });

  // src/js/modules/reactive.mjs
  var Reactive;
  var init_reactive = __esm({
    "src/js/modules/reactive.mjs"() {
      init_observer();
      Reactive = class extends Obsever {
        constructor(source) {
          super();
          return new Proxy(source, {
            get: (target, key) => {
              this.emit("get", target, key);
              return source[key] || this[key];
            },
            set: (target, key, value) => {
              source[key] = value;
              this.emit("set", target, key, value);
              return true;
            }
          });
        }
      };
    }
  });

  // src/js/modules/binaries.mjs
  var Binaries;
  var init_binaries = __esm({
    "src/js/modules/binaries.mjs"() {
      Binaries = class {
        static fromBooleans(booleans) {
          let acumulador = 0;
          for (let index in booleans)
            acumulador += booleans[index] ? 2 ** (booleans.length - index - 1) : 0;
          return acumulador;
        }
        static *toBooleans(binaries, bits) {
          for (let binarie of binaries) {
            const booleans = binarie.toString(2).padStart(bits, "0");
            for (let boolean of booleans)
              yield boolean == "1" ? true : false;
          }
        }
        static *getChunks(source, size) {
          for (let i = 0; i < source.length; i += size)
            yield this.fromBooleans(source.slice(i, i + size));
        }
      };
    }
  });

  // src/js/modules/hex_pixels.mjs
  var HexPixels;
  var init_hex_pixels = __esm({
    "src/js/modules/hex_pixels.mjs"() {
      init_encoder();
      init_reactive();
      init_observer();
      init_binaries();
      HexPixels = class extends Obsever {
        constructor(width2, height2) {
          super();
          this.width = width2;
          this.height = height2;
          this.encoder = new encoder_default(36, width2);
          const buffer = new Array(width2 * height2).fill(false);
          this.buffer = new Reactive(buffer);
        }
        get binaries() {
          return Binaries.getChunks(this.buffer, this.width);
        }
        set binaries(binaries) {
          const buffer = Binaries.toBooleans(binaries, this.width);
          let i = 0;
          for (let dotValue of buffer) {
            this.buffer[i] = dotValue;
            i++;
          }
        }
        setBinaries(binaries, tick = 32, isSilent = false) {
          const buffer = Binaries.toBooleans(binaries, this.width);
          const alpha = this.height / this.width;
          return new Promise((resolve) => {
            let i = 0;
            for (let dotValue of buffer) {
              const x = i % this.width;
              const y = Math.floor(i / this.width);
              const delay = tick * (x * alpha + y / alpha);
              setTimeout((i2) => this.buffer[i2] = !this.buffer[i2], delay, i);
              setTimeout((i2) => this.buffer[i2] = dotValue, tick + delay, i);
              if (i === this.width * this.height - 1)
                setTimeout(() => {
                  resolve();
                  if (!isSilent)
                    this.emit("change");
                }, tick + delay, this);
              i++;
            }
          });
        }
        get code() {
          return this.encoder.encode(this.binaries);
        }
        set code(code2) {
          this.binaries = this.encoder.parse(code2);
        }
        async setCode(code2, isSilent = false) {
          await this.setBinaries(this.encoder.parse(code2), 32, isSilent);
        }
        get pixels() {
          const currentcolor = getComputedStyle(document.documentElement).getPropertyValue("color");
          return this.getPixels(this.binaries, currentcolor);
        }
        toggleDot(index, value = !this.buffer[index], isSilent = false) {
          const oldValue = this.buffer[index];
          this.buffer[index] = value;
          if (!isSilent && oldValue !== value)
            this.emit("input", value);
        }
        async clear(isSilent = false) {
          const binaries = new Array(this.height).fill(0);
          await this.setBinaries(binaries, 32, true);
          if (!isSilent)
            this.emit("clear");
        }
        getPixels(binaries = this.binaries, fill = "#000") {
          const buffer = Binaries.toBooleans(binaries, this.width);
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          canvas.width = this.width;
          canvas.height = this.height;
          ctx.fillStyle = fill;
          let i = 0;
          for (let dot of buffer) {
            if (dot) {
              const x = i % canvas.width;
              const y = Math.floor(i / canvas.width);
              ctx.fillRect(x, y, 1, 1);
            }
            i++;
          }
          return canvas.toDataURL();
        }
      };
    }
  });

  // src/js/modules/history.mjs
  var History, history_default;
  var init_history = __esm({
    "src/js/modules/history.mjs"() {
      init_observer();
      History = class extends Obsever {
        records = [];
        pointer = -1;
        constructor(target, key, update = true) {
          super();
          this.target = target;
          this.key = key;
          this.update = update;
          this.recordStep();
        }
        recordStep(value = this.target[this.key]) {
          this.pointer++;
          this.records[this.pointer] = value;
          this.clearRedo();
          this.emit("step", value);
        }
        undo(steps = 1) {
          if (this.pointer - steps >= 0) {
            const value = this.records[this.pointer - steps];
            if (this.update)
              this.target[this.key] = value;
            this.pointer -= steps;
            this.emit("undo", value);
          }
        }
        redo(steps = 1) {
          if (this.pointer + steps <= this.records.length - 1) {
            const value = this.records[this.pointer + steps];
            if (this.update)
              this.target[this.key] = value;
            this.pointer += steps;
            this.emit("redo", value);
          }
        }
        clearRedo() {
          this.records.length = this.pointer + 1;
        }
      };
      history_default = History;
    }
  });

  // src/js/modules/drawing_gesture.mjs
  var Drawing;
  var init_drawing_gesture = __esm({
    "src/js/modules/drawing_gesture.mjs"() {
      init_observer();
      Drawing = class extends Obsever {
        dispatch(index, state, { target: dot }) {
          const dots = [...dot.parentNode.children];
          const startDrawing = () => {
            this.emit("start", index, state);
            for (let dot2 of dots)
              dot2.addEventListener("mouseenter", drawing2, { once: true });
          };
          const drawing2 = ({ target: dot2 }) => {
            index = dots.indexOf(dot2);
            dot2.focus();
            this.emit("drawing", index, state);
          };
          const endDrawing = () => {
            dot.removeEventListener("mouseleave", startDrawing);
            for (let dot2 of dots)
              dot2.removeEventListener("mouseenter", drawing2);
            this.emit("end", index, state);
          };
          dot.addEventListener("mouseleave", startDrawing, { once: true });
          window.addEventListener("mouseup", endDrawing, { once: true });
        }
      };
    }
  });

  // src/js/modules/template.mjs
  var Template;
  var init_template = __esm({
    "src/js/modules/template.mjs"() {
      init_observer();
      Template = class extends Obsever {
        constructor(id) {
          super();
          const template = document.getElementById(id);
          this.parent = template.parentNode;
          this.prev = template.previousSibling;
          this.next = template.nextSibling;
          this.node = template.content.firstElementChild.cloneNode(true);
          template.remove();
          this.emit("created", this.node);
        }
        mount(parentNode = this.parent, nextSibling, ...args) {
          const node = this.node.cloneNode(true);
          if (nextSibling === void 0)
            parentNode.appendChild(node);
          else
            parentNode.insertBefore(node, this.next);
          this.emit("mount", node, ...args);
        }
      };
    }
  });

  // src/js/components/character.mjs
  var character_exports = {};
  __export(character_exports, {
    default: () => character_default
  });
  async function introAnimation() {
    if (character.width === 5 && character.height === 8) {
      await character.setCode("DLI449LM", true);
      await new Promise((resolve) => setTimeout(resolve, 1024));
      await character.clear(true);
    }
    if (code)
      character.setCode(code);
  }
  var params, width, height, character, characterDot, drawing, history, characterCode_node, codeEncoder, clearButton_node, shareCharacterButton_node, code, character_default;
  var init_character = __esm({
    "src/js/components/character.mjs"() {
      init_hex_pixels();
      init_history();
      init_encoder();
      init_drawing_gesture();
      init_template();
      params = new URLSearchParams(location.search);
      width = Math.abs(parseInt(params.get("width"))) || 5;
      height = Math.abs(parseInt(params.get("height"))) || 8;
      character = new HexPixels(width, height);
      characterDot = new Template("character-dot-template");
      drawing = new Drawing();
      characterDot.on("mount", (dot, index) => {
        dot.addEventListener("click", () => {
          const value = !character.buffer[index];
          character.toggleDot(index, value);
        });
        dot.addEventListener("pointerdown", (event) => {
          const value = !character.buffer[index];
          drawing.dispatch(index, value, event);
        });
        character.buffer.on("set", (target, key, value) => {
          if (key === index)
            if (value)
              dot.classList.add("active");
            else
              dot.classList.remove("active");
        });
      });
      drawing.on("all", (index, value, type) => {
        if (type !== "end")
          character.toggleDot(index, value);
      });
      for (let index in character.buffer)
        characterDot.mount(characterDot.parent, characterDot.next, index);
      history = new history_default(character, "code");
      character.on("all", () => {
        history.recordStep();
      });
      document.addEventListener("keydown", ({ ctrlKey, key }) => {
        if (ctrlKey) {
          if (key === "z")
            history.undo();
          else if (key === "y")
            history.redo();
        }
      });
      characterCode_node = document.getElementById("character-code");
      codeEncoder = new encoder_default(16, character.width, "<small>0x</small><strong>", "</strong>", ", ");
      characterCode_node.addEventListener("click", () => {
        window.getSelection().selectAllChildren(characterCode_node);
      });
      character.buffer.on("set", () => {
        characterCode_node.innerHTML = codeEncoder.encode(character.binaries);
      });
      characterCode_node.innerHTML = codeEncoder.encode(character.binaries);
      clearButton_node = document.getElementById("clear-button");
      clearButton_node.addEventListener("click", () => character.clear());
      shareCharacterButton_node = document.getElementById("share-character-button");
      shareCharacterButton_node.addEventListener("click", (event) => {
        event.preventDefault();
        let params2 = `code=${character.code}`;
        if (character.width !== 5)
          params2 = `widthe=${character.width}&` + params2;
        if (character.height !== 8)
          params2 = `heighte=${character.height}&` + params2;
        window.navigator.share({
          url: `https://lucianofelix.com.br/XAR/?${params2}`
        });
      });
      document.documentElement.style.setProperty("--character-width", character.width);
      document.documentElement.style.setProperty("--character-height", character.height);
      code = params.get("code");
      introAnimation();
      character_default = character;
    }
  });

  // src/js/modules/storage.mjs
  var defaults, Storage;
  var init_storage = __esm({
    "src/js/modules/storage.mjs"() {
      init_observer();
      defaults = {
        name: void 0,
        legacyNames: [],
        encode: void 0,
        decode: void 0
      };
      Storage = class extends Obsever {
        constructor(config) {
          super();
          this.config = { ...defaults, ...config };
          this.buffer = void 0;
          this.updateLegacy();
          this.load();
        }
        updateLegacy() {
          for (let legacyName of this.config.legacyNames) {
            const legacyStorage = window.localStorage.getItem(legacyName);
            if (legacyStorage) {
              const newStorage = window.localStorage.getItem(this.config.name) || "";
              window.localStorage.setItem(this.config.name, newStorage + legacyStorage);
              window.localStorage.removeItem(legacyName);
            }
          }
        }
        save() {
          const data = this.config.encode(this.buffer);
          window.localStorage.setItem(this.config.name, data);
          this.emit("save", this);
        }
        load() {
          const localStorage2 = window.localStorage.getItem(this.config.name);
          const data = this.config.decode(localStorage2);
          this.buffer = data;
          this.emit("load", data);
        }
        store(value, key = this.buffer.length) {
          this.buffer[key] = value;
          this.save();
          this.emit("store", value, key);
        }
        remove(index) {
          this.buffer.splice(index, 1);
          this.save();
          this.emit("remove", index);
        }
      };
    }
  });

  // src/js/modules/press_gesture.mjs
  var Press;
  var init_press_gesture = __esm({
    "src/js/modules/press_gesture.mjs"() {
      init_observer();
      Press = class extends Obsever {
        dispatch(...args) {
          let doHold = false;
          const hold = setTimeout(() => doHold = true, 450);
          window.addEventListener("pointerup", async (event) => {
            clearTimeout(hold);
            if (doHold)
              this.emit("press", ...args, event);
            else
              this.emit("click", ...args, event);
          }, {
            once: true
          });
        }
      };
    }
  });

  // src/js/components/collection.mjs
  var collection_exports = {};
  __export(collection_exports, {
    default: () => collection_default
  });
  var collection, collectionSectionName_node, storeButton_node, collectionItem, press, collection_default;
  var init_collection = __esm({
    "src/js/components/collection.mjs"() {
      init_storage();
      init_press_gesture();
      init_template();
      init_character();
      collection = new Storage({
        name: `com.lucianofelix.xar-collection:${character_default.width}x${character_default.height}`,
        legacyNames: [
          `XAR_${character_default.width}x${character_default.height}`,
          `com.lucianofelix.xar-storage:${character_default.width}x${character_default.height}`
        ],
        encode(buffer = []) {
          let data = "";
          for (let character2 of buffer)
            data += character2.code;
          return data;
        },
        decode(storedData) {
          const codeLength = character_default.encoder.padLength * character_default.height;
          const matchCode = new RegExp(`.{${codeLength}}`, "g");
          const matches = storedData?.match(matchCode);
          const buffer = [];
          if (matches?.length) {
            const currentcolor = getComputedStyle(document.documentElement).getPropertyValue("color");
            for (let code2 of matches) {
              const pixels = character_default.getPixels(character_default.encoder.parse(code2), currentcolor);
              buffer.push({ code: code2, pixels });
            }
          }
          return buffer;
        }
      });
      collectionSectionName_node = document.getElementById("collection-section-name");
      collectionSectionName_node.addEventListener("input", ({ target }) => {
        localStorage.setItem("com.lucianofelix.xar-collection_name", target.innerText);
      });
      collectionSectionName_node.addEventListener("focus", () => {
        window.getSelection().selectAllChildren(collectionSectionName_node);
      });
      collectionSectionName_node.addEventListener("keydown", ({ target, key }) => {
        if (key === "Enter")
          target.blur();
      });
      storeButton_node = document.getElementById("store-button");
      storeButton_node.addEventListener("click", () => {
        character_default.setBinaries(character_default.binaries, 32, true);
        collection.store({
          code: character_default.code,
          pixels: character_default.pixels
        });
      });
      collectionItem = new Template("collection-item-template");
      press = new Press().on("click", (index) => {
        const { code: code2 } = collection.buffer[index];
        if (character_default.code !== code2)
          character_default.setCode(code2);
      }).on("press", (index, event) => {
        event.preventDefault();
        collection.remove(index);
      });
      collectionItem.on("mount", (item, data) => {
        const image_node = item.querySelector("img");
        image_node.src = data.pixels;
        item.addEventListener("pointerdown", () => {
          const index = collection.buffer.indexOf(data);
          press.dispatch(index);
        });
        collection.on("remove", () => {
          const index = collection.buffer.indexOf(data);
          if (index === -1)
            item.remove();
        });
      });
      collection.on("store", (item) => {
        collectionItem.mount(collectionItem.parent, collectionItem.next, item);
      });
      for (let item of collection.buffer)
        collectionItem.mount(collectionItem.parent, collectionItem.next, item);
      collection_default = collection;
    }
  });

  // src/js/main.js
  var require_main = __commonJS({
    "src/js/main.js"(exports) {
      var collectionSectionName_node2 = document.getElementById("collection-section-name");
      collectionSectionName_node2.innerText = localStorage.getItem("com.lucianofelix.xar-collection_name") || "MY CHARACTERS";
      async function create() {
        await Promise.resolve().then(() => (init_character(), character_exports));
        await Promise.resolve().then(() => (init_collection(), collection_exports));
      }
      create.call(exports);
    }
  });
  require_main();
})();
