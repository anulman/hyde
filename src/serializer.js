import assert from 'assert';
import { Serializer } from 'jsonapi-serializer';
import { defaults, isEmpty, isObject } from 'lodash';

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

    if (!isPresent(opts.typeForAttribute)) {
      opts.typeForAttribute = typeForAttribute;
    }

    super(type, opts);
  }

  serialize(model) {
    // the `jsonapi-serializer` package includes `{ data: null }` objects for missing rels;
    // use `serializeWithoutBlankRels` to simply omit rel keys with null values altogether.
    // n.b. the `super` structure is unconventional due to how `jsonapi-serializer` defines `Serializer#serialize`.
    return super.serialize(this._preserialize(model));
  }

  serializeWithoutBlankRels(model) {
    let json = this.serialize(this._preserialize(model));

    if (isPresent(json)) {
      if (json.data instanceof Array) {
        json.data = json.data.map((item) => removeBlankCollectionsFrom(item));
      } else if (json) {
        json.data = removeBlankCollectionsFrom(json.data);
      }
    }

    return json;
  }

  _preserialize(model) {
    let { parent, children, tags, yaml } = model;

    children = children.filter((child) => isPresent(child.yaml));

    return !isPresent(yaml) ?
      children :
      defaults({}, { parent, children, tags }, model, yaml, yaml.relationships);
  }
}

function isPresent(obj) {
  return isObject(obj) && !isEmpty(obj);
}

function removeBlankCollectionsFrom(jsonData) {
  let relationships = jsonData.relationships;

  if (relationships !== undefined) {
    for (let relName in relationships) {
      let data = relationships[relName].data;
      let isBlank = data === undefined || data === null ||
        ((data instanceof Array) && data.length === 0);

      if (isBlank) {
        delete relationships[relName];
      }
    }

    jsonData.relationships = relationships;
  }

  if (jsonData.attributes && isEmpty(jsonData.attributes)) {
    delete jsonData.attributes;
  }

  if (jsonData.relationships && isEmpty(jsonData.relationships)) {
    delete jsonData.relationships;
  }

  return jsonData;
}

function typeForAttribute(type, value) {
  return value.type || type;
}
