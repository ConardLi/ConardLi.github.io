/**
 * 将 JSON 转换为 MarkDown，按文章数量顺序进行排序，分为整体目录和独立目录
 */

const fs = require('fs').promises;
const path = require('path');

async function walkDirectory(dir, callback) {
    try {
        const files = await fs.readdir(dir);
        for (const file of files) {
            const filePath = path.join(dir, file);
            const stats = await fs.stat(filePath);
            if (stats.isDirectory()) {
                await walkDirectory(filePath, callback);
            } else {
                const fileName = path.basename(filePath);
                await callback(null, filePath, fileName);
            }
        }
    } catch (err) {
        await callback(err);
    }
}

const directoryPath = path.resolve(__dirname, '../json');


function json2md(json) {
    let text = '';
    for (let i = 0; i < json.length; i++) {
        const { name, data } = json[i];
        text += `\r### ${name} \r\r`

        for (let j = 0; j < data.length; j++) {
            const { link, title, time } = data[j];
            text += `- [【${time}】${title}](${link}) \r`
        }
    }
    return text;
}


(async () => {
    const result = [];
    try {
        await walkDirectory(directoryPath, (err, filePath) => {
            if (err) {
                console.error('发生错误:', err);
            } else {
                const fileName = path.basename(filePath).split('.json')[0];
                console.log('找到文件:', filePath, fileName);
                const data = require(filePath);
                result.push({
                    name: fileName + `【${data.length}】`,
                    data,
                    length: data.length
                });
            }
        });
        console.log(result);
        const text = json2md(result.sort((b, a) => a.length - b.length));
        fs.writeFile(path.resolve(__dirname, '../md/result.md'), text)
    } catch (error) {
        console.error(error);
    }
})();
