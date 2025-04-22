import { AssignExpression, BoolExpression } from '../expression/expression.model';
import { ILoop } from '../scope/loop/loop.interface';
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

  abstract clone(): BaseElement;

  protected copyBaseTo<T extends BaseElement>(target: T): T {
    target.id = this.id;
    target.previousId = [...this.previousId];
    target.nextId = this.nextId;

    return target;
  }
}

export class InputElement extends BaseElement {
  constructor(
    public destination: string,
    public isOutside: boolean = true
  ) {
    super();
  }

  override clone(): InputElement {
    const element = new InputElement(this.destination, this.isOutside);

    return this.copyBaseTo(element);
  }
}

export class OutputElement extends BaseElement {
  constructor(
    public source: string,
    public isOutside: boolean = true
  ) {
    super();
  }

  override clone(): OutputElement {
    const element = new OutputElement(this.source, this.isOutside);

    return this.copyBaseTo(element);
  }
}

export class TerminalElement extends BaseElement {
  constructor(
    public isStart: boolean
  ) {
    super();
  }

  override clone(): TerminalElement {
    const element = new TerminalElement(this.isStart);

    return this.copyBaseTo(element);
  }
}

export class AssignElement extends BaseElement {
  constructor(
    public expression: AssignExpression
  ) {
    super();
  }

  override clone(): AssignElement {
    const element = new AssignElement(this.expression.clone());

    return this.copyBaseTo(element);
  }
}

export class LoopElement extends BaseElement {
  constructor(
    public loop: ILoop
  ) {
    super();
  }

  override clone(): LoopElement {
    const element = new LoopElement(this.loop.clone());

    return this.copyBaseTo(element);
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

  override clone(): ConditionElement {
    const element = new ConditionElement(
      this.positiveWay.clone(),
      this.negativeWay.clone(),
      this.conditionExpression.clone()
    );

    return this.copyBaseTo(element);
  }
}
