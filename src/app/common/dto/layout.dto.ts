import { IElement } from '../models/element/element.interface';
import {
  AssignElement,
  ConditionElement, ForLoopElement,
  InputElement,
  OutputElement,
  ProcedureElement, TerminalElement, WhileLoopElement,
} from '../models/element/element.model';

export interface NodeDto {
  element: IElement;
  x: number;
  y: number;
  width: number;
  height: number;
  body?: BranchDto;
  left?: BranchDto;
  right?: BranchDto;
  // inPort: Point;
  // outPorts: Record<string, Point>;
}

export interface BranchDto {
  x: number;
  y: number;
  width: number;
  height: number;
  nodes: NodeDto[];
}

export interface Margin {
  top: number,
  bottom: number,
  left: number,
  right: number
}

export const MARGIN_MAP = new Map<Function, Margin>([
  [ProcedureElement, { top: 40, bottom: 50, left: 10, right: 10 }],
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
  return MARGIN_MAP.get(node.constructor as Function) ?? DEFAULT_MARGINS;
}

export const DEFAULT_WIDTH = 120;
export const DEFAULT_HEIGHT = 60;
export const MIN_BRANCH_WIDTH = 180;
export const MIN_BRANCH_HEIGHT = 16;

export interface Point {
  x: number;
  y: number;
}

export interface EdgeDto {
  fromId: string | null;
  toId: string | null;
  isSupport: boolean;
  scopeId?: string;
  path: string;
}

export const DEFAULT_LINE_WIDTH = 1;
export const DEFAULT_ARROW_SIZE = 6;
export const DEFAULT_LINE_TOP_MARGIN = 1;
export const DEFAULT_LINE_BOTTOM_MARGIN = 2;
