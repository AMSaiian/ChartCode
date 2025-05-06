import {
  AssignExpression,
  BoolExpression,
  BoolExpressionType,
  DataType,
  ValueType,
} from '../expression/expression.model';
import { Procedure } from '../scope/procedure/procedure.model';
import { IElement } from './element.interface';

export abstract class BaseElement implements IElement {
  id: string = '';
  previousId: string[];
  nextId: string | null;
  inScopeId: string | null;

  constructor() {
    this.previousId = [];
    this.nextId = null;
    this.inScopeId = null;
  }

  abstract clone(): BaseElement;

  protected copyBaseTo<T extends BaseElement>(target: T): T {
    target.id = this.id;
    target.previousId = [...this.previousId];
    target.nextId = this.nextId;
    target.inScopeId = this.inScopeId;

    return target;
  }
}

export class ProcedureElement extends BaseElement {
  static readonly type = 'procedure';
  static getDefault = () => this.DEFAULT.clone();
  private static readonly DEFAULT = new Procedure('Main', true);

  constructor(public scopeId: string) {
    super();
  }

  override clone(): ProcedureElement {
    const element = new ProcedureElement(this.scopeId);

    return this.copyBaseTo(element);
  }
}

export class InputElement extends BaseElement {
  static readonly type = 'input';
  static getDefault = () => this.DEFAULT.clone();
  private static readonly DEFAULT = new InputElement('x');

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
  static readonly type = 'output';
  static getDefault = () => this.DEFAULT.clone();
  private static readonly DEFAULT = new OutputElement('x');

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
  static readonly type = 'terminal';
  static getDefault = () => this.DEFAULT.clone();
  private static readonly DEFAULT = new TerminalElement(true);

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
  static readonly type = 'assign';
  static getDefault = () => this.DEFAULT.clone();
  private static readonly DEFAULT = new AssignElement(
    new AssignExpression(
      'x',
      '0',
      true,
      new ValueType(DataType.Integer, false)
    )
  );

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
  static readonly type = 'for-loop';
  static getDefault = () => this.DEFAULT.clone();
  private static readonly DEFAULT = new ForLoopElement(
    new BoolExpression('i', BoolExpressionType.LessThan, '10'),
    new AssignExpression(
      'i',
      '0',
      true,
      new ValueType(DataType.Integer, false)
    )
  );

  constructor(
    public checkExpression: BoolExpression,
    public accumulator: AssignExpression,
    public isIncrement: boolean = true,
    public scopeId: string = ''
  ) {
    super();
  }

  override clone(): ForLoopElement {
    const element = new ForLoopElement(
      this.checkExpression.clone(),
      this.accumulator.clone(),
      this.isIncrement,
      this.scopeId
    );

    return this.copyBaseTo(element);
  }
}

export class WhileLoopElement extends BaseElement {
  static readonly type = 'while-loop';
  static getDefault = () => this.DEFAULT.clone();
  private static readonly DEFAULT = new WhileLoopElement(
    new BoolExpression('true', BoolExpressionType.Equals, 'true')
  );

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
  static readonly type = 'condition';
  static getDefault = () => this.DEFAULT.clone();
  private static readonly DEFAULT = new ConditionElement(
    new BoolExpression('true', BoolExpressionType.Equals, 'true')
  );

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
