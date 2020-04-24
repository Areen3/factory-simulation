import {
  getStoreMetadata,
  MetaDataModel,
  StateClassInternal,
  StatesByName,
  MappedStore,
  getSelectorMetadata,
  SelectorMetaDataModel
} from '../internal/internals';
import {
  CONFIG_MESSAGES as MESSAGES,
  VALIDATION_CODE as CODE
} from '../configs/messages.config';

export abstract class StoreValidators {
  public static stateNameRegex: RegExp = new RegExp('^[a-zA-Z0-9_]+$');

  public static stateNameErrorMessage(name: string) {
    return MESSAGES[CODE.STATE_NAME](name);
  }

  public static checkCorrectStateName(name: string | null) {
    if (!name) {
      throw new Error(MESSAGES[CODE.STATE_NAME_PROPERTY]());
    }

    if (!this.stateNameRegex.test(name)) {
      throw new Error(this.stateNameErrorMessage(name));
    }
  }

  public static checkStateNameIsUnique(
    state: StateClassInternal,
    statesByName: StatesByName
  ): string {
    const meta: MetaDataModel = this.getValidStateMeta(state);
    const stateName: string = meta!.name as string;
    const existingState = statesByName[stateName];
    if (existingState && existingState !== state) {
      throw new Error(MESSAGES[CODE.STATE_UNIQUE](stateName, state.name, existingState.name));
    }
    return stateName;
  }

  public static getValidStateMeta(state: StateClassInternal): MetaDataModel {
    const meta: MetaDataModel = getStoreMetadata(state);
    if (!meta) {
      throw new Error(MESSAGES[CODE.STATE_DECORATOR]());
    }

    return meta;
  }
  public static getStateFromMetaStore(states: MappedStore[], path: string): MappedStore {
    const stateMap: MappedStore | undefined = states.find(item => item.path === path);
    if (!stateMap) {
      throw new Error(MESSAGES[CODE.STATE_NOT_FOUND](path));
    }
    return stateMap;
  }
  public static getValidSelectorMeta(selector: any): SelectorMetaDataModel {
    const meta: SelectorMetaDataModel = getSelectorMetadata(selector);
    if (!meta) {
      throw new Error(MESSAGES[CODE.MISSING_SELECTOR_DECORATOR](selector.name));
    }

    return meta;
  }
  public static checkStateExists(state: any, path: string): void {
    if (!state) {
      throw new Error(MESSAGES[CODE.STATE_NOT_FOUND](path));
    }
  }
}
