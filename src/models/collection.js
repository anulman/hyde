export default class Collection {
  constructor({ id, parent, items, collections } = {}) {
    this.id = id;
    this.parent = parent;
    this.collections = collections instanceof Array ? collections : [];
    this.items = items instanceof Array ? items : [];
  }

  get parent() {
    return this._parent;
  }

  set parent(value = null) {
    let collections = this.parent && this.parent.collections;

    if (collections instanceof Array && collections.includes(this)) {
      collections.splice(collections.indexOf(this), 1);
    }

    collections = value && value.collections;

    if (collections instanceof Array && !collections.includes(this)) {
      collections.push(this);
    }

    this._parent = value;
  }
}
