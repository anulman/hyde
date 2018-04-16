import assert from 'assert';

export default class Model {
  constructor({ id, ext, parent, markdown, yaml, tags, children } = {}) {
    this.id = id;
    this.ext = ext;
    this.parent = parent;
    this.yaml = yaml;
    this.markdown = markdown;
    this.tags = tags instanceof Array ? tags : [];
    this.children = children instanceof Array ? children : [];
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
    assert.ok(value.every((tag) => tag instanceof this.super));

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
    let children = this.parent && this.parent.children;

    if (children instanceof Array && children.includes(this)) {
      children.splice(children.indexOf(this), 1);
    }

    children = value && value.children;

    if (children instanceof Array && !children.includes(this)) {
      children.push(this);
    }

    this._parent = value;
  }
}
