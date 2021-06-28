import * as esbuild from "https://deno.land/x/esbuild@v0.12.10/mod.js"

await esbuild.build({
    entryPoints: ["./src/js/main.js"],
    outfile: "./app.js",
    target: "esnext",
    bundle: true
})

await esbuild.build({
    entryPoints: ["./src/css/style.css"],
    outfile: "./style.css",
    bundle: true,
    minify: true
})

esbuild.stop()
console.log("Build complete!")
