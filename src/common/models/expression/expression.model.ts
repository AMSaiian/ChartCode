export class BoolExpression {
  constructor(
    public leftOperand: string | BoolExpression,
    public expressionType: BoolExpressionType,
    public rightOperand?: string | BoolExpression,
  ) {}
}

export class ArithmeticExpression {
  constructor(
    public leftOperand: string | ArithmeticExpression,
    public expressionType: ArithmeticExpressionType,
    public rightOperand?: string | ArithmeticExpression,
  ) {}
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
}
