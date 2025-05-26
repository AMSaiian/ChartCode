import { getRegexByValueType, IdentifierOrArrayAccessOrLiteral } from '../../const/field-regex.const';


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

  isValid(): boolean {
    const left = this.leftOperand instanceof BoolExpression
                 ? this.leftOperand.isValid()
                 : RegExp(IdentifierOrArrayAccessOrLiteral).exec(this.leftOperand) !== null;

    const right = this.rightOperand instanceof BoolExpression
                  ? this.rightOperand.isValid()
                  : (this.expressionType === BoolExpressionType.Not && !this.rightOperand) ||
                    (!!this.rightOperand && RegExp(IdentifierOrArrayAccessOrLiteral).exec(this.rightOperand) !== null);

    return left && right;
  }

  toReadable(isRoot = false): string {
    const left = this.leftOperand instanceof BoolExpression
                 ? this.leftOperand.toReadable()
                 : this.leftOperand;

    const right = this.rightOperand instanceof BoolExpression
                  ? this.rightOperand.toReadable()
                  : this.rightOperand;

    const readableString = this.expressionType === BoolExpressionType.Not
                           ? `${isRoot ? '' : '('}!${left}${isRoot ? '' : ')'}`
                           : `${isRoot ? '' : '('}${left} ${BoolExpressionTypeMap[this.expressionType]} ${right}${isRoot ? '' : ')'}`;

    return readableString;
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
                 : RegExp(getRegexByValueType(DataType.Float, true)).exec(this.leftOperand) !== null;

    const right = this.rightOperand instanceof ArithmeticExpression
                 ? this.rightOperand.isValid()
                 : RegExp(getRegexByValueType(DataType.Float, true)).exec(this.rightOperand) !== null;

    return left && right;
  }

  toReadable(isRoot = false): string {
    const left = this.leftOperand instanceof ArithmeticExpression
                 ? this.leftOperand.toReadable()
                 : this.leftOperand;

    const right = this.rightOperand instanceof ArithmeticExpression
                 ? this.rightOperand.toReadable()
                 : this.rightOperand;

    return `${isRoot ? '' : '('}${left} ${ArithmeticExpressionTypeMap[this.expressionType]} ${right}${isRoot ? '' : ')'}`;
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

export const BoolExpressionTypeMap: Record<BoolExpressionType, string> = {
  [BoolExpressionType.And]: '&',
  [BoolExpressionType.Or]: '|',
  [BoolExpressionType.Not]: '!',
  [BoolExpressionType.Xor]: '⊕',
  [BoolExpressionType.Equals]: '=',
  [BoolExpressionType.NotEquals]: '!=',
  [BoolExpressionType.GreaterThan]: '>',
  [BoolExpressionType.GreaterThanOrEqualTo]: '>=',
  [BoolExpressionType.LessThan]: '<',
  [BoolExpressionType.LessThanOrEqualTo]: '<='
}

export const BoolExpressionTypeList: {
  type: BoolExpressionType;
  symbol: string
}[] = Object.entries(BoolExpressionTypeMap)
            .map(x => ({type: x[0] as BoolExpressionType, symbol: x[1]}))

export enum ArithmeticExpressionType {
  Add = 'Add',
  Subtract = 'Subtract',
  Multiply = 'Multiply',
  Divide = 'Divide',
  Modulus = 'Modulus',
}

export const ArithmeticExpressionTypeMap: Record<ArithmeticExpressionType, string> = {
  [ArithmeticExpressionType.Add]: '+',
  [ArithmeticExpressionType.Subtract]: '-',
  [ArithmeticExpressionType.Multiply]: '*',
  [ArithmeticExpressionType.Divide]: '/',
  [ArithmeticExpressionType.Modulus]: '%'
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
    public isNew = false,
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
    public isCollection = false,
    public length?: string
  ) {}

  clone() {
    return new ValueType(this.type, this.isCollection, this.length);
  }
}

export const isNestedExpression =
  (v: BoolExpression | ArithmeticExpression | string | undefined) =>
    v instanceof BoolExpression || v instanceof ArithmeticExpression;
