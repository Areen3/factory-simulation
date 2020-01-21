import { Type } from '@angular/core';

import { EProductKind } from '../../model/state-model';
import { BaseLineProductionState } from './base-line.state';

const LINE_PRODUCTION_CLASS_REGISTRY = new Map<EProductKind, Type<BaseLineProductionState>>();
// REVIEW angular example of decorator
export function registerLineProduction(productKind: EProductKind): Function {
  return function(target: Type<BaseLineProductionState>): void {
    const exist: Type<BaseLineProductionState> | undefined = getLineProduction(productKind, false);
    if (exist !== undefined) throw new Error(`You try add second time these productKind ${productKind}`);
    LINE_PRODUCTION_CLASS_REGISTRY.set(productKind, target);
  };
}

export function getLineProduction(productKind: EProductKind, checkExist: boolean = true): Type<BaseLineProductionState> {
  const classType: Type<BaseLineProductionState> | undefined = LINE_PRODUCTION_CLASS_REGISTRY.get(productKind);
  if (checkExist && classType === undefined) {
    throw new Error(`Not registerd line production class for class name ${productKind} user decorator @registerLineProduction`);
  }
  return classType!;
}
