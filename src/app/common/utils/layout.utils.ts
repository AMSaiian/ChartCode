import { NodeDto } from '../dto/layout.dto';
import { ConditionElement } from '../models/element/element.model';
import { AppState } from '../services/app-state.service';
import { isLoop } from './element.utils';

export const DEFAULT_WIDTH = 120;
export const DEFAULT_HEIGHT = 60;
export const V_SPACING = 40;
export const H_BRANCH_OFFSET = 160;

export function layoutScope(
  scopeId: string,
  snapshot: AppState,
  startX = 400,
  startY = 0
): NodeDto[] {
  const scope = snapshot.scopes[scopeId];
  const result: NodeDto[] = [];

  let currentId = scope.startId;
  let y = startY;

  while (currentId) {
    const el = snapshot.elements[currentId].clone();
    const node: NodeDto = {
      element: el,
      x: startX,
      y,
      width: DEFAULT_WIDTH,
      height: DEFAULT_HEIGHT
    };

    result.push(node);

    if (el instanceof ConditionElement) {
      const baseY = y + node.height + V_SPACING;
      let maxY = y + node.height;

      if (el.positiveWayId) {
        const left = layoutScope(el.positiveWayId, snapshot, startX - H_BRANCH_OFFSET, baseY);
        result.push(...left);
        maxY = Math.max(maxY, getMaxY(left));
      }

      if (el.negativeWayId) {
        const right = layoutScope(el.negativeWayId, snapshot, startX + H_BRANCH_OFFSET, baseY);
        result.push(...right);
        maxY = Math.max(maxY, getMaxY(right));
      }

      y = maxY + V_SPACING;

    } else if (isLoop(el)) {
      const nested = layoutScope(el.scopeId, snapshot, startX, y + node.height + V_SPACING);
      result.push(...nested);
      y = getMaxY(nested) + V_SPACING;

    } else {
      y += node.height + V_SPACING;
    }

    currentId = el.nextId;
  }

  return result;
}

function getMaxY(nodes: NodeDto[]): number {
  return nodes.length ? Math.max(...nodes.map(n => n.y + n.height)) : -Infinity;
}
