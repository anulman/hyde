import assert from 'assert';
import { sep } from 'path';

import Model from '../model';
import Serializer from '../serializer';
import { defaults, isObject, isPlainObject } from 'lodash';

export function typeFor(model) {
  let idComponents = model.id.split('/');
  let typeComponents = [this.name];

  if (idComponents.length > 2) {
    typeComponents = typeComponents.concat(idComponents.slice(1, -1));
  }

  if (!isObject(model.yaml)) {
    typeComponents = typeComponents.concat(idComponents.slice(-1));
  }

  return typeComponents.join('/');
}

export function serializerFor(model) {
  let type = typeFor.call(this, model);
  let yaml = model.yaml || {};
  let relationships = yaml && yaml.relationships || {};
  let attributes = Object.keys(yaml).filter((key) => key !== 'relationships');

  relationships = ensurePushed(Object.keys(relationships), ...[
    'tags',
    'children'
  ]);

  return new Serializer(type, { attributes, relationships });
}

export function parentIdFor(id) {
  assert.ok(typeof id === 'string');

  let lastSepIndex = id.lastIndexOf(sep);

  return lastSepIndex > -1 ?
    id.slice(0, lastSepIndex) :
    null;
}

export function parentModelFor(id) {
  let parentId = parentIdFor(id);

  return parentId !== null && findOrCreateModel.call(this, parentId);
}

export function findOrCreateModel(id, attrs) {
  assert.ok(typeof id === 'string');

  let model = this.models.find((model) => model.id === id);

  if (model === undefined) {
    let parent = parentModelFor.call(this, id);

    model = new Model({ id, parent });
    trackModel.call(this, model);
  }

  if (attrs !== undefined) {
    for (let key of Object.keys(attrs)) {
      let value = attrs[key];

      model[key] = mergeAttribute(model, key, value);
    }
  }

  return model;
}

function mergeAttribute(model, key, value) {
  let modelValue = model[key];

  if (isPlainObject(modelValue)) {
    return defaults(modelValue, value);
  } else if (modelValue instanceof Array) {
    return modelValue.map((innerModel) => {
      for (let innerKey of Object.keys(innerModel)) {
        let innerValue = innerModel[innerKey];

        innerModel[innerKey] = mergeAttribute(innerModel, innerKey, innerValue);
      }
    });
  } else {
    return modelValue || value;
  }
}

export function trackModel(model) {
  if (!this.models.some((tracked) => tracked === model)) {
    this.models.push(model);
  }
}

function ensurePushed(collection, ...args) {
  args.forEach((arg) => {
    if (!collection.includes(arg)) {
      collection.push(arg);
    }
  });

  return collection;
}
