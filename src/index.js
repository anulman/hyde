import assert from 'assert';

import Parser from './parser';
import Serializer from './serializer';
import { serializerFor } from './utils/context';

const DEFAULT_NAME = 'content';

export default class Hyde {
  constructor(name, opts = {}) {
    assert.ok(typeof name === 'string');

    this.name = name;
    this.db = {
      items: [],
      collections: []
    };

    this.parser = new Parser(this);
    this.serializers = {
      item: opts.itemSerializer || new Serializer('item', {
        attributes: ['yaml'],
        relationships: ['parent', 'tags']
      }),
      collection: opts.collectionSerializer || new Serializer('collection', {
        relationships: ['parent', 'collections', 'items']
      })
    };
  }

  get items() {
    return this.db.items;
  }

  get collections() {
    return this.db.collections;
  }

  parse() {
    return this.parser.parse(...arguments);
  }

  async parseFile() {
    return this.parser.parseFile(...arguments);
  }

  serialize(model) {
    let serializer = serializerFor.call(this, model.constructor);

    if (serializer !== undefined) {
      return serializer.serializeWithoutBlankRels(model);
    }
  }

  static get defaultInstance() {
    let defaultInstance = this._defaultInstance;

    if (defaultInstance === undefined) {
      defaultInstance = new this(DEFAULT_NAME);
      this._defaultInstance = defaultInstance;
    }

    return defaultInstance;
  }

  static get items() {
    return this.defaultInstance.items;
  }

  static get collections() {
    return this.defaultInstance.collections;
  }

  static parse() {
    return this.defaultInstance.parse(...arguments);
  }

  static async parseFile() {
    return this.defaultInstance.parseFile(...arguments);
  }

  static serialize() {
    return this.defaultInstance.serialize(...arguments);
  }
}
