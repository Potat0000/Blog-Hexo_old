'use strict';

const Prism = require('node-prismjs');

const map = {
  '&#39;': '\'',
  '&amp;': '&',
  '&gt;': '>',
  '&lt;': '<',
  '&quot;': '"'
};

const regex = /<pre><code class="(.*)?">([\s\S]*?)<\/code><\/pre>/igm;
const captionRegex = /<p><code>(?![\s\S]*<code)(.*?)\s(.*?)\n([\s\S]*)<\/code><\/p>/igm;

/**
 * Unescape from Marked escape
 * @param {String} str
 * @return {String}
 */
function unescape(str) {
  if (!str || str === null) return '';
  const re = new RegExp('(' + Object.keys(map).join('|') + ')', 'g');
  return String(str).replace(re, (match) => map[match]);
}


// If prism plugin has not been configured, it cannot be initialized properly.
if (!hexo.config.prism_plugin) {
  throw new Error('`prism_plugin` options should be added to _config.yml file');
}

// Plugin settings from config
const prismThemeName = hexo.config.prism_plugin.theme || 'default';
const mode = hexo.config.prism_plugin.mode || 'preprocess';
const line_number = hexo.config.prism_plugin.line_number || false;
const custom_css = hexo.config.prism_plugin.custom_css || null;
const no_assets = hexo.config.prism_plugin.no_assets || false;

/**
 * Code transform for prism plugin.
 * @param {Object} data
 * @return {Object}
 */
function PrismPlugin(data) {
  // Patch for caption support
  if (captionRegex.test(data.content)) {
    // Attempt to parse the code
    data.content = data.content.replace(captionRegex, (origin, lang, caption, code) => {
      if (!lang || !caption || !code) return origin;
      return `<figcaption>${caption}</figcaption><pre><code class="${lang}">${code}</code></pre>`;
    })
  }

  data.content = data.content.replace(regex, (origin, lang, code) => {
    const lineNumbers = line_number ? 'line-numbers' : '';
    const startTag = `<pre class="${lineNumbers} language-${lang}"><code class="language-${lang}">`;
    const endTag = `</code></pre>`;
    code = unescape(code);
    let parsedCode = '';
    if (Prism.languages[lang]) {
      parsedCode = Prism.highlight(code, Prism.languages[lang]);
    } else {
      parsedCode = code;
    }
    if (line_number) {
      const match = parsedCode.match(/\n(?!$)/g);
      const linesNum = match ? match.length + 1 : 1;
      let lines = new Array(linesNum + 1);
      lines = lines.join('<span></span>');
      const startLine = '<span aria-hidden="true" class="line-numbers-rows">';
      const endLine = '</span>';
      parsedCode += startLine + lines + endLine;
    }
    return startTag + parsedCode + endTag;
  });

  return data;
}

/**
 * Injects code to html for importing assets.
 * @param {String} code
 * @param {Object} data
 */
function importAssets(code, data) {
  const js = [];
  const css = [
    `<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/PrismJS/prism-themes/themes/${prismThemeName}.min.css" type="text/css" media="none" onload="this.media='all'">`
  ];

  if (line_number && custom_css === null) {
    css.push(`<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/prismjs@1.23.0/plugins/line-numbers/prism-line-numbers.min.css" type="text/css" media="none" onload="this.media='all'">`);
  }
  if (mode === 'realtime') {
    js.push(`<script>async("https://cdn.jsdelivr.net/npm/prismjs@1.23.0/prism.min.js");</script>`);
    if (line_number) {
      js.push(`<script>async("https://cdn.jsdelivr.net/npm/prismjs@1.23.0/plugins/line-numbers/prism-line-numbers.min.js");</script>`);
    }
  }
  const imports = css.join('\n') + js.join('\n');

  // Avoid duplicates
  if (code.indexOf(imports) > -1) {
    return code;
  }
  return code.replace(/<\s*\/\s*head\s*>/, imports + '</head>');;
}

// Register prism plugin
// Set priority to make sure PrismPlugin executed first
// Lower priority means that it will be executed first. The default priority is 10.
hexo.extend.filter.register('after_post_render', PrismPlugin, 9);

if (custom_css === null && !no_assets) {
  // Register for importing static assets
  hexo.extend.filter.register('after_render:html', importAssets);
}
