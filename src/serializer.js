import assert from 'assert';
import { Serializer } from 'jsonapi-serializer';

import { Item, Collection } from './models';

export default class JSONAPISerializer extends Serializer {
  constructor(type, opts = {}) {
    assert.ok(typeof type === 'string');

    if (!(opts.attributes instanceof Array)) {
      opts.attributes = [];
    }

    if (opts.relationships instanceof Array) {
      for (let relationship of opts.relationships) {
        opts[relationship] = { ref: 'id', included: false };

        if (!opts.attributes.includes(relationship)) {
          opts.attributes.push(relationship);
        }
      }

      delete opts.relationships;
    }

    if (!(opts.typeForAttribute instanceof Function)) {
      opts.typeForAttribute = typeForAttribute;
    }

    super(`hyde/${type}`, opts);
  }

  serialize(model) {
    // the `jsonapi-serializer` package includes `{ data: null }` objects for missing rels;
    // use `serializeWithoutBlankRels` to simply omit rel keys with null values altogether.
    // n.b. the `super` structure is unconventional due to how `jsonapi-serializer` defines `Serializer#serialize`.
    return super.serialize(model);
  }

  serializeWithoutBlankRels(model) {
    let json = this.serialize(model);
    let relationships = json.data.relationships;

    if (relationships !== undefined) {
      for (let relName in relationships) {
        let data = relationships[relName].data;
        let isBlank = data === undefined || data === null ||
          ((data instanceof Array) && data.length === 0);

        if (isBlank) {
          delete relationships[relName];
        }
      }

      json.data.relationships = relationships;
    }

    return json;
  }
}

function typeForAttribute(type, value) {
  switch (value.constructor) {
    case Collection: return 'hyde/collections';
    case Item: return 'hyde/items';
    default: return type;
  }
}
