import { AssignExpression, BoolExpression } from '../expression/expression.model';
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

export class ProcedureElement extends BaseElement {
  constructor(public scopeId: string) {
    super();
  }

  override clone(): ProcedureElement {
    const element = new ProcedureElement(this.scopeId);

    return this.copyBaseTo(element);
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

export class ForLoopElement extends BaseElement {
  constructor(
    public checkExpression: BoolExpression,
    public accumulator?: AssignExpression,
    public increment?: AssignExpression,
    public scopeId: string = ''
  ) {
    super();
  }

  override clone(): ForLoopElement {
    const element = new ForLoopElement(
      this.checkExpression.clone(),
      this.accumulator?.clone(),
      this.increment?.clone(),
      this.scopeId
    );

    return this.copyBaseTo(element);
  }
}

export class DoLoopElement extends BaseElement {
  constructor(
    public checkExpression: BoolExpression,
    public scopeId: string = ''
  ) {
    super();
  }

  override clone(): DoLoopElement {
    const element = new DoLoopElement(
      this.checkExpression.clone(),
      this.scopeId
    );

    return this.copyBaseTo(element);
  }
}

export class WhileLoopElement extends BaseElement {
  constructor(
    public checkExpression: BoolExpression,
    public scopeId: string = ''
  ) {
    super();
  }

  override clone(): WhileLoopElement {
    const element = new WhileLoopElement(
      this.checkExpression.clone(),
      this.scopeId,
    );

    return this.copyBaseTo(element);
  }
}

export class ConditionElement extends BaseElement {
  constructor(
    public conditionExpression: BoolExpression,
    public positiveWayId: string = '',
    public negativeWayId: string = '',
  ) {
    super();
  }

  override clone(): ConditionElement {
    const element = new ConditionElement(
      this.conditionExpression.clone(),
      this.positiveWayId,
      this.negativeWayId
    );

    return this.copyBaseTo(element);
  }
}
