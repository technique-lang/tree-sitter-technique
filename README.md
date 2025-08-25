# Tree Sitter grammar for the Technique procedures language

The Tree Sitter grammar here is ONLY to produce tokens for the purpose of
syntax highlighting a Technique file in the the Zed Editor. It is _not_ a
complete parser to a full abstract syntax tree.

The Technique compiler's command-line program has been taught to code format
input source files with the `format` subcommand:

```
technique format -R <filename>
```
 
(where `-R` is to ensure raw ANSI escape code are generated even if output is
redirected). The requirement is that other editors' syntax highlighting
matches the output of the format subcommand, which is authoritative for
colouring.
