#include <tree_sitter/parser.h>
#include <wctype.h>
#include <stdio.h>
#include <string.h>
#include <stdbool.h>

enum TokenType {
    BOUNDARY,
};

// Helper function to check if character is valid for identifier start
static bool is_identifier_start(int32_t c) {
    return c >= 'a' && c <= 'z';
}

// Helper function to check if character is valid for identifier continuation
static bool is_identifier_continue(int32_t c) {
    return (c >= 'a' && c <= 'z') || (c >= '0' && c <= '9') || c == '_';
}

// Helper function to check if character is whitespace (including newline)
static bool is_whitespace(int32_t c) {
    return c == ' ' || c == '\t' || c == '\n' || c == '\r';
}

// Helper function to check if character is horizontal whitespace (not newline)
static bool is_horizontal_whitespace(int32_t c) {
    return c == ' ' || c == '\t';
}

void *tree_sitter_technique_external_scanner_create() {
    return NULL; // No state needed
}

void tree_sitter_technique_external_scanner_destroy(void *payload) {
    // Nothing to destroy
}

void tree_sitter_technique_external_scanner_reset(void *payload) {
    // Nothing to reset
}

unsigned tree_sitter_technique_external_scanner_serialize(void *payload, char *buffer) {
    return 0; // No state to serialize
}

void tree_sitter_technique_external_scanner_deserialize(void *payload, const char *buffer, unsigned length) {
    // No state to deserialize
}

// Check if we're at a procedure boundary by looking ahead
// Returns true if this is the start of a procedure declaration
static bool is_procedure_declaration(TSLexer *lexer) {
    // Must be at column 0
    if (lexer->get_column(lexer) != 0) {
        return false;
    }

    // Must start with an identifier
    if (!is_identifier_start(lexer->lookahead)) {
        return false;
    }

    // Scan the identifier
    int32_t c = lexer->lookahead;
    while (is_identifier_continue(c)) {
        lexer->advance(lexer, false);
        c = lexer->lookahead;
    }

    // Skip horizontal whitespace
    while (is_horizontal_whitespace(c)) {
        lexer->advance(lexer, false);
        c = lexer->lookahead;
    }

    // Check for optional parameters
    if (c == '(') {
        // Skip through parameters list
        lexer->advance(lexer, false);
        c = lexer->lookahead;
        int paren_depth = 1;

        while (paren_depth > 0 && c != 0) {
            if (c == '(') {
                paren_depth++;
            } else if (c == ')') {
                paren_depth--;
            } else if (c == '\n' || c == '\r') {
                // Parameters can span multiple lines
            }
            lexer->advance(lexer, false);
            c = lexer->lookahead;
        }

        // Skip horizontal whitespace after parameters
        while (is_horizontal_whitespace(c)) {
            lexer->advance(lexer, false);
            c = lexer->lookahead;
        }
    }

    // Skip horizontal whitespace before colon
    while (is_horizontal_whitespace(c)) {
        lexer->advance(lexer, false);
        c = lexer->lookahead;
    }

    // Must have a colon
    if (c != ':') {
        return false;
    }

    // If we get here, this is a valid procedure declaration start
    return true;
}

bool tree_sitter_technique_external_scanner_scan(
    void *payload,
    TSLexer *lexer,
    const bool *valid_symbols
) {
    // Check for procedure boundary - zero-width token at start of procedure
    if (valid_symbols[BOUNDARY]) {
        // Don't skip whitespace - we need to be at column 0
        if (lexer->get_column(lexer) != 0) {
            return false;
        }

        // Save current position for zero-width token
        lexer->mark_end(lexer);

        // Check if this is a procedure declaration
        if (is_procedure_declaration(lexer)) {
            // Emit zero-width token
            lexer->result_symbol = BOUNDARY;
            return true;
        }
    }

    return false;
}