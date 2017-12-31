import assert from 'assert';
import { extname, join } from 'path';
import { readFile } from 'fs-extra';
import { safeLoad } from 'js-yaml';

import { Item } from './models';
import { parentIdFor, findOrCreateCollection, trackModel }
  from './utils/context';

export default class Parser {
  constructor(context) {
    this.context = context;
  }

  async parseFile(filepath, inputPath = '', context = this.context) {
    let ext = extname(filepath);

    if (ext === '.md' || ext === '.markdown') {
      let content = await readFile(filepath, 'utf8');
      let item = this.parse(content);
      let inputPathLength = typeof inputPath === 'string' ?
        inputPath.length :
        0;

      item.id = filepath.slice(inputPathLength, ext.length * -1);

      if (context !== undefined) {
        let itemId = join(context.name, item.id);
        let parentId = parentIdFor.call(context, itemId);

        item.id = itemId;
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

      if (context) {
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
