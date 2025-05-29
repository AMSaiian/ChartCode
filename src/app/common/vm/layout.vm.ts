import { IElement } from '../models/element/element.interface';
import {
  AssignElement,
  ConditionElement, ForLoopElement,
  InputElement,
  OutputElement,
  ProcedureElement, TerminalElement, WhileLoopElement,
} from '../models/element/element.model';
import { IScope } from '../models/scope/scope.interface';

export interface NodeVm {
  element: IElement;
  x: number;
  y: number;
  width: number;
  height: number;
  body?: BranchVm;
  left?: BranchVm;
  right?: BranchVm;
}

export interface BranchVm {
  scope: IScope;
  x: number;
  y: number;
  width: number;
  height: number;
  nodes: NodeVm[];
}

export interface Margin {
  top: number,
  bottom: number,
  left: number,
  right: number
}

export const MARGIN_MAP = new Map<Function, Margin>([
  [ProcedureElement, { top: 40, bottom: 50, left: -60, right: 60 }],
  [AssignElement, { top: 16, bottom: 10, left: 10, right: 10 }],
  [InputElement, { top: 16, bottom: 10, left: 10, right: 10 }],
  [OutputElement, { top: 16, bottom: 10, left: 10, right: 10 }],
  [ConditionElement, { top: 92, bottom: 16, left: 10, right: 10 }],
  [WhileLoopElement, { top: 108, bottom: 32, left: 10, right: 10 }],
  [ForLoopElement, { top: 108, bottom: 32, left: 10, right: 10 }],
  [TerminalElement, { top: 16, bottom: 10, left: 10, right: 10 }],
]);

const DEFAULT_MARGINS: Margin = { top: 60, bottom: 60, left: 10, right: 10 };

export function getMargins(node: IElement): Margin {
  return MARGIN_MAP.get(node.constructor) ?? DEFAULT_MARGINS;
}

export const DEFAULT_WIDTH = 120;
export const DEFAULT_HEIGHT = 60;
export const MIN_BRANCH_WIDTH = 180;
export const MIN_BRANCH_HEIGHT = 16;

export interface Point {
  x: number;
  y: number;
}

export interface EdgeVm {
  fromId: string | null;
  toId: string | null;
  isSupport: boolean;
  path: string;
}

export const DEFAULT_LINE_WIDTH = 1;
export const DEFAULT_ARROW_SIZE = 6;
export const DEFAULT_LINE_TOP_MARGIN = 1;
export const DEFAULT_LINE_BOTTOM_MARGIN = 2;
export const DEFAULT_INSERT_RADIUS = 4;

export interface InsertionVm {
  x: number;
  y: number;
  scopeId: string;
  fromId: string | null;
}
