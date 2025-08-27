; Tree-sitter highlighting for Technique language
; Maps tokens to colors based on Syntax enum

; Text - default. Note that we do NOT have a (text) rule or nothing based on
; top of text would highlight!
(description) @text

; Headers - pragma - purple #75507b
(metadata) @preproc.technique.metadata

; Procedure declarations have structural characters as separators. Notably,
; the brackets or parenthesis around Genus are coloured as structural not as a
; part of the Forma.
(procedure_name) @label.technqiue.declaration
(declaration_marker) @punctuation.technique.structural.declaration
(signature) @punctuation.technique.structural.signature
(genus) @punctuation.technique.structural.genus

; Forma are the names of types - brown #8f5902
(forma) @type.technique.forma

; Procedures then have titles, descriptions, and then steps.
; Title marker - pragma - purple #75507b
; Title text - bright white (bold)
(title_marker) @preproc.technique.title
(title_text) @title.technique.title

; Sections
(section_marker) @punctuation.list_marker.technqiue.step_item
(section_text) @text.technique.section.text

; Step items - bright white
(step_marker) @punctuation.list_marker.technqiue.step_item

; Attributes - bright white
(attribute) @attribute




; Response options - orange #f57900
(response_marker) @punctuation.technique.quotes.response
(response_value) @variant.technique.response

; Strings - green #4e9a06
(string_marker) @punctuation.technique.quotes.string
(string_literal) @string.technique.string

; Multiline strings - green #4e9a06
(multiline_string) @string

; Numeric values - purple #ad7fa8
(numeric_literal) @number.technique.numeric

; Declarations - blue #3465a4



(code_start_marker) @punctuation.technique.structural.code
(code_end_marker) @punctuation.technique.structural.code

; Keywords - purple #75507b
(repeat_keyword) @keyword.technique.keyword
(foreach_keyword) @keyword.technique.keyword
(in_keyword) @keyword.technique.keyword

; Functions - blue #3465a4
(function_name) @function.technique.application

; Invocations - dark blue #3b5d7d
(invocation_target) @function.technique.invocation
(invocation_start_marker) @punctuation.technique.structural.invocation
(invocation_end_marker) @punctuation.technique.structural.invocation
(parameters_start_marker) @punctuation.technique.structural.parameters
(parameters_end_marker) @punctuation.technique.structural.parameters
(parameters_separator_marker) @punctuation.technique.structural.parameters

; Binding - gray #999999
(binding_marker) @punctuation.technique.structural.binding

(label_marker) @punctuation.technique.quotes.label
(label_text) @text.technique.label

; Code blocks
(code_start_marker) @punctuation.technique.structural.code
(code_end_marker) @punctuation.technique.structural.code
