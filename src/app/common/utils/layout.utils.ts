import { IElement } from '../models/element/element.interface';
import { ConditionElement } from '../models/element/element.model';
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
  inPort: Point;
  outPorts: Record<string, Point>;
}

const DEFAULT_WIDTH = 120;
const DEFAULT_HEIGHT = 60;
const HORIZONTAL_SPACING = 15;
const VERTICAL_SPACING = 30;

export function layoutScope(
  scopeId: string,
  snapshot: AppState,
  originX = 0,
  originY = 0,
): NodeDto[] {
  const rootId = scopeId;
  const nodes: NodeDto[] = [];
  const dimensionCache: Record<string, { width: number; height: number }> = {};
  const compensationCache: Record<string, number> = {};

  function measureScope(id: string): { width: number; height: number } {
    if (dimensionCache[id]) {
      return dimensionCache[id];
    }
    const scope = snapshot.scopes[id];
    let maxWidth = 0;
    let totalHeight = 0;
    let elId = scope.startId;
    while (elId) {
      const dims = measureElement(elId);
      maxWidth = Math.max(maxWidth, dims.width);
      totalHeight += dims.height + VERTICAL_SPACING;
      elId = snapshot.elements[elId].nextId;
    }
    const result = { width: maxWidth, height: totalHeight };
    dimensionCache[id] = result;
    return result;
  }

  function measureElement(id: string): { width: number; height: number } {
    const element = snapshot.elements[id];
    if (element instanceof ConditionElement) {
      let posSize = { width: 0, height: 0 };
      if (element.positiveWayId) {
        posSize = measureScope(element.positiveWayId);
        const parentId = snapshot.scopes[element.positiveWayId].parentId;
        compensationCache[parentId!] = posSize.width > 0 ? posSize.width : HORIZONTAL_SPACING;
      }

      const negSize = element.negativeWayId ? measureScope(element.negativeWayId) : { width: 0, height: 0 };
      const width = posSize.width + HORIZONTAL_SPACING + DEFAULT_WIDTH + HORIZONTAL_SPACING + negSize.width;
      const height = DEFAULT_HEIGHT + VERTICAL_SPACING + Math.max(posSize.height, negSize.height);
      return { width, height };
    }
    if (isLoop(element)) {
      const loopScopeId = element.scopeId;
      const bodySize = loopScopeId ? measureScope(loopScopeId) : { width: 0, height: 0 };
      const width = Math.max(DEFAULT_WIDTH, bodySize.width);
      const height = DEFAULT_HEIGHT + VERTICAL_SPACING + bodySize.height;
      return { width, height };
    }
    return { width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT };
  }

  function positionScope(id: string, startX: number, startY: number): { width: number; height: number } {
    let maxWidth = 0;
    let currentY = startY;
    const scope = snapshot.scopes[id];
    let elId = scope.startId;
    while (elId) {
      const dims = positionElement(elId, startX, currentY);
      maxWidth = Math.max(maxWidth, dims.width);
      currentY += dims.height + VERTICAL_SPACING;
      elId = snapshot.elements[elId].nextId;
    }
    return { width: maxWidth, height: currentY - startY };
  }

  function positionElement(id: string, x: number, y: number): { width: number; height: number } {
    const element = snapshot.elements[id];
    if (element instanceof ConditionElement) {
      const posSize = element.positiveWayId ? measureScope(element.positiveWayId) : { width: 0, height: 0 };
      const negSize = element.negativeWayId ? measureScope(element.negativeWayId) : { width: 0, height: 0 };
      const totalW = posSize.width + HORIZONTAL_SPACING + DEFAULT_WIDTH + HORIZONTAL_SPACING + negSize.width;
      const totalH = DEFAULT_HEIGHT + VERTICAL_SPACING + Math.max(posSize.height, negSize.height);
      const headerX = x;
      const headerY = y;
      nodes.push({
        element,
        x: headerX,
        y: headerY,
        width: totalW,
        height: totalH,
        inPort: { x: headerX + DEFAULT_WIDTH / 2, y: headerY },
        outPorts: {
          default: { x: headerX + DEFAULT_WIDTH / 2, y: headerY + DEFAULT_HEIGHT },
          true: { x: headerX, y: headerY + DEFAULT_HEIGHT / 2 },
          false: { x: headerX + DEFAULT_WIDTH, y: headerY + DEFAULT_HEIGHT / 2 },
        },
      });
      const branchY = headerY + VERTICAL_SPACING + DEFAULT_HEIGHT;
      if (element.positiveWayId) {
        positionScope(element.positiveWayId, headerX - posSize.width + (compensationCache[element.positiveWayId] ?? -HORIZONTAL_SPACING), branchY);
      }
      if (element.negativeWayId) {
        positionScope(element.negativeWayId, headerX + DEFAULT_WIDTH + (compensationCache[element.negativeWayId] ?? HORIZONTAL_SPACING), branchY);
      }
      return { width: totalW, height: totalH };
    }
    if (isLoop(element)) {
      const loopScopeId = element.scopeId;
      const bodySize = loopScopeId ? measureScope(loopScopeId) : { width: 0, height: 0 };
      const totalW = Math.max(DEFAULT_WIDTH, bodySize.width);
      const totalH = DEFAULT_HEIGHT + VERTICAL_SPACING + bodySize.height;
      const headerX = x;
      const headerY = y;
      nodes.push({
        element,
        x: headerX,
        y: headerY,
        width: totalW,
        height: totalH,
        inPort: { x: headerX + DEFAULT_WIDTH / 2, y: headerY },
        outPorts: {
          default: { x: headerX + DEFAULT_WIDTH / 2, y: headerY + DEFAULT_HEIGHT },
          loopBack: { x: headerX + DEFAULT_WIDTH / 2, y: headerY },
        },
      });
      if (loopScopeId) {
        positionScope(loopScopeId, headerX, headerY + DEFAULT_HEIGHT + VERTICAL_SPACING);
      }
      return { width: totalW, height: totalH };
    }

    nodes.push({
      element,
      x,
      y,
      width: DEFAULT_WIDTH,
      height: DEFAULT_HEIGHT,
      inPort: { x: x + DEFAULT_WIDTH / 2, y },
      outPorts: { default: { x: x + DEFAULT_WIDTH / 2, y: y + DEFAULT_HEIGHT } },
    });
    return { width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT };
  }

  positionScope(scopeId, originX, originY);
  return nodes;
}
