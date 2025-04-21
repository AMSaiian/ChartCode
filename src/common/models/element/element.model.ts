import { AssignExpression, BoolExpression } from '../expression/expression.model';
import { BaseLoop } from '../scope/loop/loop.model';
import { IScope } from '../scope/scope.interface';
import { IElement } from './element.interface';

export abstract class BaseElement implements IElement {
  id: string;
  previousId: string[];
  nextId: string | null;

  constructor() {
    this.id = crypto.randomUUID();
    this.previousId = [];
    this.nextId = null;
  }
}

export class InputElement extends BaseElement {
  constructor(
    public destination: string,
    public isOutside: boolean = true
  ) {
    super();
  }
}

export class OutputElement extends BaseElement {
  constructor(
    public source: string,
    public isOutside: boolean = true
  ) {
    super();
  }
}

export class TerminalElement extends BaseElement {
  constructor(
    public isStart: boolean
  ) {
    super();
  }
}

export class AssignElement extends BaseElement {
  constructor(
    public expression: AssignExpression
  ) {
    super();
  }
}

export class LoopElement extends BaseElement {
  constructor(
    public loop: BaseLoop
  ) {
    super();
  }
}

export class ConditionElement extends BaseElement {
  constructor(
    public positiveWay: IScope,
    public negativeWay: IScope,
    public conditionExpression: BoolExpression
  ) {
    super();
  }
}
