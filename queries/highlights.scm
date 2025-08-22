; Headers
(header_magic) @keyword.directive
(header_spdx) @comment.documentation
(header_template) @keyword.directive

; Procedure declarations
(procedure_declaration
  name: (identifier) @function)
(procedure_title) @markup.heading

; Types
(type_name) @type

; Sections and steps
(section) @markup.heading
(numbered_step) @markup.list.numbered
(lettered_step) @markup.list.numbered
(parallel_step) @markup.list.unnumbered

; Attributes
(attribute) @attribute

; Responses
(response) @string.special

; Code blocks and keywords
(code_block) @embedded
(keyword) @keyword

; Invocations
(invocation) @function.call

; Strings and literals
(string) @string
(multiline) @string

; Tablets
(tablet) @punctuation.bracket

; Basic tokens
(identifier) @variable
(number) @constant.numeric
(operator) @operator

; General text
(text) @text
