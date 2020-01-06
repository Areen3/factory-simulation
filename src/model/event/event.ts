import { EEventType } from './enum';

export class BaseEvent {
  type: EEventType;
}

export class FactoryRunEvent extends BaseEvent {
  constructor() {
    super();
    this.type = EEventType.factoryStart;
  }
}
