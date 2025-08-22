; Headers
(header_magic) @preproc
(header_spdx) @preproc
(header_template) @preproc

; Procedure declarations
(procedure_declaration
  name: (identifier) @function)
(procedure_title) @markup.heading

; Types
(type_name) @type

; Sections and steps
(section) @emphasis.strong
(numbered_step) @emphasis.strong
(lettered_step) @emphasis.strong
(parallel_step) @emphasis.strong

; Attributes
(attribute) @attribute

; Responses
(response) @constructor

; Code blocks and keywords
(code_block) @embedded
(keyword) @keyword

; Invocations
(invocation) @function

; Strings and literals
(string) @string
(multiline) @string

; Tablets
(tablet) @punctuation.bracket

; Basic tokens
(identifier) @variable
(number) @number
(operator) @operator

; General text
(text) @text.literal
