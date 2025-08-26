// Tree-sitter grammar for Technique language - for syntax highlighting
// Whitespace-agnostic except where newlines are syntactically required

module.exports = grammar({
    name: "technique",

    extras: ($) => [/\s/],

    conflicts: ($) => [[$.paragraph]],

    rules: {
        // Overall document structure. Metadata, if present, followed by a
        // Technique.
        source_file: ($) => seq(optional($.metadata), optional($._technique)),

        // Metadata block of headers
        metadata: ($) =>
            seq(
                $._magic_line,
                optional($._spdx_line),
                optional($._template_line),
            ),

        // Header lines are a single line ending with a newline
        _magic_line: ($) => seq("%", "technique", "v1", "\n"),
        _spdx_line: ($) => seq("!", /[^\n]+/, "\n"),
        _template_line: ($) => seq("&", /[^\n]+/, "\n"),

        // a Technique is either standalone Scopes (nested steps) or a series
        // of Procedures (which can contain nested steps)
        _technique: ($) => choice(repeat1($._scope), repeat1($._procedure)),

        // Procedure with optional title, description, and scopes
        _procedure: ($) =>
            prec.left(
                seq(
                    $.declaration,
                    optional($._procedure_title),
                    optional($.description),
                    repeat($._scope),
                ),
            ),

        // Procedure declarations can be across multiple lines but are
        // terminated by (separated from subsequent content) a newline.
        declaration: ($) =>
            prec(
                2,
                seq(
                    $.procedure_name,
                    optional($.parameters),
                    ":",
                    optional($.signature),
                    "\n",
                ),
            ),

        procedure_name: ($) => $._identifier,

        // used for procedure names and variable names
        _identifier: ($) => /[a-z][a-z0-9_]*/,

        // Parameters in procedure declaration
        parameters: ($) =>
            seq("(", $.variable, repeat(seq(",", $.variable)), ")"),

        // Signature with domain and range Genus
        signature: ($) => seq($.genus, "->", $.genus),

        // Genus encompass simple and compound types
        genus: ($) =>
            choice(
                $._unit_genus,
                $._simple_genus,
                $._list_genus,
                $._tuple_genus,
                $._naked_genus,
            ),

        _unit_genus: ($) => "()",
        _simple_genus: ($) => $.forma,
        _list_genus: ($) => seq("[", $.forma, "]"),
        _tuple_genus: ($) =>
            seq("(", $.forma, repeat(seq(",", $.forma)), ")"),
        // the special case of tuple that lacks enclosing parenthesis
        _naked_genus: ($) =>
            seq($.forma, ",", $.forma, repeat(seq(",", $.forma))),

        // Forma, a basic type
        forma: ($) => /[A-Z][a-zA-Z0-9]*/,

        // Procedure title
        _procedure_title: ($) => seq($.title_marker, $.title_text, "\n"),
        title_marker: ($) => prec(5, "#"),
        title_text: ($) => /[^\n]*/,

        // Description - one or more paragraphs
        description: ($) => prec.left(seq($.paragraph, repeat($.paragraph))),

        // Scopes - the main structural elements within procedures
        _scope: ($) =>
            choice(
                $._step_block,
                $.code_block,
                $.attribute,
                $._section_chunk,
                $._response_block,
            ),

        // Section chunks - roman numeral sections
        _section_chunk: ($) => seq($.section_marker, $.section_text),

        section_marker: ($) => /[IVX]+ /,
        section_text: ($) => /[^\n]*/, // FIXME descriptive?

        // Step blocks - higher precedence than paragraphs
        // Matches both numbered steps (1. 2. etc) and parallel steps (-)
        _step_block: ($) => seq(prec(2, $.step_marker), $.content),

        step_marker: ($) =>
            choice(
                $._dependent_step_marker,
                $._dependent_substep_marker,
                $._dependent_subsubstep_marker,
                $._parallel_step_marker,
            ),
        // Step markers as separate named nodes
        _dependent_step_marker: ($) => /\d+\.\s/, // 1. 2. 3. etc.
        _dependent_substep_marker: ($) => /[a-hj-km-uwyz]\.\s/, // a. b. c.
        _dependent_subsubstep_marker: ($) => /[ivxl]+\.\s/, // i. ii. iii. iv. etc.
        _parallel_step_marker: ($) => /\-\s/,

        code_block: ($) =>
            prec(
                2,
                seq($.code_start_marker, $._expression, $.code_end_marker),
            ),
        code_start_marker: ($) => "{",
        code_end_marker: ($) => "}",

        // Role attributes only
        attribute: ($) => prec(2, seq("@", $.role_name, "\n")),

        role_name: ($) => $._identifier,

        // Response lines
        _response_block: ($) =>
            seq(
                $.response_marker,
                $.response_value,
                $.response_marker,
                optional($.response_condition),
                "\n",
            ),
        response_marker: ($) => "'",
        response_value: ($) => /[^']*/,
        response_condition: ($) =>
            seq(/[^'\n]*/, $.response_marker, /[^']*/, $.response_marker),

        // DESCRIPTIVES

        content: ($) => prec.left(seq($.paragraph, repeat($.paragraph))),

        // Paragraph - any line that's not empty (conflicts will resolve to structural elements)
        paragraph: ($) => repeat1($._descriptive),

        _descriptive: ($) =>
            choice(
                $._text_inline,
                $._code_inline,
                $._invocation,
                $._binding_inline,
            ),

        // Code inline within text
        _code_inline: ($) =>
            seq(
                $.code_start_marker,
                optional($._expression),
                $.code_end_marker,
            ),

        // Binding inline within text
        _binding_inline: ($) => seq($.binding_marker, $._arguments),
        binding_marker: ($) => "~",

        _text_inline: ($) => /[^\n]+/,

        // EXPRESSIONS

        _expression: ($) =>
            choice(
                $.variable,
                $.repeat_expression,
                $.foreach_expression,
                $._invocation,
                $._application,
                $.string_literal,
                $.numeric_literal,
                $._multiline_literal,
                $._tablet,
            ),

        variable: ($) => $._identifier,

        // Strings with interpolation
        string_literal: ($) =>
            seq(
                $.string_marker,
                repeat(choice(/[^"{}]+/, $._interpolation)),
                $.string_marker,
            ),
        string_marker: ($) => '"',

        // String interpolation supports expressions
        _interpolation: ($) =>
            seq(
                $.code_start_marker,
                optional($._expression),
                $.code_end_marker,
            ),

        numeric_literal: ($) => /-?\d+(\.\d+)?/,

        // Multiline strings
        _multiline_literal: ($) =>
            seq(
                $.multiline_marker,
                optional($.multiline_language),
                repeat($.multiline_string),
                $.multiline_marker,
            ),

        multiline_marker: ($) => "```",
        multiline_language: ($) => /[a-z]+/,
        multiline_string: ($) => /[^`]+/,

        // Invocations
        _invocation: ($) =>
            prec.left(
                seq(
                    $.invocation_start_marker,
                    $.invocation_target,
                    $.invocation_end_marker,
                    optional(
                        seq(
                            $.parameters_start_marker,
                            repeat(
                                choice(
                                    $.variable,
                                    $.string_literal,
                                    $.numeric_literal,
                                    ",",
                                ),
                            ),
                            $.parameters_end_marker,
                        ),
                    ),
                ),
            ),
        invocation_target: ($) => $._identifier,
        invocation_start_marker: ($) => "<",
        invocation_end_marker: ($) => ">",
        parameters_start_marker: ($) => "(",
        parameters_end_marker: ($) => ")",
        parameters_separator_marker: ($) => ",",

        // Function call
        _application: ($) =>
            prec.left(
                seq(
                    $.function_name,
                    $.parameters_start_marker,
                    repeat(
                        choice(
                            $.variable,
                            $.string_literal,
                            $.numeric_literal,
                            ",",
                        ),
                    ),
                    $.parameters_end_marker,
                ),
            ),
        function_name: ($) => $._identifier,

        foreach_expression: ($) =>
            prec(
                2,
                seq(
                    $.foreach_keyword,
                    $._arguments,
                    $.in_keyword,
                    $._expression,
                ),
            ),

        _arguments: ($) =>
            choice(
                $.variable,
                seq(
                    $.parameters_start_marker,
                    $.variable,
                    repeat(seq($.parameters_separator_marker, $.variable)),
                ),
            ),

        binding_expression: ($) =>
            prec.left(1, seq($._expression, $.binding_marker, $._arguments)),

        repeat_expression: ($) =>
            prec(2, seq($.repeat_keyword, $._expression)),

        binding_marker: ($) => "~",

        // Tablet - key-value pairs in brackets
        _tablet: ($) =>
            seq(
                $.tablet_start_marker,
                optional(
                    seq($._tablet_pair, repeat(seq("\n", $._tablet_pair))),
                ),
                $.tablet_end_marker,
            ),

        _tablet_pair: ($) =>
            seq($._label, $.tablet_equals_marker, $._expression),
        _label: ($) => seq($.label_marker, $.label_text, $.label_marker),
        label_marker: ($) => '"',
        label_text: ($) => /[^"]*/,
        tablet_start_marker: ($) => "[",
        tablet_equals_marker: ($) => "=",
        tablet_end_marker: ($) => "]",

        // Keywords in code
        repeat_keyword: ($) => "repeat",
        foreach_keyword: ($) => "foreach",
        in_keyword: ($) => "in",
    },
});
