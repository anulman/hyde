import assert from 'assert';

import Parser from './parser';
import { serializerFor } from './utils/context';

const DEFAULT_NAME = 'content';

export default class Hyde {
  constructor(name, opts = {}) {
    assert.ok(typeof name === 'string');

    this.name = name;
    this.models = [];

    this.parser = new Parser(this);
    this.serializers = {};
  }

  parse() {
    return this.parser.parse(...arguments);
  }

  async parseFile() {
    return this.parser.parseFile(...arguments);
  }

  serialize(model) {
    let serializer = serializerFor.call(this, model);

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
