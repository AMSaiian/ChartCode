import { IElement } from '../models/element/element.interface';
import { ConditionElement, ProcedureElement } from '../models/element/element.model';
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
  children?: NodeDto[];
  left?: NodeDto[];
  right?: NodeDto[];
  // inPort: Point;
  // outPorts: Record<string, Point>;
}

const DEFAULT_WIDTH = 120;
const DEFAULT_HEIGHT = 60;
const HORIZONTAL_SPACING = 15;
const VERTICAL_SPACING = 30;

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

  function measureScope(id: string): { width: number; height: number; nodes: NodeDto[] } {
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
      totalHeight += element.height + VERTICAL_SPACING;

      elementId = snapshot.elements[elementId].nextId;
    }

    return {
      width: maxWidth,
      height: totalHeight,
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

    if (element instanceof ConditionElement) {

      const positiveNode = measureScope(element.positiveWayId!);
      const negativeNode = measureScope(element.negativeWayId!);
      node.width = positiveNode.width + 2 * HORIZONTAL_SPACING + negativeNode.width;
      node.height = DEFAULT_HEIGHT + VERTICAL_SPACING + Math.max(positiveNode.height, negativeNode.height);
      node.left = positiveNode.nodes;
      node.right = negativeNode.nodes;

    } else if (isLoop(element)) {

      const body = measureScope(element.scopeId);
      node.width = 2 * HORIZONTAL_SPACING + Math.max(DEFAULT_WIDTH, body.width);
      node.height = DEFAULT_HEIGHT + VERTICAL_SPACING + body.height;
      node.children = body.nodes

    } else if (element instanceof ProcedureElement) {

      const bodySize = measureScope(element.scopeId);
      node.width = Math.max(DEFAULT_WIDTH, bodySize.width);
      node.height = DEFAULT_HEIGHT + VERTICAL_SPACING + bodySize.height;

    }

    nodes.push(node);
    return node;
  }

  measureElement(procedureId);

  return nodes;
}
