import {
  BranchDto,
  DEFAULT_HEIGHT, DEFAULT_LINE_BOTTOM_MARGIN, DEFAULT_LINE_TOP_MARGIN, DEFAULT_WIDTH, EdgeDto, getMargins,
  MIN_BRANCH_HEIGHT,
  MIN_BRANCH_WIDTH,
  NodeDto, Point,
} from '../dto/layout.dto';
import { IElement } from '../models/element/element.interface';
import {
  ConditionElement,
  ProcedureElement,
} from '../models/element/element.model';
import { AppState } from '../services/app-state.service';
import { isLoop, isScopable } from './element.utils';

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
      x: -Infinity,
      y: -Infinity,
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
    branch.x = x;
    branch.y = y;

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
    node.y = node.y + MIN_BRANCH_HEIGHT;
  }

  return nodes;
}
