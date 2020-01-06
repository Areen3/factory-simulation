import { ActionKind } from '../common/declaration';
import { SingleLocation } from '../common';

/** Base abstract class for Action which lets developer to set Location and kind of action */
export abstract class NgxsAction {
  location: SingleLocation;
  kind: ActionKind = ActionKind.akCommand;
}
