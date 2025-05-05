import { ArithmeticExpressionMember } from '../../const/field-regex.const';

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

  isValid() {
    return true;
  }
}

export class ArithmeticExpression {
  constructor(
    public leftOperand: string | ArithmeticExpression,
    public expressionType: ArithmeticExpressionType,
    public rightOperand: string | ArithmeticExpression,
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

  isValid(): boolean {
    const left = this.leftOperand instanceof ArithmeticExpression
                 ? this.leftOperand.isValid()
                 : this.leftOperand.match(ArithmeticExpressionMember) !== null;

    const right = this.rightOperand instanceof ArithmeticExpression
                 ? this.rightOperand.isValid()
                 : this.rightOperand.match(ArithmeticExpressionMember) !== null;

    return left && right;
  }

  toReadable(): string {
    const left = this.leftOperand instanceof ArithmeticExpression
                 ? this.leftOperand.toReadable()
                 : this.leftOperand;

    const right = this.rightOperand instanceof ArithmeticExpression
                 ? this.rightOperand.toReadable()
                 : this.rightOperand;

    return `(${left} ${ArithmeticExpressionTypeMap[this.expressionType]} ${right})`;
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
}

export const ArithmeticExpressionTypeMap: Record<ArithmeticExpressionType, string> = {
  Add: '+',
  Subtract: '-',
  Multiply: '*',
  Divide: '/',
  Modulus: '%'
}

export const ArithmeticExpressionTypeList: {
  type: ArithmeticExpressionType;
  symbol: string
}[] = Object.entries(ArithmeticExpressionTypeMap)
          .map(x => ({type: x[0] as ArithmeticExpressionType, symbol: x[1]}))

export class AssignExpression {
  constructor(
    public destination: string,
    public assign: string | ArithmeticExpression | BoolExpression,
    public isNew: boolean = false,
    public type: ValueType,
  ) {}

  clone(): AssignExpression {
    const newAssign = typeof this.assign === 'string'
                      ? this.assign
                      : this.assign.clone();

    return new AssignExpression(this.destination, newAssign, this.isNew, this.type.clone());
  }
}

export enum DataType {
  Integer = 'Integer',
  Float = 'Float',
  String = 'String',
  Boolean = 'Boolean'
}

export const DataTypeList: DataType[] = Object.values(DataType);

export class ValueType {
  constructor(
    public type: DataType,
    public isCollection: boolean = false,
    public length?: number
  ) {}

  clone() {
    return new ValueType(this.type, this.isCollection, this.length);
  }
}

export const isNestedExpression =
  (v: BoolExpression | ArithmeticExpression | string) => typeof v !== 'string';
