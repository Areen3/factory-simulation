import { State, Store, Selector } from '@ngxs/store';

import * as fromModel from '../../model';

export const initialBaseStateDataModel: fromModel.IBaseState = {};

// REVIEW ngxs example base state that You can inherited
@State<fromModel.IBaseState>({
  name: 'BaseState',
  defaults: initialBaseStateDataModel
})
export class BaseState<T extends fromModel.IBaseState = fromModel.IBaseState> {
  constructor(protected store: Store) {}
  @Selector()
  static state$<T>(state: T): T {
    return state;
  }
  emptyFunction(data: T): void {
    console.log(data);
  }
}
