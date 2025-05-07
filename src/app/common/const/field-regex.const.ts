import { DataType } from '../models/expression/expression.model';

export const Identifier = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

export const IdentifierOrArrayAccess =
  /^(?:[a-zA-Z_][a-zA-Z0-9_]*)(?:\[(?:[a-zA-Z_][a-zA-Z0-9_]*|\d+)\])*$/;

export const IdentifierOrArrayAccessOrLiteral =
  /^(?:[a-zA-Z_][a-zA-Z0-9_]*(?:\[(?:[a-zA-Z_][a-zA-Z0-9_]*|\d+)\])*|"[^"\\]*(?:\\.[^"\\]*)*"|-?\d+(?:\.\d+)?|-?\.\d+)$/;

export const IdentifierArrayOrUnsignedFloatLiteral =
  /^(?:[a-zA-Z_][a-zA-Z0-9_]*(?:\[(?:[a-zA-Z_][a-zA-Z0-9_]*|\d+)\])*|\d+\.\d+|\d+)$/;

export const IdentifierArrayOrFloatLiteral =
  /^(?:[a-zA-Z_][a-zA-Z0-9_]*(?:\[(?:[a-zA-Z_][a-zA-Z0-9_]*|\d+)\])*|-?\d+\.\d+|-?\d+)$/;

export const IdentifierArrayOrBooleanLiteral =
  /^(?:[a-zA-Z_][a-zA-Z0-9_]*(?:\[(?:[a-zA-Z_][a-zA-Z0-9_]*|\d+)\])*|true|false)$/;

export const IdentifierArrayOrUnsignedIntegerLiteral =
  /^(?:[a-zA-Z_][a-zA-Z0-9_]*(?:\[(?:[a-zA-Z_][a-zA-Z0-9_]*|\d+)\])*|\d+)$/;

export const IdentifierArrayOrIntegerLiteral =
  /^(?:[a-zA-Z_][a-zA-Z0-9_]*(?:\[(?:[a-zA-Z_][a-zA-Z0-9_]*|\d+)\])*|-?\d+)$/;

export const IdentifierArrayOrStringLiteral =
  /^(?:[a-zA-Z_][a-zA-Z0-9_]*(?:\[(?:[a-zA-Z_][a-zA-Z0-9_]*|\d+)\])*|"[^"\\]*(?:\\.[^"\\]*)*")$/;

export const getRegexByValueType = (type: DataType, unsigned: boolean = false): RegExp => {
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
