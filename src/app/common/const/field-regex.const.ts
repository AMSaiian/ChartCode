import { DataType } from '../models/expression/expression.model';

export const Identifier = /^[a-zA-Z_]\w*$/;

export const IdentifierOrArrayAccess =
  /^[a-zA-Z_]\w*(?:\[(?:[a-zA-Z_]\w*|\d+)])*$/;

export const IdentifierOrArrayAccessOrLiteral =
  /^(?:[a-zA-Z_]\w*(?:\[(?:[a-zA-Z_]\w*|\d+)])*|"[^"\\]*(?:\\.[^"\\]*)*"|-?\d+(?:\.\d+)?|-?\.\d+)$/;

export const IdentifierArrayOrUnsignedFloatLiteral =
  /^(?:[a-zA-Z_]\w*(?:\[(?:[a-zA-Z_]\w*|\d+)])*|\d+\.\d+|\d+)$/;

export const IdentifierArrayOrFloatLiteral =
  /^(?:[a-zA-Z_]\w*(?:\[(?:[a-zA-Z_]\w*|\d+)])*|-?\d+\.\d+|-?\d+)$/;

export const IdentifierArrayOrBooleanLiteral =
  /^(?:[a-zA-Z_]\w*(?:\[(?:[a-zA-Z_]\w*|\d+)])*|true|false)$/;

export const IdentifierArrayOrUnsignedIntegerLiteral =
  /^(?:[a-zA-Z_]\w*(?:\[(?:[a-zA-Z_]\w*|\d+)])*|\d+)$/;

export const IdentifierArrayOrIntegerLiteral =
  /^(?:[a-zA-Z_]\w*(?:\[(?:[a-zA-Z_]\w*|\d+)])*|-?\d+)$/;

export const IdentifierArrayOrStringLiteral =
  /^(?:[a-zA-Z_]\w*(?:\[(?:[a-zA-Z_]\w*|\d+)])*|"[^"\\]*(?:\\.[^"\\]*)*")$/;

export const getRegexByValueType = (type: DataType, unsigned = false): RegExp => {
  switch (type) {
    case DataType.Integer:
      return unsigned ? IdentifierArrayOrUnsignedIntegerLiteral : IdentifierArrayOrIntegerLiteral;
    case DataType.Float:
      return unsigned ? IdentifierArrayOrUnsignedFloatLiteral : IdentifierArrayOrFloatLiteral;
    case DataType.Boolean:
      return IdentifierArrayOrBooleanLiteral;
    case DataType.String:
      return IdentifierArrayOrStringLiteral;
  }
}
