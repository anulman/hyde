import assert from 'assert';
import { extname, join } from 'path';
import { readFile } from 'fs-extra';
import { safeLoad } from 'js-yaml';

import { Item } from './models';
import { parentIdFor, findOrCreateCollection, trackModel }
  from './utils/context';

export const PERMITTED_EXTENSIONS = [
  '.md',
  '.markdown',
  '.mbs'
];

export default class Parser {
  constructor(context) {
    this.context = context;
  }

  async parseFile(filepath, { id } = {}, context = this.context) {
    let ext = extname(filepath);

    if (PERMITTED_EXTENSIONS.includes(ext)) {
      let content = await readFile(filepath, 'utf8');
      let item = this.parse(content);

      item.id = (id || filepath).replace(new RegExp(`${ext}$`), '');
      item.ext = ext;

      if (context !== undefined) {
        let parentId = parentIdFor.call(context, item.id);

        item.parent = parentId !== null &&
          findOrCreateCollection.call(context, parentId);
      }

      return item;
    }
  }

  parse(markdown, context = this.context) {
    assert.ok(typeof markdown === 'string');

    let item;

    markdown = markdown.trim();

    if (markdown.startsWith('---\n')) {
      let endIndex = markdown.indexOf('---\n', 1);
      let yaml = safeLoad(markdown.slice(4, endIndex - 1));
      let tags;

      if (context && yaml.tags instanceof Array) {
        tags = yaml.tags
          .map((tag) => join(context.name, 'tags', tag))
          .map((tagId) => findOrCreateCollection.call(context, tagId));

        delete yaml.tags;
      }

      item = new Item({
        markdown: markdown.slice(endIndex + 4).trim(),
        yaml,
        tags
      });
    } else {
      item = new Item({ markdown });
    }

    if (context) {
      trackModel.call(context, item);
    }

    return item;
  }
}
