# Tree Sitter grammar for the Technique procedures language

The Tree Sitter grammar here is ONLY to produce tokens for the purpose of
syntax highlighting a Technique file in the the Zed Editor. It is _not_ a
complete parser to a full abstract syntax tree.

The Technique compiler's command-line program has been taught to code format
input source files with the `format` subcommand:

```
technique format -R Example.tq
```
 
(where `-R` is to ensure raw ANSI escape code are generated even if output is
redirected). The requirement is that other editors' syntax highlighting
matches the output of the format subcommand, which is authoritative for
colouring.

## Development and Testing

The sequence of commands to iterate on this grammar is:

```bash
$ tree-sitter generate
$ tree-sitter parse Example.tq
$ tree-sitter highlight Example.tq
```

You will also need a _~/.config/tree-sitter/config.json_ file with content
along the lines of:

```jsonc
{
  "parser-directories": [
    "/home/andrew/src/technique-lang",
  ],
}
```

where _~/src/technique-lang/_ contains the checkout of this repository. A
sample config file is in the _config/_ directory here, which also includes the
default colour palette used for rendering Technique files correctly.
