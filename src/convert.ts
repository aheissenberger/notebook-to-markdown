import { parse } from "https://deno.land/std@0.126.0/flags/mod.ts";
import { default as AnsiUp } from "https://cdn.skypack.dev/ansi_up"
//import Plotly from "https://cdn.skypack.dev/plotly.js"
const ansi_up = new AnsiUp();
const conf_defaults = {
    code: false,
    shellscript: false, "shellscript-output": false
}
const conf = parse(Deno.args, { default: conf_defaults });

function jsonStreamToData() {
    let data = ''
    return new TransformStream({
        start() { },
        transform(chunk, controller) {
            data += chunk

        },
        flush(controller) {
            controller.enqueue(JSON.parse(data))
        }
    })
}

const nbformatToCellStream = new TransformStream({
    start() { },
    transform(nbdata, controller) {
        for (const cell of (nbdata?.cells ?? [])) {
            controller.enqueue(cell)
        }
    }
})

function nbCellsToMarkdown() {

    return new TransformStream({
        start(controller) {
            controller.enqueue(`<script src="https://cdn.plot.ly/plotly-2.9.0.min.js"></script>` + "\n")
        },
        transform(nbCell, controller) {
            switch (nbCell.language) {
                case "markdown":
                    {
                        const md = nbCell.source?.[0] ?? '';
                        if (md !== '') {
                            controller.enqueue(md + "\n")
                        }
                        break
                    }
                case "typescript":
                case "shellscript":
                // deno-lint-ignore no-fallthrough
                case "javascript":
                    {
                        if (conf[nbCell.language]) {
                            controller.enqueue("\n```" + nbCell.language + "\n" + nbCell.source.join("\n") + "\n```\n")
                        }
                        if (nbCell.language === 'shellscript' && !conf['shellscript-output']) break
                    }
                default:
                    for (const item of (nbCell?.outputs?.[0]?.items ?? [])) {

                        switch (item.mime) {
                            case "text/html":
                                controller.enqueue(item.value.join("\n"))
                                break
                            case "application/vnd.code.notebook.stdout":
                                controller.enqueue("\n```\n" + item.value.join("\n") + "\n```\n")
                                break
                            case "text/plain":
                                controller.enqueue("<pre>" + ansi_up.ansi_to_html(item.value.join("\n")) + "</pre>")
                                break;
                            case "application/vnd.ts.notebook.plotly+json": {
                                const plotlyValue = item.value
                                const output = `
<div id="plotly${plotlyValue.requestId}"></div>
<script>
Plotly.newPlot("plotly${plotlyValue.requestId}", {
    "data": ${JSON.stringify(plotlyValue.data)},
    "layout": ${JSON.stringify(plotlyValue.layout)}
})
</script>
`
                                controller.enqueue(output)
                                break
                            }
                            default:
                                break;
                        }
                    }
                    break
            }
        }
    })
}


const log = new TransformStream({
    start() { },
    transform(chunk, controller) {
        console.log('log', chunk)
        controller.enqueue(chunk)
    }
})

await Deno.stdin.readable
    .pipeThrough(new TextDecoderStream())
    .pipeThrough(jsonStreamToData())
    .pipeThrough(nbformatToCellStream)
    //.pipeThrough(log)
    .pipeThrough(nbCellsToMarkdown())
    //.pipeThrough(log)
    .pipeThrough(new TextEncoderStream())
    .pipeTo(Deno.stdout.writable)