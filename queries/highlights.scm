; Headers
(header_magic) @preproc
(header_spdx) @preproc
(header_template) @preproc

; Procedure declarations
(procedure_declaration
  name: (identifier) @function)
(procedure_title) @markup.heading

; Types and Genus
(forma) @type
(unit_genus) @type
(simple_genus) @type
(list_genus) @type
(tuple_genus) @type
(naked_genus) @type

; Sections and steps - emphasis.strong for bold white rendering in Zed
(section) @emphasis.strong
(dependent_step) @emphasis.strong
(dependent_substep) @emphasis.strong
(dependent_subsubstep) @emphasis.strong
(parallel_step) @emphasis.strong

; Attributes
(role_attribute) @attribute
(place_attribute) @attribute

; Responses
(response) @constructor

; Code blocks
(code_block) @embedded

; Expressions
(foreach_expr "foreach" @keyword)
(foreach_expr "in" @keyword)
(repeat_expr "repeat" @keyword)
(binding_expr "~" @operator)

; Invocations and functions
(invocation) @function
(application) @function

; Strings and literals
(string) @string
(multiline) @string
(interpolation) @embedded

; Tablets
(tablet) @punctuation.bracket

; Basic tokens
(identifier) @variable
(variable) @variable
(number) @number
(operator) @operator

; General text
(text) @text.literal
