// Tree-sitter grammar for Technique language - for syntax highlighting
// Whitespace-agnostic except where newlines are syntactically required

module.exports = grammar({
  name: "technique",

  extras: ($) => [/\s/],

  conflicts: ($) => [
    [$.procedure_declaration, $._item],
    [$.code_block, $.operator],
    [$.code_block, $.application],
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
        $.dependent_step,
        $.dependent_substep,
        $.dependent_subsubstep,
        $.parallel_step,

        // Special constructs
        $.attribute,
        $.response,
        $.code_block,
        $.invocation,
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
          optional($.parameters),
          ":",
          optional($.signature),
          "\n",
        ),
      ),

    // Parameters in procedure declaration
    parameters: ($) =>
      seq("(", $.identifier, repeat(seq(",", $.identifier)), ")"),

    // Signature with Genus types
    signature: ($) =>
      seq($.genus, "->", $.genus),

    // Genus types
    genus: ($) =>
      choice(
        $.unit_genus,
        $.simple_genus,
        $.list_genus,
        $.tuple_genus,
        $.naked_genus,
      ),

    unit_genus: ($) => "()",
    simple_genus: ($) => $.forma,
    list_genus: ($) => seq("[", $.forma, "]"),
    tuple_genus: ($) => seq("(", $.forma, repeat(seq(",", $.forma)), ")"),
    naked_genus: ($) => seq($.forma, ",", $.forma, repeat(seq(",", $.forma))),

    // Procedure title
    procedure_title: ($) => seq("#", /[^\n]+/),

    // Section
    section: ($) => seq(/[IVX]+\./, /[^\n]*/),

    // Steps markers (only capture the step marker itself, not the entire line)
    dependent_step: ($) => /\d+\.\s/,                    // 1. 2. 3. etc.
    dependent_substep: ($) => /[a-hj-km-uwyz]\.\s/,      // a. b. c.
    dependent_subsubstep: ($) => /[ivxl]+\.\s/,          // i. ii. iii. iv. etc.
    parallel_step: ($) => /\-\s/,                        // -

    // Attributes
    attribute: ($) => choice($.role_attribute, $.place_attribute),
    role_attribute: ($) => seq("@", $.identifier, repeat(seq("+", "@", $.identifier))),
    place_attribute: ($) => seq("#", $.identifier),

    // Response options
    response: ($) => seq("'", /[^']*/, "'"),

    // Code blocks
    code_block: ($) =>
      seq(
        "{",
        repeat($._expression),
        "}",
      ),

    // Expressions
    _expression: ($) =>
      choice(
        $.variable,
        $.string,
        $.multiline,
        $.number,
        $.invocation,
        $.application,
        $.foreach_expr,
        $.repeat_expr,
        $.binding_expr,
        $.tablet,
        /\s+/,
      ),

    // Expression components
    variable: ($) => $.identifier,
    
    foreach_expr: ($) =>
      prec(2, seq("foreach", $.identifier, "in", $._expression)),
    
    repeat_expr: ($) =>
      prec(2, seq("repeat", $._expression)),
    
    binding_expr: ($) =>
      prec.left(1, seq($._expression, "~", $.identifier)),

    // Keywords in code
    keyword: ($) => choice("repeat", "foreach", "in"),

    // Applications (function calls)
    application: ($) =>
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
                $.invocation,
                ",",
                /\s+/,
              ),
            ),
          ),
          ")",
        ),
      ),

    // Invocations
    invocation: ($) =>
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

    // Strings with interpolation
    string: ($) =>
      seq(
        '"',
        repeat(
          choice(
            /[^"{}]+/,
            $.interpolation,
          ),
        ),
        '"',
      ),

    // String interpolation supports expressions
    interpolation: ($) =>
      seq("{", optional($._expression), "}"),

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
                $.application,
                $.invocation,
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
