/**
 * Class specifies location of element in state data tree
 * It allows to send action to many localizations
 */

export enum ELocationKind {
  byName = 'byName',
  byLocation = 'byLocation',
  byContext = 'byContext',
  byPathTree = 'byPathTree',
  byContextInPath = 'byContextInPath'
}

export class RangeLocations {
  get locationKind(): ELocationKind {
    return this._locationKind;
  }
  private _locationKind: ELocationKind;
  private _context: string;
  private _name: string;
  private _path: string;
  private _searchInTree: boolean;
  private constructor(context: string, name: string, path: string, searchInTree: boolean) {
    this._context = context;
    this._name = name;
    this._path = path;
    this._searchInTree = searchInTree;
    this._locationKind = this.validate();
  }

  get context(): string {
    return this._context;
  }
  set context(context) {
    this._context = context;
    this._locationKind = this.validate();
  }
  get name(): string {
    return this._name;
  }
  set name(name) {
    this._name = name;
    this._locationKind = this.validate();
  }
  get path(): string {
    return this._path;
  }
  set path(path) {
    this._path = path;
    this._locationKind = this.validate();
  }
  get searchInTree(): boolean {
    return this._searchInTree;
  }
  set searchInTree(searchInTree) {
    this._searchInTree = searchInTree;
    this._locationKind = this.validate();
  }

  static filterByName(name: string): RangeLocations {
    return new RangeLocations('', name, '', false);
  }
  static filterByPath(path: string, name?: string): RangeLocations {
    const loc: string = name === undefined ? path : `${path}.${name}`;
    return new RangeLocations('', '', loc, false);
  }
  static filterByContext(context: string, name: string): RangeLocations {
    return new RangeLocations(context, name, '', false);
  }
  static filterByPathTree(path: string, name: string): RangeLocations {
    return new RangeLocations('', name, path, true);
  }
  static filterByAll(context: string, path: string, name: string): RangeLocations {
    return new RangeLocations(context, name, path, true);
  }
  copy() {
    return new RangeLocations(this._context, this._name, this._path, this._searchInTree);
  }
  getParentName(): string {
    this.checkLocation();
    const tab: Array<string> = this._path.split('.');
    return tab.pop()!;
  }
  getParentPath(): string {
    this.checkLocation();
    const tab: Array<string> = this._path.split('.');
    tab.pop();
    return tab.join('.');
  }
  getParentLocation(): RangeLocations {
    return RangeLocations.filterByPath(this.getParentPath());
  }
  getChildLocation(childName: string): RangeLocations {
    this.checkLocation();
    return RangeLocations.filterByPath(`${this._path}.${childName}`);
  }

  private checkLocation() {
    if (this.locationKind === ELocationKind.byLocation)
      throw new Error(`You can run function setLocationToParent only with LocationKind === byLocation`);
  }

  private validate(): ELocationKind {
    if (this._name !== '' && this._path === '' && this._context === '' && this._searchInTree === false)
      return ELocationKind.byName;
    if (this._name === '' && this._path !== '' && this._context === '' && this._searchInTree === false)
      return ELocationKind.byLocation;
    if (this._name !== '' && this._path === '' && this._context !== '' && this._searchInTree === false)
      return ELocationKind.byContext;
    if (this._name !== '' && this._path !== '' && this._context === '' && this._searchInTree === true)
      return ELocationKind.byPathTree;
    if (this._name !== '' && this._path !== '' && this._context !== '' && this._searchInTree === true)
      return ELocationKind.byContextInPath;
    throw new Error('Wrong combination of serarch parametres in RangeLocations');
  }
}
