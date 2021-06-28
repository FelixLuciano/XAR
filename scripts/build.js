import * as esbuild from "https://deno.land/x/esbuild@v0.12.10/mod.js"

await esbuild.build({
    entryPoints: ["./js/main.js"],
    outfile: "./app.js",
    bundle: true,
    minify: true
})

esbuild.stop()
console.log("Build complete!")
