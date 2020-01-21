import { NgxsAction } from '@ngxs/store';

// REVIEW ngxs example base action without parameters
export abstract class BaseAction extends NgxsAction {}

// REVIEW ngxs example base action with parameters
export abstract class BaseActionWithPayload<T> extends NgxsAction {
  payload: T;
  protected constructor(data: T) {
    super();
    this.payload = data;
  }
}
