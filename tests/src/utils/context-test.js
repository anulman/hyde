import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';

import testAsyncFunctionThrows from '../../helpers/test-async-function-throws';
import {
  dbCollectionFor,
  serializerFor,
  parentIdFor,
  findOrCreateCollection,
  trackModel
} from '../../../src/utils/context';

chai.use(chaiAsPromised);

describe('Utils - Context', function() {
  let ctx;
  let Hyde;
  let Collection;
  let Item;

  beforeEach(function() {
    Hyde = require('../../../src/index').default;
    Item = require('../../../src/models/item').default;
    Collection = require('../../../src/models/collection').default;

    ctx = new Hyde('context');
  });

  describe('dbCollectionFor', function() {
    context('when passed `Item.constructor`', function() {
      it('returns Hyde#items', function() {
        expect(dbCollectionFor.call(ctx, Item))
          .to.equal(ctx.items);
      });
    });

    context('when passed `Collection.constructor`', function() {
      it('returns Hyde#collections', function() {
        expect(dbCollectionFor.call(ctx, Collection))
          .to.equal(ctx.collections);
      });
    });

    context('when not passed Item || Collection constructors', function() {
      it('throws an AssertionError', function() {
        testAsyncFunctionThrows('AssertionError', dbCollectionFor.bind(ctx, 1));
      });
    });
  });

  describe('serializerFor', function() {
    context('when passed `Item.constructor`', function() {
      it('returns Hyde#serializers[item]', function() {
        expect(serializerFor.call(ctx, Item))
          .to.equal(ctx.serializers.item);
      });
    });

    context('when passed `Collection.constructor`', function() {
      it('returns Hyde#serializers[collection]', function() {
        expect(serializerFor.call(ctx, Collection))
          .to.equal(ctx.serializers.collection);
      });
    });

    context('when not passed Item || Collection constructors', function() {
      it('throws an AssertionError', function() {
        testAsyncFunctionThrows('AssertionError', serializerFor.bind(ctx, 1));
      });
    });
  });

  describe('parentIdFor', function() {
    context('when not passed a string', function() {
      it('throws an AssertionError', function() {
        testAsyncFunctionThrows('AssertionError', parentIdFor.bind(ctx, 1));
      });
    });

    context('when id has a / character', function() {
      it('strips the value after the last /', function() {
        expect(parentIdFor.call(ctx, 'foo/bar/baz'))
          .to.equal('foo/bar');
      });
    });

    context('when id does not have a / character', function() {
      it('returns null', function() {
        expect(parentIdFor.call(ctx, 'foo'))
          .to.equal(null);
      });
    });
  });

  describe('findOrCreateCollection', function() {
    context('when not passed a string', function() {
      it('throws an AssertionError', function() {
        let fn = findOrCreateCollection.bind(ctx, 1);

        testAsyncFunctionThrows('AssertionError', fn);
      });
    });

    context('when context has a collection for the id', function() {
      let collection;

      beforeEach(function() {
        collection = new Collection({ id: 'foo/bar' });
        ctx.collections.push(collection);
      });

      it('returns the collection', function() {
        expect(findOrCreateCollection.call(ctx, collection.id))
          .to.equal(collection);
      });
    });

    context('when context does not have a collection for the id', function() {
      let collection;

      beforeEach(function() {
        collection = findOrCreateCollection.call(ctx, 'foo/bar');
      });

      it('returns a new collection', function() {
        expect(collection).to.be;
      });

      it('adds the new collection to Hyde#collections', function() {
        expect(ctx.collections.includes(collection)).to.equal(true);
      });

      it('recursively creates parents for the new collection', function() {
        while (collection.id.indexOf('/') > -1) {
          expect(collection.parent).to.be;
          expect(ctx.collections.includes(collection.parent)).to.equal(true);

          collection = collection.parent;
        }
      });
    });
  });

  describe('trackModel', function() {
    let model;

    context('when passed an Item', function() {
      beforeEach(function() {
        model = new Item({ id: 'foo' });
      });

      context('and an item with the id is being tracked', function() {
        beforeEach(function() {
          ctx.items.push(new Item({ id: model.id }));
        });

        it('throws an AssertionError', function() {
          let fn = trackModel.bind(ctx, model);

          testAsyncFunctionThrows('AssertionError', fn);
        });
      });

      context('and no items with the id are being tracked', function() {
        beforeEach(function() {
          trackModel.call(ctx, model);
        });

        it('adds the item to Hyde#items', function() {
          expect(ctx.items.includes(model)).to.equal(true);
        });
      });
    });

    context('when passed a Collection', function() {
      beforeEach(function() {
        model = new Collection({ id: 'foo' });
      });

      context('and a collection with the id is being tracked', function() {
        beforeEach(function() {
          ctx.collections.push(new Collection({ id: model.id }));
        });

        it('throws an AssertionError', function() {
          let fn = trackModel.bind(ctx, model);

          testAsyncFunctionThrows('AssertionError', fn);
        });
      });

      context('and no collections with the id are being tracked', function() {
        beforeEach(function() {
          trackModel.call(ctx, model);
        });

        it('adds the item to Hyde#collections', function() {
          expect(ctx.collections.includes(model)).to.equal(true);
        });
      });
    });
  });
});
