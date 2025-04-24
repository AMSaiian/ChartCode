import { AppState } from '../services/app-state.service';
import { IElement } from '../models/element/element.interface';
import { ConditionElement } from '../models/element/element.model';
import { isLoop } from './element.utils';

export interface Point { x: number; y: number }

export interface NodeDto {
  element: IElement;
  row: number;
  col: number;
  x: number;
  y: number;
  width: number;
  height: number;
  inPort: Point;
  outPorts: Record<string, Point>;
}

export interface EdgeDTO { from: Point; to: Point; path: string }

const DEFAULT_WIDTH = 120;
const DEFAULT_HEIGHT = 60;
const V_SPACING = 40;
const COL_WIDTH = DEFAULT_WIDTH;
const ROW_HEIGHT = DEFAULT_HEIGHT + V_SPACING;
const RETURN_MARGIN = 20;

/**
 * Рекурсивно вычисляет grid layout для scopeId:
 * - row/col позиции
 * - абсолютные x/y
 * - порты inPort/outPorts
 */
export function computeGridLayout(
  scopeId: string,
  snapshot: AppState,
  originX = 0,
  originY = 0
): NodeDto[] {
  const nodes: NodeDto[] = [];
  let rowCounter = 0;

  function traverse(sId: string, col: number) {
    const scope = snapshot.scopes[sId];
    let curId = scope.startId;

    while (curId) {
      const el = snapshot.elements[curId];
      const row = rowCounter++;
      const x = originX + col * COL_WIDTH;
      const y = originY + row * ROW_HEIGHT;

      // создаём NodeDto и добавляем порты
      const node: NodeDto = {
        element: el,
        row,
        col,
        x,
        y,
        width: DEFAULT_WIDTH,
        height: DEFAULT_HEIGHT,
        inPort: { x: x + DEFAULT_WIDTH / 2, y },
        outPorts: { default: { x: x + DEFAULT_WIDTH / 2, y: y + DEFAULT_HEIGHT } }
      };
      if (el instanceof ConditionElement) {
        node.outPorts = {
          true:  { x: x,                 y: y + DEFAULT_HEIGHT / 2 },
          false: { x: x + DEFAULT_WIDTH, y: y + DEFAULT_HEIGHT / 2 }
        };
      }
      if (isLoop(el)) {
        node.outPorts['loopBack'] = {
          x: x - RETURN_MARGIN,
          y: y + DEFAULT_HEIGHT / 2
        };
      }

      nodes.push(node);

      // Развилка: две ветки начинаются на одном row
      if (el instanceof ConditionElement) {
        const branchStart = rowCounter;
        let maxRow = branchStart;
        if (el.positiveWayId) {
          rowCounter = branchStart;
          traverse(el.positiveWayId, col - 1);
          maxRow = Math.max(maxRow, rowCounter);
        }
        if (el.negativeWayId) {
          rowCounter = branchStart;
          traverse(el.negativeWayId, col + 1);
          maxRow = Math.max(maxRow, rowCounter);
        }
        rowCounter = maxRow;
      }
      // Цикл: тело под родителем в той же колонке
      else if (isLoop(el)) {
        traverse(el.scopeId, col);
      }

      // Переходим к следующему в текущем scope
      curId = el.nextId ?? null;
    }
  }

  traverse(scopeId, 0);
  return nodes;
}

/**
 * Строит ортогональные Manhattan пути между NodeDto.
 */
export function buildEdges(
  nodes: NodeDto[],
  snapshot: AppState
): EdgeDTO[] {
  const edges: EdgeDTO[] = [];
  const byId: Record<string, NodeDto> = {};
  nodes.forEach(n => { byId[n.element.id] = n; });

  function manhattan(a: Point, b: Point): string {
    const midY = (a.y + b.y) / 2;
    return `M${a.x},${a.y} V${midY} H${b.x} V${b.y}`;
  }

  for (const node of nodes) {
    const el = node.element;

    // условие: ветки и слияние
    if (el instanceof ConditionElement) {
      const mergeNode = el.nextId && byId[el.nextId] ? byId[el.nextId] : undefined;
      // TRUE branch (mirrored)
      if (el.positiveWayId) {
        const posScope = snapshot.scopes[el.positiveWayId];
        if (posScope.elementsId?.length && byId[posScope.startId!]) {
          const start = byId[posScope.startId!];
          edges.push({
            from: node.outPorts['true'],
            to: start.inPort,
            path: `M${node.outPorts['true'].x},${node.outPorts['true'].y} H${start.inPort.x} V${start.inPort.y}`
          });
          if (mergeNode && posScope.endId && byId[posScope.endId]) {
            const end = byId[posScope.endId];
            edges.push({
              from: end.outPorts['default'],
              to: mergeNode.inPort,
              path: manhattan(end.outPorts['default'], mergeNode.inPort)
            });
          }
        } else if (mergeNode) {
          edges.push({
            from: node.outPorts['true'],
            to: mergeNode.inPort,
            path: manhattan(node.outPorts['true'], mergeNode.inPort)
          });
        }
      }
      // FALSE branch (mirrored)
      if (el.negativeWayId) {
        const negScope = snapshot.scopes[el.negativeWayId];
        if (negScope.elementsId?.length && byId[negScope.startId!]) {
          const start = byId[negScope.startId!];
          edges.push({
            from: node.outPorts['false'],
            to: start.inPort,
            path: `M${node.outPorts['false'].x},${node.outPorts['false'].y} H${start.inPort.x} V${start.inPort.y}`
          });
          if (mergeNode && negScope.endId && byId[negScope.endId]) {
            const end = byId[negScope.endId];
            edges.push({
              from: end.outPorts['default'],
              to: mergeNode.inPort,
              path: manhattan(end.outPorts['default'], mergeNode.inPort)
            });
          }
        } else if (mergeNode) {
          edges.push({
            from: node.outPorts['false'],
            to: mergeNode.inPort,
            path: manhattan(node.outPorts['false'], mergeNode.inPort)
          });
        }
      }
    }
    // цикл: возврат
    else if (isLoop(el)) {
      const loopScope = snapshot.scopes[el.scopeId];
      if (loopScope.endId && byId[loopScope.endId]) {
        const bodyEnd = byId[loopScope.endId];
        const a = bodyEnd.outPorts['default'];
        const b = node.outPorts['loopBack']!;
        edges.push({ from: a, to: b, path: `M${a.x},${a.y} H${b.x} V${b.y}` });
      }
      // выход из цикла
      if (el.nextId && byId[el.nextId]) {
        const nxt = byId[el.nextId];
        edges.push({ from: node.outPorts['default'], to: nxt.inPort, path: manhattan(node.outPorts['default'], nxt.inPort) });
      }
    }
    // обычный переход
    else if (el.nextId && byId[el.nextId]) {
      const nxt = byId[el.nextId];
      edges.push({ from: node.outPorts['default'], to: nxt.inPort, path: manhattan(node.outPorts['default'], nxt.inPort) });
    }
  }

  return edges;
}
