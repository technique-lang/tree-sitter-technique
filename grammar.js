// Tree-sitter grammar for Technique language - for syntax highlighting
// Whitespace-agnostic except where newlines are syntactically required

module.exports = grammar({
  name: "technique",

  extras: ($) => [/\s/],

  conflicts: ($) => [
    [$.procedure_declaration, $._item],
    [$.code_block, $.operator],
    [$.code_block, $.function_call],
  ],

  rules: {
    source_file: ($) => repeat($._item),

    _item: ($) =>
      choice(
        // Header lines (require newlines)
        $.header_magic,
        $.header_spdx,
        $.header_template,

        // Procedures
        $.procedure_declaration,
        $.procedure_title,

        // Sections and steps
        $.section,
        $.numbered_step,
        $.lettered_step,
        $.parallel_step,

        // Special constructs
        $.attribute,
        $.response,
        $.code_block,
        $.invocation_call,
        $.string,
        $.multiline,
        $.tablet,
        $.identifier,
        $.forma,
        $.number,
        $.operator,
        $.text,
      ),

    // Header lines - require newlines
    header_magic: ($) => seq("%", "technique", /v\d+/, "\n"),
    header_spdx: ($) => seq("!", /[^\n]+/, "\n"),
    header_template: ($) => seq("&", /[^\n]+/, "\n"),

    // Procedure declaration - requires newline
    procedure_declaration: ($) =>
      prec(
        2,
        seq(
          field("name", $.identifier),
          optional(seq("(", repeat(seq($.identifier, optional(","))), ")")),
          ":",
          optional(
            repeat(choice($.forma, $.operator, "[", "]", "(", ")", ",")),
          ),
          "\n",
        ),
      ),

    // Procedure title
    procedure_title: ($) => seq("#", /[^\n]+/),

    // Section
    section: ($) => seq(/[IVX]+\./, /[^\n]*/),

    // Steps
    numbered_step: ($) => seq(/\d+\./, /[^\n]*/),
    lettered_step: ($) => seq(/[a-z]\./, /[^\n]*/),
    parallel_step: ($) => seq("-", /[^\n]+/),

    // Attributes
    attribute: ($) => seq(choice("@", "#"), $.identifier),

    // Response options
    response: ($) => seq("'", /[^']*/, "'"),

    // Code blocks
    code_block: ($) =>
      seq(
        "{",
        repeat(
          choice(
            $.keyword,
            $.function_call,
            $.invocation_call,
            $.identifier,
            $.operator,
            $.number,
            $.string,
            $.multiline,
            $.tablet,
            "(",
            ")",
            ",",
            "~",
            /\s+/,
            /[^{}()<>,~\s]+/,
          ),
        ),
        "}",
      ),

    // Keywords in code
    keyword: ($) => choice("repeat", "foreach", "in"),

    // function calls
    function_call: ($) =>
      prec(1,
        seq(
          field("name", choice(
            /exec/,
            /now/,
            $.identifier
          )),
          "(",
          optional(
            repeat(
              choice(
                $.string,
                $.multiline,
                $.number,
                $.identifier,
                $.invocation_call,
                ",",
                /\s+/,
              ),
            ),
          ),
          ")",
        ),
      ),

    // invocation calls
    invocation_call: ($) =>
      prec.left(
        seq(
          "<",
          field("name", $.identifier),
          optional(seq(":", $.identifier)),
          ">",
          optional(
            seq(
              "(",
              repeat(choice($.identifier, $.string, $.number, ",")),
              ")",
            ),
          ),
        ),
      ),

    // Strings
    string: ($) =>
      seq(
        '"',
        repeat(
          choice(
            /[^"{}]+/,
            seq("{", /\s*/, optional($.identifier), /\s*/, "}"),
          ),
        ),
        '"',
      ),

    // Multiline strings
    multiline: ($) =>
      seq(
        "```",
        optional(field("language", /[a-z]+/)),
        field("content", /([^`]|`[^`]|``[^`])*/),
        "```",
      ),

    // Tablets
    tablet: ($) =>
      seq(
        "[",
        repeat(
          seq(
            field("label", seq('"', /[^"]*/, '"')),
            "=",
            field(
              "value",
              choice(
                $.string,
                $.number,
                $.identifier,
                $.function_call,
                $.invocation_call,
                /[^\],]+/,
              ),
            ),
          ),
        ),
        "]",
      ),

    // Basic tokens
    identifier: ($) => /[a-z][a-z0-9_]*/,
    forma: ($) => /[A-Z][a-zA-Z0-9]*/,
    number: ($) => /-?\d+(\.\d+)?/,
    operator: ($) => choice("->", "=", "±", ":", "~"),
    text: ($) => /[^%!&#\-@'`{\[<"0-9a-zA-Z]+/,
  },
});
