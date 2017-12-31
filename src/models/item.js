import assert from 'assert';

import Collection from './collection';

export default class Item {
  constructor({ id, parent, markdown, yaml, tags } = {}) {
    this.id = id;
    this.parent = parent;
    this.yaml = yaml;
    this.markdown = markdown;
    this.tags = tags instanceof Array ? tags : [];
  }

  get tags() {
    let tags = this._tags;

    if (!(tags instanceof Array)) {
      tags = [];
      this.tags = tags;
    }

    return tags;
  }

  set tags(value = []) {
    assert.ok(value instanceof Array);
    assert.ok(value.every((tag) => tag instanceof Collection));

    for (let tag of this._tags || []) {
      let index = tag.items.indexOf(this);

      if (index > -1) {
        tag.items.splice(index, 1);
      }
    }

    for (let tag of value) {
      if (!tag.items.includes(this)) {
        tag.items.push(this);
      }
    }

    this._tags = value;
  }

  get parent() {
    return this._parent;
  }

  set parent(value = null) {
    let items = this.parent && this.parent.items;

    if (items instanceof Array && items.includes(this)) {
      items.splice(items.indexOf(this), 1);
    }

    items = value && value.items;

    if (items instanceof Array && !items.includes(this)) {
      items.push(this);
    }

    this._parent = value;
  }
}
