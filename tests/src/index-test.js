import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import td from 'testdouble';

import testAsyncFunctionThrows from '../helpers/test-async-function-throws';

chai.use(chaiAsPromised);

describe('Hyde', function() {
  let Hyde;
  let Collection;
  let Item;

  beforeEach(function() {
    Hyde = require('../../src/index').default;
    Item = require('../../src/models/item').default;
    Collection = require('../../src/models/collection').default;
  });

  describe('.constructor', function() {
    context('when not passed a name', function() {
      testAsyncFunctionThrows('AssertionError', () => new Hyde());
    });

    context('when passed a name', function() {
      let name = 'context';
      let ctx;
      let options;

      beforeEach(function() {
        ctx = new Hyde(name, options);
      });

      it('sets the name', function() {
        expect(ctx.name).to.equal(name);
      });

      it('creates a Parser', function() {
        expect(ctx.parser.constructor.name).to.equal('Parser');
        expect(ctx.parser.context).to.equal(ctx);
      });

      context('without an options object', function() {
        before(function() {
          options = undefined;
        });

        it('creates default serializers', function() {
          expect(ctx.serializers.item).to.be;
          expect(ctx.serializers.collection).to.be;
        });
      });

      context('and an options object', function() {
        before(function() {
          options = {
            itemSerializer: 1,
            collectionSerializer: 2
          };
        });

        context('with key `itemSerializer`', function() {
          it('sets the custom serializer', function() {
            expect(ctx.serializers.item)
              .to.equal(options.itemSerializer);
          });
        });

        context('with key `collectionSerializer`', function() {
          it('sets the custom serializer', function() {
            expect(ctx.serializers.collection)
              .to.equal(options.collectionSerializer);
          });
        });
      });
    });
  });

  describe('instance:', function() {
    let ctx;

    beforeEach(function() {
      ctx = new Hyde('context');
    });

    describe('#items', function() {
      it('proxies Hyde#db[items]', function() {
        expect(ctx.items).to.equal(ctx.db.items);
      });
    });

    describe('#collections', function() {
      it('proxies Hyde#db[collections]', function() {
        expect(ctx.collections).to.equal(ctx.db.collections);
      });
    });

    describe('#parse', function() {
      let returnValue = 'return';

      beforeEach(function() {
        td.replace(ctx.parser, 'parse');
        td.when(ctx.parser.parse(), { ignoreExtraArgs: true })
          .thenReturn(returnValue);
      });

      it('proxies Hyde#parser[parse]', function() {
        expect(ctx.parse('foo')).to.equal(returnValue);
      });
    });

    describe('#parseFile', function() {
      let returnValue = 'return';

      beforeEach(function() {
        td.replace(ctx.parser, 'parseFile');
        td.when(ctx.parser.parseFile(), { ignoreExtraArgs: true })
          .thenReturn(returnValue);
      });

      it('proxies Hyde#parser[parseFile]', function() {
        expect(ctx.parser.parseFile('foo')).to.equal(returnValue);
      });
    });

    describe('#serialize', function() {
      let returnValue = 'return';

      context('when passed an Item', function() {
        beforeEach(function() {
          td.replace(ctx.serializers.item, 'serializeWithoutBlankRels');
          td.when(ctx.serializers.item.serializeWithoutBlankRels(), {
            ignoreExtraArgs: true
          })
            .thenReturn(returnValue);
        });

        it('proxies Hyde#serializers[item][serialize]', function() {
          expect(ctx.serialize(new Item())).to.equal(returnValue);
        });
      });

      context('when passed a Collection', function() {
        beforeEach(function() {
          td.replace(ctx.serializers.collection, 'serializeWithoutBlankRels');
          td.when(ctx.serializers.collection.serializeWithoutBlankRels(), {
            ignoreExtraArgs: true
          })
            .thenReturn(returnValue);
        });

        it('proxies Hyde#serializers[collection][serialize]', function() {
          expect(ctx.serialize(new Collection())).to.equal(returnValue);
        });
      });
    });
  });

  describe('.defaultInstance', function() {
    it('returns the default Hyde context', function() {
      expect(Hyde.defaultInstance).to.be;
      expect(Hyde.defaultInstance.name).to.equal('content');
    });
  });

  describe('.items', function() {
    it('proxies Hyde.defaultInstance[items]', function() {
      expect(Hyde.items).to.equal(Hyde.defaultInstance.items);
    });
  });

  describe('.collections', function() {
    it('proxies Hyde.defaultInstance[collections]', function() {
      expect(Hyde.collections).to.equal(Hyde.defaultInstance.collections);
    });
  });

  describe('.parse', function() {
    let returnValue = 'return';

    beforeEach(function() {
      td.replace(Hyde.defaultInstance, 'parse');
      td.when(Hyde.defaultInstance.parse(), { ignoreExtraArgs: true })
        .thenReturn(returnValue);
    });

    it('proxies Hyde.defaultInstance[parse]', function() {
      expect(Hyde.parse('foo')).to.equal(returnValue);
    });
  });

  describe('.parseFile', function() {
    let returnValue = 'return';

    beforeEach(function() {
      td.replace(Hyde.defaultInstance, 'parseFile');
      td.when(Hyde.defaultInstance.parseFile(), { ignoreExtraArgs: true })
        .thenReturn(returnValue);
    });

    it('proxies Hyde.defaultInstance[parseFile]', async function() {
      expect(await Hyde.parseFile('foo.md')).to.equal(returnValue);
    });
  });

  describe('.serialize', function() {
    let returnValue = 'return';

    beforeEach(function() {
      td.replace(Hyde.defaultInstance, 'serialize');
      td.when(Hyde.defaultInstance.serialize(), { ignoreExtraArgs: true })
        .thenReturn(returnValue);
    });

    it('proxies Hyde.defaultInstance[serialize]', function() {
      expect(Hyde.serialize(new Item())).to.equal(returnValue);
    });
  });
});
