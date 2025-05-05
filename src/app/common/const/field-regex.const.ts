export const IdentifierOrArrayAccess =
  /^(?:[a-zA-Z_$][a-zA-Z0-9_$]*)(?:\[(?:[a-zA-Z_$][a-zA-Z0-9_$]*|\d+)\])*$/;

export const IdentifierOrArrayAccessOrLiteral =
  /^(?:[a-zA-Z_$][a-zA-Z0-9_$]*(?:\[(?:[a-zA-Z_$][a-zA-Z0-9_$]*|\d+)\])*|"[^"\\]*(?:\\.[^"\\]*)*"|-?\d+(?:\.\d+)?|-?\.\d+)$/;


export const ArithmeticExpressionMember =
  /^(?:[a-zA-Z_$][a-zA-Z0-9_$]*(?:\[(?:[a-zA-Z_$][a-zA-Z0-9_$]*|\d+)\])*|\d+(?:\.\d+)?|\.\d+)$/;
