import { AssignExpression, BoolExpression } from '../../expression/expression.model';
import { Scope } from '../scope.model';
import { ILoop } from './loop.interface';

export class DoLoop extends Scope implements ILoop {
  constructor(public checkExpression: BoolExpression) {
    super();
  }

  override clone(): DoLoop {
    const loop = new DoLoop(this.checkExpression.clone());

    return this.copyBaseTo(loop);
  }
}

export class ForLoop extends Scope implements ILoop {
  constructor(
    public checkExpression: BoolExpression,
    public accumulator?: AssignExpression,
    public increment?: AssignExpression,
  ) {
    super();
  }

  override clone(): ForLoop {
    const loop = new ForLoop(
      this.checkExpression.clone(),
      this.accumulator?.clone(),
      this.increment?.clone()
    );

    return this.copyBaseTo(loop);
  }
}

export class WhileLoop extends Scope implements ILoop {
  constructor(public checkExpression: BoolExpression) {
    super();
  }

  override clone(): WhileLoop {
    const loop = new WhileLoop(this.checkExpression.clone());

    return this.copyBaseTo(loop);
  }
}
