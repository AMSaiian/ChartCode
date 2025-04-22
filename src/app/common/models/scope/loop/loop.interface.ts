import { Clonable } from '../../clonable';
import { BoolExpression } from '../../expression/expression.model';

export interface ILoop extends Clonable<ILoop> {
  checkExpression: BoolExpression;
}
