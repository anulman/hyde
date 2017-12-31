# hyde
a stateful, jekyll-friendly cms parser for javascript

## info
### pipeline
- The site: https://anulman.com/www.aidans.computer
- Auto-builds + deploys with Travis: https://github.com/anulman/www.aidans.computer/blob/master/.travis.yml#L30-L40
- Using `ember-cli-hyde` to funnel root dirs through the Hyde compiler, merging output into the public tree: https://github.com/anulman/ember-cli-hyde/blob/master/index.js#L23-L41
   - dir values are configurable via `config/environment.js`, and defaults to `[content]`
- The compiler filters and processes relevant files, emitting `.json` metadata + `.md` bodies where appropriate: https://github.com/anulman/broccoli-hyde-compiler/blob/master/src/index.js#L25-L50
- And Hyde's parser parses the markdown into content + metadata, and builds + tracks the context's collections (eg recursive parents, tags): https://github.com/anulman/hyde/blob/master/src/parser.js#L15-L38
   - test suite covers everything but serialization, pending consideration of an upstream contrib

### ember users
- e-cli-hyde exposes a default adapter (w companion models): https://github.com/anulman/ember-cli-hyde/tree/master/app/adapters
- So you can `findAll` or `findRecord` accordingly: https://github.com/anulman/www.aidans.computer/blob/master/app/pods/content/item/route.js#L7
- When you render a `markdown-section` with an item: https://github.com/anulman/www.aidans.computer/blob/master/app/pods/content/item/template.hbs#L5
- The component fetches + loads the markdown separately from metadata: https://github.com/anulman/ember-cli-hyde/blob/master/addon/components/markdown-section.js#L22-L42
   - I'm hoping to extend this to support a skeletal UI, eg for loading states

### sample code
- Sample input dir: https://github.com/anulman/www.aidans.computer/tree/master/content
- Results in output dir: https://github.com/anulman/www.aidans.computer/tree/gh-pages/hyde
