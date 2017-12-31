import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';

import testAsyncFunctionThrows from '../../helpers/test-async-function-throws';

chai.use(chaiAsPromised);

describe('Models - Item', function() {
  let Collection;
  let Item;

  beforeEach(function() {
    Collection = require('../../../src/models/collection').default;
    Item = require('../../../src/models/item').default;
  });

  describe('.constructor', function() {
    let data;
    let item;

    context('when passed an object', function() {
      beforeEach(function() {
        data = {
          id: 'id',
          parent: new Collection(),
          yaml: { foo: 'bar' },
          markdown: 'baz',
          tags: [new Collection()]
        };

        item = new Item(data);
      });

      it('sets the Item#id', function() {
        expect(item.id).to.equal(data.id);
      });

      it('sets the Item#parent', function() {
        expect(item.parent).to.equal(data.parent);
      });

      it('sets the Item#yaml', function() {
        expect(item.yaml).to.equal(data.yaml);
      });

      it('sets the Item#markdown', function() {
        expect(item.markdown).to.equal(data.markdown);
      });

      it('sets the Item#tags', function() {
        expect(item.tags).to.equal(data.tags);
      });
    });

    context('when initial object has invalid tags', function() {
      beforeEach(function() {
        data = {
          tags: new Collection()
        };

        item = new Item(data);
      });

      it('sets Item#tags to a blank array', function() {
        expect(item.tags).not.to.equal(data.tags);
        expect(item.tags).to.be.instanceof(Array);
        expect(item.tags.length).to.equal(0);
      });
    });

    context('when not passed an object', function() {
      beforeEach(function() {
        item = new Item(data);
      });

      it('sets Item#tags to a blank array', function() {
        expect(item.tags).to.be.instanceof(Array);
        expect(item.tags.length).to.equal(0);
      });
    });
  });

  describe('instance:', function() {
    let item;

    beforeEach(function() {
      item = new Item();
    });

    describe('#tags=', function() {
      let tags;

      context('when setting an array of collections', function() {
        beforeEach(function() {
          tags = [new Collection()];
          item.tags = tags;
        });

        it('adds the object to the new tags\' items', function() {
          for (let tag of tags) {
            expect(tag.items.includes(item)).to.equal(true);
          }
        });

        it('sets Item#tags', function() {
          expect(item.tags).to.equal(tags);
        });

        context('and when tags are overwritten', function() {
          beforeEach(function() {
            item.tags = [new Collection()];
          });

          it('removes the object from the old tags\' collections', function() {
            for (let tag of tags) {
              expect(tag.items.includes(item)).to.equal(false);
            }
          });
        });
      });

      context('when setting a non-array', function() {
        it('throws an AssertionError', function() {
          testAsyncFunctionThrows('AssertionError', () => item.tags = 1);
        });
      });

      context('when setting an array with non-Collection values', function() {
        it('throws an AssertionError', function() {
          testAsyncFunctionThrows('AssertionError', () => item.tags = [1]);
        });
      });
    });

    describe('#parent=', function() {
      let parent;

      beforeEach(function() {
        parent = new Collection();
        item.parent = parent;
      });

      it('adds the object to the new parent\'s items', function() {
        expect(parent.items.includes(item)).to.equal(true);
      });

      it('sets Item#parent', function() {
        expect(item.parent).to.equal(parent);
      });

      context('and when a new parent is set', function() {
        beforeEach(function() {
          item.parent = new Collection();
        });

        it('removes the object from the old parent\'s collections', function() {
          expect(parent.collections.includes(item)).to.equal(false);
        });
      });
    });
  });
});
