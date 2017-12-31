import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);

describe('Models - Collection', function() {
  let Collection;
  let Item;

  beforeEach(function() {
    Collection = require('../../../src/models/collection').default;
    Item = require('../../../src/models/item').default;
  });

  describe('.constructor', function() {
    let data;
    let collection;

    context('when passed an object', function() {
      beforeEach(function() {
        data = {
          id: 'id',
          parent: new Collection(),
          collections: [new Collection()],
          items: [new Item()]
        };

        collection = new Collection(data);
      });

      it('sets the instance\'s id', function() {
        expect(collection.id).to.equal(data.id);
      });

      it('sets the instance\'s parent', function() {
        expect(collection.parent).to.equal(data.parent);
      });

      it('sets the instance\'s collections', function() {
        expect(collection.collections).to.equal(data.collections);
      });

      it('sets the instance\'s items', function() {
        expect(collection.items).to.equal(data.items);
      });
    });

    context('when initial object has invalid collections || items', function() {
      beforeEach(function() {
        data = {
          collections: new Collection(),
          items: new Item()
        };

        collection = new Collection(data);
      });

      it('sets Collection#collections to a blank array', function() {
        expect(collection.collections).not.to.equal(data.collections);
        expect(collection.collections).to.be.instanceof(Array);
        expect(collection.collections.length).to.equal(0);
      });

      it('sets Collection#items to a blank array', function() {
        expect(collection.items).not.to.equal(data.items);
        expect(collection.items).to.be.instanceof(Array);
        expect(collection.items.length).to.equal(0);
      });
    });

    context('when not passed an object', function() {
      beforeEach(function() {
        collection = new Collection();
      });

      it('sets Collection#collections to a blank array', function() {
        expect(collection.collections).to.be.instanceof(Array);
        expect(collection.collections.length).to.equal(0);
      });

      it('sets Collection#items to a blank array', function() {
        expect(collection.items).to.be.instanceof(Array);
        expect(collection.items.length).to.equal(0);
      });
    });
  });

  describe('instance:', function() {
    let collection;

    beforeEach(function() {
      collection = new Collection();
    });

    describe('#parent=', function() {
      let parent;

      beforeEach(function() {
        parent = new Collection();
        collection.parent = parent;
      });

      it('adds the object to the new parent\'s collections', function() {
        expect(parent.collections.includes(collection)).to.equal(true);
      });

      it('sets Collection#parent', function() {
        expect(collection.parent).to.equal(parent);
      });

      context('and when a new parent is set', function() {
        beforeEach(function() {
          collection.parent = new Collection();
        });

        it('removes the object from the old parent\'s collections', function() {
          expect(parent.collections.includes(collection)).to.equal(false);
        });
      });
    });
  });
});
