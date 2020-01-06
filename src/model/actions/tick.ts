import { ActionKind } from '@ngxs/store';

import { TTick } from '../type';
import { BaseAction, BaseActionWithPayload } from './base';

export namespace TickAction {
  enum Types {
    startFactory = 'cmd [Tick] start factory',
    pauseFactory = 'cmd [Tick] pause factory',
    bankrupt = 'cmd [Tick] bankrupt',
    newBuisenssFactory = 'cmd [Tick] newBuisness factory',
    changeSpeed = 'cmd [Tick] change speed',
    tick = 'event [Tick] tick was send'
  }

  export class Start extends BaseAction {
    static type: Types = Types.startFactory;
  }
  export class Pause extends BaseAction {
    static type: Types = Types.pauseFactory;
  }
  export class NewBuisness extends BaseAction {
    static type: Types = Types.newBuisenssFactory;
  }
  export class Bankrupt extends BaseAction {
    static type: Types = Types.bankrupt;
  }
  export class Tick<T extends TTick = TTick> extends BaseActionWithPayload<T> {
    static type: Types = Types.tick;
    public constructor(data: T) {
      super(data);
      this.kind = ActionKind.akEvent;
    }
  }
  export class ChangeSpeed<T extends TTick = TTick> extends BaseActionWithPayload<T> {
    static type: Types = Types.changeSpeed;
    public constructor(data: T) {
      super(data);
    }
  }
}
