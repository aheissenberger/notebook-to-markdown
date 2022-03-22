# Node.js Notebook to Markdown Converter

Convert a [VS Code Node.js Notebook](https://github.com/DonJayamanne/typescript-notebook) to a Markdown document.

## Description

The VS Code Node Notebook cannot export to any format. Markdown was choosen as an intermediate format, as there is a wide range of existing renderes to HTML, PDF with the VS Code Extention [Markdown Preview Enhanced](https://github.com/shd101wyy/vscode-markdown-preview-enhanced).

The converter only supports this cell output types:
* Markdown
* HTML (text/html)
* Plotly (application/vnd.ts.notebook.plotly+json)
* StdOut (application/vnd.code.notebook.stdout)
* Text (text/plain)
* Code
  - Typescript
  - Javascript
  - Shellscript

The rendering of Code and Output of Shellscript is disabled by default, only the output of cells except from Shellscript will be rendered. To enable use [Options](#options)

## Getting Started

### Dependencies

* [deno](https://deno.land) runtime


### Executing program

```
cat mynotebook.nnb | \
    deno run https://raw.githubusercontent.com/aheissenberger/notebook-to-markdown/master/src/convert.ts \
    > mynotebook.md
```

## Options

* `--code` to render Typescript/Javascript Code
* `--shellscript` to render Shellscript Code
* `--shellscript-output` to render Shellscript Output

## Authors

[Andreas Heissenberger](https://github.com/aheissenberger)

## Version History

* 0.1
    * Initial Release

## License

This project is licensed under the "bsd-2-clause" License - see the LICENSE.txt file for details
