/**
 * Class specifies location of element in state data tree
 * It allows to point specific location and do something with it
 */

export class SingleLocation {
  private _path: string;
  constructor(path: string) {
    this._path = this.validate(path);
  }
  get path(): string {
    return this._path;
  }

  static getLocation(path: string, childName?: string): SingleLocation {
    const current = childName === undefined ? path : path + '.' + childName;
    return new SingleLocation(current);
  }
  getParentName(): string {
    const tab: Array<string> = this._path.split('.');
    return tab.pop()!;
  }
  getParentPath(): SingleLocation {
    const tab: Array<string> = this._path.split('.');
    tab.pop();
    return SingleLocation.getLocation(tab.join('.'));
  }
  getChildLocation(childName: string): SingleLocation {
    return SingleLocation.getLocation(`${this._path}.${childName}`);
  }
  getLocation(): SingleLocation {
    return SingleLocation.getLocation(this._path);
  }

  private validate(p: string): string {
    return p;
  }
}
