; Tree-sitter highlighting for Technique language
; Maps tokens to colors based on Syntax enum

; Note that we do NOT have a (text) rule or nothing based on top of text would
; highlight! We do roll the [hidden] (_text) rule up to various different
; places so that they can still be mapped to the @text style here.
(description) @text

; Headers - pragma - purple #75507b
(metadata) @preproc.technique.metadata

; Procedure declarations have structural characters as separators. Notably,
; the brackets or parenthesis around Genus are coloured as structural not as a
; part of the Forma.
(procedure_name) @constructor.technique.declaration
(declaration_marker) @punctuation.technique.declaration
(signature) @punctuation.technique.signature
(genus) @punctuation.technique.genus

; Forma are the names of types - brown #8f5902
(forma) @type.technique.forma

(parameters_start_marker) @punctuation.technique.parameters
(parameters_end_marker) @punctuation.technique.parameters
(parameters_separator) @punctuation.technique.parameters

(variable) @variable.technique.identifier

(binding_marker) @punctuation.technique.binding

; Procedures then have titles, descriptions, and then steps.
(title_marker) @preproc.technique.title
(title_text) @title.technique.title

; Step items - bright white
(section_marker) @punctuation.list_marker.technique.step_item
(step_marker) @punctuation.list_marker.technique.step_item

; Code blocks
(code_start_marker) @punctuation.technique.code
(code_end_marker) @punctuation.technique.code

; Numeric values, integral and quantity
(numeric_literal) @number.technique.numeric

; Strings literals
(string_marker) @punctuation.technique.quotes.string
(string_text) @string.technique.string

; Multiline string literals
(multiline_content) @string.technique.multiline
(multiline_marker) @punctuation.technique.multiline
(multiline_language) @embedded.technique.multiline

; Functions
(function_name) @function.builtin.technique.application

(parameters_start_marker) @punctuation.technique.parameters
(parameters_end_marker) @punctuation.technique.parameters
(parameters_separator) @punctuation.technique.parameters

; Invocations
(invocation_target) @function.technique.invocation
(invocation_start_marker) @punctuation.technique.invocation
(invocation_end_marker) @punctuation.technique.invocation

; Keywords
(repeat_keyword) @keyword.technique.repeat
(foreach_keyword) @keyword.technique.foreach
(in_keyword) @keyword.technique.in

; Tablets
(tablet_start_marker) @punctuation.technique.tablet
(tablet_end_marker) @punctuation.technique.tablet
(label_marker) @punctuation.technique.quotes.tablet
(label_text) @label.technique.label

; Response options
(response_marker) @punctuation.technique.quotes.response
(response_separator) @punctuation.technique.response
(response_value) @variant.technique.response

; Attributes
(attribute_joiner) @punctuation.technique.joiner
(role_marker) @attribute.technique.role
(role_name) @attribute.technique.role
