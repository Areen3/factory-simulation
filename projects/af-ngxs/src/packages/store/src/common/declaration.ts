/** Action kind command must be executed, event may by executed */
export enum ActionKind {
  akCommand = 'Action Command', // always shout be executed
  akEvent = 'Action Event' // event notification, it may not be executed
}

/** If State class implements this interface method ngxsOnDestroy is called when last State class instance is removed from MappedStore */
export interface NgxsOnDestroy {
  ngxsOnDestory(): void;
}

export function onDestroyDefined(instance: any): instance is NgxsOnDestroy {
  return (instance as NgxsOnDestroy).ngxsOnDestory !== undefined;
}
