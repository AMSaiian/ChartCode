import { IElement } from '../models/element/element.interface';
import {
  AssignElement,
  ConditionElement, ForLoopElement,
  InputElement,
  OutputElement,
  ProcedureElement, TerminalElement, WhileLoopElement,
} from '../models/element/element.model';
import { AppState } from '../services/app-state.service';
import { isLoop } from './element.utils';

export interface Point {
  x: number;
  y: number;
}

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

const MARGIN_MAP = new Map<Function, Margin>([
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

function getMargins(node: IElement): Margin {
  return MARGIN_MAP.get(node.constructor as Function) ?? DEFAULT_MARGINS;
}

const DEFAULT_WIDTH = 120;
const DEFAULT_HEIGHT = 60;
const MIN_BRANCH_WIDTH = 180;
const MIN_BRANCH_HEIGHT = 16;

export function layoutProcedure(
  procedureId: string,
  snapshot: AppState,
  originX = 0,
  originY = 0,
): NodeDto[] {
  const root: IElement = snapshot.elements[procedureId];
  if (!root) {
    throw new Error(`Root with id ${procedureId} not found`);
  }

  const nodes: NodeDto[] = [];

  function measureScope(id: string): BranchDto {
    const scope = snapshot.scopes[id];

    if (!scope) {
      throw new Error(`Scope with id ${procedureId} not found`);
    }

    const nodes: NodeDto[] = [];
    let maxWidth = 0;
    let totalHeight = 0;

    let elementId = scope.startId;
    while (elementId) {
      const element = measureElement(elementId);
      nodes.push(element);

      maxWidth = Math.max(maxWidth, element.width);
      totalHeight += element.height;

      elementId = snapshot.elements[elementId].nextId;
    }

    return {
      width: maxWidth > MIN_BRANCH_WIDTH ? maxWidth : MIN_BRANCH_WIDTH,
      height: totalHeight > MIN_BRANCH_HEIGHT ? totalHeight : MIN_BRANCH_HEIGHT,
      nodes: nodes
    };
  }

  function measureElement(id: string): NodeDto {
    const element = snapshot.elements[id];

    if (!element) {
      throw new Error(`Element with id ${id} not found`);
    }

    const node: NodeDto = {
      x: -Infinity,
      y: -Infinity,
      element: element,
      height: DEFAULT_HEIGHT,
      width: DEFAULT_WIDTH
    };

    nodes.push(node);

    if (element instanceof ConditionElement) {

      const positiveBranch = measureScope(element.positiveWayId!);
      const negativeBranch = measureScope(element.negativeWayId!);
      node.width = positiveBranch.width + negativeBranch.width;
      node.height = Math.max(positiveBranch.height, negativeBranch.height);
      node.left = positiveBranch;
      node.right = negativeBranch;

    } else if (isLoop(element)) {

      const body = measureScope(element.scopeId);
      node.width = body.width;
      node.height = body.height;
      node.body = body;

    } else if (element instanceof ProcedureElement) {

      const body = measureScope(element.scopeId);
      node.width = body.width;
      node.height = body.height;
      node.body = body;
    }

    const margin = getMargins(node.element);
    node.width += margin.left + margin.right;
    node.height += margin.top + margin.bottom;

    return node;
  }

  function positionBranch(branch: BranchDto, x: number, y: number) {
    let currentY = y;

    for (const node of branch.nodes)  {
      positionNode(node, x + (branch.width - node.width) / 2, currentY);

      currentY += node.height;
    }
  }

  function positionNode(node: NodeDto, x: number, y: number) {
    node.x = x;
    node.y = y;

    const margin = getMargins(node.element!);
    const branchY = y + margin.top;

    if (node.element instanceof ConditionElement) {

      positionBranch(node.left!, x + margin.left, branchY);
      positionBranch(node.right!, x + margin.left + node.left?.width!, branchY);

    } else if (node.element instanceof ProcedureElement
               || isLoop(node.element)
    ) {
      positionBranch(node.body!, x + margin.left, branchY);
    }
  }

  measureElement(procedureId);
  positionNode(nodes[0], originX, originY);

  for (const node of nodes) {
    node.x = node.x + node.width / 2;
    node.y = node.y + 16;
  }

  return nodes;
}
