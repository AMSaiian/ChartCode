import superjson from 'superjson';

import {
  AssignElement,
  ConditionElement,
  ForLoopElement,
  InputElement,
  OutputElement,
  ProcedureElement,
  TerminalElement,
  WhileLoopElement
} from '../models/element/element.model';

import { Scope } from '../models/scope/scope.model'
import { Procedure } from '../models/scope/procedure/procedure.model';

import {
  ArithmeticExpression,
  AssignExpression,
  BoolExpression,
  ValueType,
} from '../models/expression/expression.model';

superjson.registerClass(AssignElement, 'AssignElement');
superjson.registerClass(ConditionElement, 'ConditionElement');
superjson.registerClass(ForLoopElement, 'ForLoopElement');
superjson.registerClass(InputElement, 'InputElement');
superjson.registerClass(OutputElement, 'OutputElement');
superjson.registerClass(ProcedureElement, 'ProcedureElement');
superjson.registerClass(TerminalElement, 'TerminalElement');
superjson.registerClass(WhileLoopElement, 'WhileLoopElement');

superjson.registerClass(Scope, 'Scope');
superjson.registerClass(Procedure, 'Procedure');

superjson.registerClass(AssignExpression, 'AssignExpression');
superjson.registerClass(ArithmeticExpression, 'ArithmeticExpression');
superjson.registerClass(BoolExpression, 'BoolExpression');
superjson.registerClass(ValueType, 'ValueType');

const serializer = superjson;

export default serializer;
