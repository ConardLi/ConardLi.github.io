/**
 * transfer tag to imagg-box block.
 * {% img [class names] /path/to/image [width] [height] '"alt text" "title text"' %}
 * This is used to display image title.
 */
hexo.extend.tag.register('img', ([src, alt = '', title = '', imgClass = '']) => {
    return `<div class="image-box">
                <img src="${src}" alt="${alt}" title="${title}" class="${imgClass}">
                <p class="image-box-title">${title || alt}</p>
            </div>`;
});