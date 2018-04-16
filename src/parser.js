import assert from 'assert';
import { defaults } from 'lodash';
import { extname, join } from 'path';
import { readFile } from 'fs-extra';
import { safeLoad } from 'js-yaml';

import Model from './model';
import { parentModelFor, findOrCreateModel } from './utils/context';

export const PERMITTED_EXTENSIONS = [
  '.md',
  '.markdown',
  '.mbs',
  '.yml',
  '.yaml'
];

export default class Parser {
  constructor(context) {
    this.context = context;
  }

  async parseFile(filepath, { id } = {}, context = this.context) {
    let ext = extname(filepath);

    if (PERMITTED_EXTENSIONS.includes(ext)) {
      let content = await readFile(filepath, 'utf8');
      id = id || filepath.replace(new RegExp(`${ext}$`), '');

      return this.parse(content, { id, ext }, context);
    }
  }

  async parse(content, { id, ext } = {}, context = this.context) {
    let parent = context !== undefined && parentModelFor.call(context, id);
    let parsed = ext && ext.startsWith('.m') ?
      this.parseMarkdown(content) :
      this.parseYAML(content);

    let model = context ?
      findOrCreateModel.call(context, id, defaults(parsed, { ext, parent })) :
      new Model(defaults(parsed, { id, ext, parent }));

    return model;
  }

  parseMarkdown(markdown, model = new Model(), context = this.context) {
    assert.ok(typeof markdown === 'string');

    markdown = markdown.trim();

    if (markdown.startsWith('---\n')) {
      let yamlEndIndex = markdown.indexOf('---\n', 1);
      let yamlString = markdown.slice(4, yamlEndIndex - 1);
      let { yaml, tags } = this.parseYAML(yamlString, model, context);

      markdown = markdown.slice(yamlEndIndex + 4).trim();

      return { markdown, yaml, tags };
    } else {
      return { markdown };
    }
  }

  parseYAML(content, model = new Model(), context = this.context) {
    assert.ok(typeof content === 'string');

    let yaml = safeLoad(content);
    let tags;

    if (context && yaml && yaml.tags instanceof Array) {
      tags = yaml.tags
        .map((tag) => join(context.name, 'tags', tag))
        .map((tagId) => findOrCreateModel.call(context, tagId));

      delete yaml.tags;
    }

    return { yaml, tags };
  }
}
