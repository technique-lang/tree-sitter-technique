// Tree-sitter grammar for Technique language - for syntax highlighting
// Whitespace-agnostic except where newlines are syntactically required

module.exports = grammar({
    name: "technique",

    extras: ($) => [/[ \t]/],

    rules: {
        // a Technique is either standalone Scopes (nested steps) or a series
        // of Procedures (which can contain nested steps). But for syntax
        // highlighting purposes we don't care about that structural
        // ambiguity. We're just going to detect lines.

        technique: ($) =>
            repeat1(
                choice(
                    prec(9, $.metadata),
                    prec(6, $.step),
                    prec(5, $.title),
                    prec(4, $.attributes),
                    prec(4, $.responses),
                    prec(3, $.description),
                    prec(2, $._blank_line),
                    prec(1, $.declaration),
                ),
            ),

        _blank_line: ($) => "\n",

        // Metadata block of headers
        metadata: ($) => choice($.magic_line, $.spdx_line, $.template_line),

        // Header lines are a single line ending with a newline
        magic_line: ($) => seq("%", "technique", "v1", "\n"),
        spdx_line: ($) => seq("!", /[^\n]+/, "\n"),
        template_line: ($) => seq("&", /[^\n]+/, "\n"),

        // Procedure declarations can be across multiple lines but are
        // terminated by (separated from subsequent content) a newline.
        declaration: ($) =>
            seq(
                $.procedure_name,
                optional($._parameters),
                $.declaration_marker,
                optional($.signature),
                "\n",
            ),

        procedure_name: ($) => $._identifier,

        declaration_marker: ($) => ":",

        // used for procedure names and variable names
        _identifier: ($) => /[a-z][a-z0-9_]*/,

        // Parameters in procedure declaration
        _parameters: ($) =>
            seq(
                $.parameters_start_marker,
                $.variable,
                repeat(seq($.parameters_separator, $.variable)),
                $.parameters_end_marker,
            ),

        // Signature with domain and range Genus
        signature: ($) => seq($.genus, $.signature_marker, $.genus),
        signature_marker: ($) => "->",

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
        title: ($) => $._procedure_title,
        _procedure_title: ($) => seq($.title_marker, $.title_text, "\n"),
        title_marker: ($) => "#",
        title_text: ($) => $._text,

        description: ($) => $._paragraph_line,

        // Paragraph - any line that's not empty
        _paragraph_line: ($) => seq(repeat1($._descriptive), "\n"),

        _descriptive: ($) =>
            choice(
                $.inline_text,
                $.inline_code,
                // $._invocation,
                // $._binding_inline,
            ),

        inline_text: ($) => $._text,

        // To create the fallback we mark text as the lowest precedence and
        // present it as a single token. This was crucial to allow the other
        // line rules to be chosen.
        _text: ($) => token(prec(-1, /[^\n{~]+/)),

        // inline code within descriptive text. We have to jump through some
        // additional hoops to relax and support multiline constructs
        inline_code: ($) =>
            seq(
                $.code_start_marker,
                optional($._inline_code_content),
                $.code_end_marker,
            ),

        _inline_code_content: ($) =>
            choice(
                $._expression,
                seq(
                    optional($._expression),
                    repeat1(seq(/\n+/, optional($._expression))),
                ),
            ),

        code_start_marker: ($) => "{",
        code_end_marker: ($) => "}",

        // Section chunks - roman numeral sections
        _section_chunk: ($) => seq($.section_marker, $.section_text),

        section_marker: ($) => /[IVX]+ /,
        section_text: ($) => /[^\n]*/, // FIXME descriptive?

        // Because of the limitations of Tree Sitter and its inability to do
        // lookahead, we can't nest the steps like you'd expect given the
        // ambiguity of the grammar. So we parse them line at a time (which is
        // sufficient for syntax highlighting needs anyway) whereby they can
        // be either the first line of a step (with dependent or parallel step
        // marker) or are one of the subsequent lines of content (being lines
        // without such a marker).
        step: ($) =>
            choice(seq($.step_firstline, "\n"), seq($.step_continued, "\n")),

        step_firstline: ($) =>
            seq(optional(/[ \t]+/), $.step_marker, $.step_content),

        step_continued: ($) =>
            seq(
                /[ \t]+/, // Leading whitespace (required for continuations)
                $.step_content,
            ),

        step_content: ($) => repeat1($._descriptive),

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

        // Role attributes only
        attributes: ($) =>
            seq(
                optional(/[ \t]+/), // Allow leading whitespace
                $.attribute,
                repeat(seq($.attribute_joiner, $.attribute)),
                "\n",
            ),

        attribute: ($) => seq($.role_marker, $.role_name),
        attribute_joiner: ($) => "+",
        role_marker: ($) => "@",
        role_name: ($) => $._identifier,

        // Response lines
        responses: ($) =>
            seq(
                optional(/[ \t]+/), // Allow leading whitespace
                $.response,
                repeat(seq($.response_separator, $.response)),
                "\n",
            ),

        response: ($) =>
            seq(
                $.response_marker,
                $.response_value,
                $.response_marker,
                optional($.response_condition),
            ),

        response_condition: ($) => $._condition,

        _condition: ($) => token(prec(-1, /[^|\n]+/)), // Condition text, stop at | or newline

        response_separator: ($) => "|",
        response_marker: ($) => "'",
        response_value: ($) => /[^']*/,

        // DESCRIPTIVES

        // Binding inline within text
        _binding_inline: ($) => seq($.binding_marker, $._arguments),
        binding_marker: ($) => "~",

        // EXPRESSIONS

        _expression: ($) =>
            choice(
                $.variable,
                $.repeat_expression,
                $.foreach_expression,
                $.invocation,
                $.application,
                $.string_literal,
                $.numeric_literal,
                $.multiline_literal,
                $.binding_expression,
                $.tablet,
            ),

        variable: ($) => $._identifier,

        // Strings with interpolation
        string_literal: ($) =>
            seq(
                $.string_marker,
                repeat(choice($.string_text, $._interpolation)),
                $.string_marker,
            ),
        string_marker: ($) => '"',
        string_text: ($) => $._string,

        _string: ($) => token(prec(-1, /[^"{}]+/)),

        // String interpolation supports expressions
        _interpolation: ($) =>
            seq(
                $.code_start_marker,
                optional($._expression),
                $.code_end_marker,
            ),

        numeric_literal: ($) =>
            choice(
                /-?\d+(\.\d+)?\s*((±|\+\/-)\s*\d+(\.\d+)?)?\s*((×|x)\s*10((\^\d+)|([⁰¹²³⁴⁵⁶⁷⁸⁹⁻]+)))?\s+[a-zA-Z\/°]+/,
                /-?\d+(\.\d+)?/,
            ),

        // Multiline strings
        multiline_literal: ($) =>
            seq(
                $.multiline_marker,
                optional($.multiline_language),
                "\n",
                optional($.multiline_content),
                $.multiline_marker,
            ),

        multiline_marker: ($) => "```",
        multiline_language: ($) => token.immediate(/[a-z]+/),
        multiline_content: ($) => token(/([^`]|`[^`]|``[^`])+/),

        // Invocations
        invocation: ($) =>
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
                                    $.parameters_separator,
                                ),
                            ),
                            $.parameters_end_marker,
                        ),
                    ),
                ),
            ),
        invocation_target: ($) =>
            choice(
                $._identifier, // local procedure
                /https?:\/\/[^\s>]+/, // remote URL
            ),
        invocation_start_marker: ($) => "<",
        invocation_end_marker: ($) => ">",
        parameters_start_marker: ($) => "(",
        parameters_end_marker: ($) => ")",
        parameters_separator: ($) => ",",

        // Function call
        application: ($) =>
            prec.left(
                seq(
                    $.function_name,
                    $.parameters_start_marker,
                    optional(/\n+/), // Allow newlines after opening parenthesis
                    optional(
                        seq(
                            $._expression,
                            repeat(
                                seq(
                                    $.parameters_separator,
                                    optional(/\n+/),
                                    $._expression,
                                ),
                            ),
                        ),
                    ),
                    optional(/\n+/), // Allow newlines before closing parenthesis
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
                    repeat(seq($.parameters_separator, $.variable)),
                    $.parameters_end_marker,
                ),
            ),

        binding_expression: ($) =>
            seq($._expression, $.binding_marker, $._arguments),

        binding_marker: ($) => "~",

        repeat_expression: ($) =>
            prec(2, seq($.repeat_keyword, $._expression)),

        // Tablet - key-value pairs in brackets
        tablet: ($) =>
            seq(
                $.tablet_start_marker,
                optional(/\n+/), // Allow newlines after opening bracket
                optional(
                    seq($.tablet_pair, repeat(seq(/\n+/, $.tablet_pair))),
                ),
                optional(/\n+/), // Allow newlines before closing bracket
                $.tablet_end_marker,
            ),

        tablet_pair: ($) =>
            seq($.tablet_label, $.tablet_equals_marker, $._expression),
        tablet_label: ($) =>
            seq($.label_marker, $.label_text, $.label_marker),
        label_marker: ($) => '"',
        label_text: ($) => $._string,
        tablet_start_marker: ($) => "[",
        tablet_equals_marker: ($) => "=",
        tablet_end_marker: ($) => "]",

        // Keywords in code
        repeat_keyword: ($) => "repeat",
        foreach_keyword: ($) => "foreach",
        in_keyword: ($) => "in",
    },
});
