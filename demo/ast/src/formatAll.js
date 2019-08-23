const fs = require('fs');
const path = require('path');
const acorn = require('acorn');
const escodegen = require('escodegen');

/**
 * 格式化某路径下的所有js文件
 */
module.exports = function (footer) {
    let dirArray = fs.readdirSync(footer)
    for (let i = 0; i < dirArray.length; i++) {
        const file = path.resolve(footer, dirArray[i]);
        if (fs.existsSync(file) && /(.js)$/.test(file)) {
            console.log('正在格式化文件：' + file);
            let fileCode = fs.readFileSync(file);
            const comments = [];
            const tokens = [];
            const ast = acorn.parse(fileCode, {
                ranges: true,
                onComment: comments,
                onToken: tokens
            });
            escodegen.attachComments(ast, comments, tokens);
            fs.writeFileSync(file, escodegen.generate(ast, {
                comment: true
            }));
        }
    }
};
