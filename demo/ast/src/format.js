const acorn = require('acorn');
const escodegen = require('escodegen');

/**
 * 格式化一段代码
 */
module.exports = function (code) {
    const comments = [];
    const tokens = [];
    const ast = acorn.parse(code, {
        ranges: true,
        onComment: comments,
        onToken: tokens
    });
    escodegen.attachComments(ast, comments, tokens);
    return escodegen.generate(ast, {
        format: {
            indent: {
                style: '    ',
                base: 0,
                adjustMultilineComment: false
            },
            newline: '\n',
            space: ' ',
            json: false,
            renumber: false,
            hexadecimal: false,
            quotes: 'single',
            escapeless: false,
            compact: false,
            parentheses: true,
            semicolons: true,
            safeConcatenation: false
        },
        comment: true
    });
};
