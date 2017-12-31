import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import td from 'testdouble';
import fs from 'fs';
import util from 'util';

import testAsyncFunctionThrows from '../helpers/test-async-function-throws';

chai.use(chaiAsPromised);

const readFile = util.promisify(fs.readFile);

describe('Parser', function() {
  let fs;
  let Parser;
  let Item;
  let Hyde;

  beforeEach(function() {
    fs = td.replace('fs-extra'); // n.b. must come before `require(Parser)`

    Parser = require('../../src/parser').default;
    Item = require('../../src/models/item').default;
    Hyde = require('../../src/index').default;
  });

  afterEach(function() {
    td.reset();
  });

  describe('.constructor', function() {
    context('when passed a context', function() {
      let ctx;

      beforeEach(function() {
        ctx = new Hyde('context');
      });

      it('sets the instance\'s context', function() {
        let parser = new Parser(ctx);

        expect(parser.context).to.equal(ctx);
      });
    });
  });

  describe('instance:', function() {
    let parser;

    beforeEach(function() {
      parser = new Parser();
    });

    describe('#parse', function() {
      context('when passed a string', function() {
        let content;
        let returnValue;

        context('with valid frontmatter', function() {
          beforeEach(async function() {
            let filename = './tests/samples/with-tags.md';
            content = await readFile(filename, 'utf8');

            returnValue = parser.parse(content);
          });

          it('returns an Item', function() {
            expect(returnValue.constructor.name).to.equal('Item');
          });

          it('sets Item#yaml', function() {
            expect(returnValue.yaml).to.be;
          });

          it('does not parse Item#tags w/o a context', function() {
            expect(returnValue.yaml.tags).to.be.instanceof(Array);
            expect(returnValue.tags).not.to.be;
          });

          it('trims and sets Item#markdown', function() {
            expect(returnValue.markdown)
              .to.equal(content.slice(content.indexOf('---', 1) + 4).trim());
          });
        });

        context('with valid frontmatter & a context', function() {
          let ctx;

          beforeEach(function() {
            ctx = new Hyde('context');
          });

          context('when tags exist', function() {
            beforeEach(async function() {
              content = await readFile('./tests/samples/with-tags.md', 'utf8');
              returnValue = parser.parse(content, ctx);
            });

            it('sets item tags', function() {
              expect(returnValue.tags).to.be.instanceof(Array);
              expect(returnValue.yaml.tags).not.to.be;
            });

            it('adds tags to ctx.collections', function() {
              for (let tag of returnValue.tags) {
                expect(ctx.collections.includes(tag)).to.equal(true);
              }
            });

            it('adds the item to ctx.items', function() {
              expect(ctx.items.includes(returnValue)).to.equal(true);
            });
          });

          context('when tags do not exist', function() {
            beforeEach(async function() {
              let filename = './tests/samples/without-tags.md';

              content = await readFile(filename, 'utf8');
              returnValue = parser.parse(content, ctx);
            });

            it('sets a blank array', function() {
              expect(returnValue.tags).to.be.instanceof(Array);
              expect(returnValue.tags.length).to.equal(0);
              expect(returnValue.yaml.tags).not.to.be;
            });

            it('adds the item to ctx.items', function() {
              expect(ctx.items.includes(returnValue)).to.equal(true);
            });
          });
        });

        context('with invalid frontmatter', function() {
          beforeEach(async function() {
            let filename = './tests/samples/invalid-fm.md';
            content = await readFile(filename, 'utf8');
          });

          it('does not set Item#yaml', function() {
            testAsyncFunctionThrows('YAMLException', () => {
              return parser.parse(content);
            });
          });
        });

        context('without frontmatter', function() {
          beforeEach(async function() {
            let filename = './tests/samples/without-fm.md';
            content = await readFile(filename, 'utf8');

            returnValue = parser.parse(content);
          });

          it('does not set Item#yaml', function() {
            expect(returnValue.yaml).not.to.be;
          });

          it('does not set Item#tags', function() {
            expect(returnValue.tags).not.to.be;
          });

          it('trims and sets Item#markdown', function() {
            expect(returnValue.markdown)
              .to.equal(content.trim());
          });
        });
      });

      for (let value of [undefined, null, 1, ['foo'], { bar: 'baz' }]) {
        context(`when passed ${value}`, function() {
          testAsyncFunctionThrows('AssertionError', () => parser.parse(value));
        });
      }
    });

    describe('#parseFile', function() {
      let filepath = 'foo/bar/baz';
      let fileContent = 'sample content';

      context('when passed file is markdown', function() {
        let item;

        beforeEach(function() {
          item = new Item();

          td.replace(parser, 'parse');
          td.when(parser.parse(fileContent))
            .thenReturn(item);

          td.when(fs.readFile(), { ignoreExtraArgs: true })
            .thenResolve(fileContent);
        });

        for (let ext of ['.md', '.markdown']) {
          context(`(with ext ${ext})`, function() {
            let filename;
            let returnValue;

            beforeEach(function() {
              filename = `${filepath}${ext}`;
            });

            context('when called with filepath', function() {
              beforeEach(async function() {
                returnValue = await parser.parseFile(filename);
              });

              it('proxies parse\'s return value', function() {
                expect(returnValue).to.equal(item);
              });

              it('ids the file based on the filepath', function() {
                expect(returnValue.id).to.equal(filepath);
              });
            });

            context('when called with filepath + inputPath', function() {
              let inputPath;
              let expectedId;

              beforeEach(async function() {
                inputPath = `${filepath.split('/')[0]}/`;
                expectedId = filepath.split('/').slice(1).join('/');

                returnValue = await parser.parseFile(filename, inputPath);
              });

              it('rms the inputPath from Item#id', function() {
                expect(returnValue.id.startsWith(inputPath))
                  .to.equal(false);

                expect(returnValue.id).to.equal(expectedId);
              });
            });

            context('when called with filepath + context', function() {
              let ctx;

              beforeEach(async function() {
                ctx = new Hyde('context');

                returnValue = await parser.parseFile(filename, null, ctx);
              });

              it('prepends Item#id with Context#name', function() {
                expect(returnValue.id.startsWith(ctx.name))
                  .to.equal(true);

                expect(returnValue.id).to.equal(`${ctx.name}/${filepath}`);
              });

              it('recursively sets Item#parent', function() {
                while (returnValue.id.lastIndexOf('/') > -1) {
                  let expectedParentId = returnValue.id
                    .slice(0, returnValue.id.lastIndexOf('/'));

                  expect(returnValue.parent.id).to.equal(expectedParentId);

                  returnValue = returnValue.parent;
                }
              });
            });
          });
        }
      });

      context('when passed file is not markdown', function() {
        for (let ext of ['.jpg', '.pdf', '.json', '.html']) {
          context(`(with ext ${ext})`, function() {
            it('does not attempt to read the file', function() {
              td.verify(fs.readFile(), {
                ignoreExtraArgs: true,
                times: 0
              });
            });

            it('returns undefined', async function() {
              expect(await parser.parseFile(`${filepath}${ext}`, '/'))
                .to.equal(undefined);
            });
          });
        }
      });
    });
  });
});
