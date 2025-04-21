import { AssignExpression, BoolExpression } from '../../expression/expression.model';
import { Scope } from '../scope.model';
import { ILoop } from './loop.interface';

export abstract class BaseLoop extends Scope implements ILoop {
  constructor(public checkExpression: BoolExpression) {
    super();
  }
}

export class DoLoop extends BaseLoop {
  constructor(checkExpression: BoolExpression) {
    super(checkExpression);
  }
}

export class ForLoop extends BaseLoop {
  constructor(
    checkExpression: BoolExpression,
    public accumulator?: AssignExpression,
    public increment?: AssignExpression,
  ) {
    super(checkExpression);
  }
}

export class WhileLoop extends BaseLoop {
  constructor(checkExpression: BoolExpression) {
    super(checkExpression);
  }
}
