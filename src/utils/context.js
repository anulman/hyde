import assert from 'assert';
import { sep } from 'path';

import { Item, Collection } from '../models';

export function dbCollectionFor(constructor) {
  switch (constructor) {
    case Item: return this.items;
    case Collection: return this.collections;
    default: assert.fail('passed an invalid constructor');
  }
}

export function serializerFor(constructor) {
  switch (constructor) {
    case Item: return this.serializers.item;
    case Collection: return this.serializers.collection;
    default: assert.fail('passed an invalid constructor');
  }
}

export function parentIdFor(id) {
  assert.ok(typeof id === 'string');

  let lastSepIndex = id.lastIndexOf(sep);

  return lastSepIndex > -1 ?
    id.slice(0, lastSepIndex) :
    null;
}

export function findOrCreateCollection(id) {
  assert.ok(typeof id === 'string');

  let collection = this.collections.find((collection) => collection.id === id);

  if (collection === undefined) {
    let parentId = parentIdFor.call(this, id);
    let parent = parentId !== null &&
      findOrCreateCollection.call(this, parentId);

    collection = new Collection({ id, parent });
    trackModel.call(this, collection);
  }

  return collection;
}

export function trackModel(model) {
  let trackedModels = dbCollectionFor.call(this, model.constructor);

  assert.ok(!trackedModels.some((tracked) => tracked.id === model.id));

  trackedModels.push(model);
}
