export class BoolExpression {
  constructor(
    public leftOperand: string | BoolExpression,
    public expressionType: BoolExpressionType,
    public rightOperand?: string | BoolExpression,
  ) {}

  clone(): BoolExpression {
    const newLeftOperand = this.leftOperand instanceof BoolExpression
                           ? this.leftOperand.clone()
                           : this.leftOperand;

    const newRightOperand = this.rightOperand instanceof BoolExpression
                         ? this.rightOperand.clone()
                         : this.rightOperand;

    return new BoolExpression(newLeftOperand, this.expressionType, newRightOperand);
  }
}

export class ArithmeticExpression {
  constructor(
    public leftOperand: string | ArithmeticExpression,
    public expressionType: ArithmeticExpressionType,
    public rightOperand?: string | ArithmeticExpression,
  ) {}

  clone(): ArithmeticExpression {
    const newLeftOperand = this.leftOperand instanceof ArithmeticExpression
                           ? this.leftOperand.clone()
                           : this.leftOperand;

    const newRightOperand = this.rightOperand instanceof ArithmeticExpression
                            ? this.rightOperand.clone()
                            : this.rightOperand;

    return new ArithmeticExpression(newLeftOperand, this.expressionType, newRightOperand);
  }
}

export enum BoolExpressionType {
  And = 'And',
  Or = 'Or',
  Not = 'Not',
  Xor = 'Xor',
  Equals = 'Equals',
  NotEquals = 'NotEquals',
  GreaterThan = 'GreaterThan',
  GreaterThanOrEqualTo = 'GreaterThanOrEqualTo',
  LessThan = 'LessThan',
  LessThanOrEqualTo = 'LessThanOrEqualTo'
}

export enum ArithmeticExpressionType {
  Add = 'Add',
  Subtract = 'Subtract',
  Multiply = 'Multiply',
  Divide = 'Divide',
  Modulus = 'Modulus',
  Increment = 'Increment',
  Decrement = 'Decrement'
}

export class AssignExpression {
  constructor(
    public destination: string,
    public assign: string | AssignExpression | BoolExpression,
    public isNew: boolean = false,
    public type?: ValueType,
  ) {}

  clone(): AssignExpression {
    const newAssign = typeof this.assign === 'string'
                      ? this.assign
                      : this.assign.clone();

    return new AssignExpression(this.destination, newAssign, this.isNew, this.type?.clone());
  }
}

export enum DataType {
  Integer = 'Integer',
  Float = 'Float',
  String = 'String',
  Boolean = 'Boolean'
}

export class ValueType {
  constructor(
    public type: DataType,
    public isCollection: boolean = false
  ) {}

  clone() {
    return new ValueType(this.type, this.isCollection);
  }
}
