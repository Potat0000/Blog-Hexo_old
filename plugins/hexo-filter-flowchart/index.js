var assign = require('deep-assign');
var renderer = require('./lib/renderer');

hexo.config.flowchart = assign({
  options: {
    'scale': 1,
    'line-width': 2,
    'line-length': 50,
    'text-margin': 10,
    'font-size': 12
  }
}, hexo.config.flowchart);

hexo.extend.filter.register('before_post_render', renderer.before, 9);
