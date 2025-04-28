import {
  DEFAULT_HEIGHT,
  DEFAULT_LINE_BOTTOM_MARGIN,
  DEFAULT_WIDTH,
  EdgeDto,
  getMargins,
  MIN_BRANCH_HEIGHT,
  NodeDto,
  Point,
} from '../dto/layout.dto';
import { ConditionElement } from '../models/element/element.model';
import { isScopable } from './element.utils';

export class LinePathBuilder {
  private path: string = '';
  private current: Point = { x: 0, y: 0 };

  constructor(current: Point = { x: 0, y: 0 }) {
    this.current = {...current};
    this.path += `M ${this.current.x} ${this.current.y} `
  }

  lineHorizontal(dx: number) {
    this.current.x += dx;
    this.path += `L ${this.current.x} ${this.current.y} `;
  }

  lineVertical(dy: number) {
    this.current.y += dy;
    this.path += `L ${this.current.x} ${this.current.y} `;
  }

  getPath(): string {
    return this.path.trim();
  }
}

export function getProcedureEdges(nodes: NodeDto[]): EdgeDto[] {
  const edges: EdgeDto[] = [];

  const nodeMap = nodes.reduce<Record<string, NodeDto>>((acc, node) => {
    acc[node.element.id] = node;
    return acc;
  }, {});

  for (const node of nodes) {
    if (node.element.nextId) {
      const nextNode = nodeMap[node.element.nextId];

      const startPosition: Point = {
        x: node.x + DEFAULT_WIDTH / 2,
        y: node.y + node.height
           - MIN_BRANCH_HEIGHT
           - (isScopable(node.element) ? 0 : getMargins(node.element).bottom),
      };
      const endPosition: Point = {
        x: nextNode.x + DEFAULT_WIDTH / 2,
        y: nextNode.y - DEFAULT_LINE_BOTTOM_MARGIN
      };

      const builder = new LinePathBuilder(startPosition);
      builder.lineVertical(endPosition.y - startPosition.y);

      edges.push({
        path: builder.getPath(),
        fromId: node.element.id,
        toId: node.element.nextId,
        isSupport: false
      });
    }

    if (node.element instanceof ConditionElement) {
      const leftShoulderStart: Point = {
        x: node.x,
        y: node.y + DEFAULT_HEIGHT / 2,
      };
      const leftShoulderEnd: Point = {
        x: node.left!.x + node.left!.width / 2 + DEFAULT_WIDTH / 2,
        y: node.y + DEFAULT_HEIGHT / 2 + DEFAULT_HEIGHT,
      }
      const leftShoulderBuilder = new LinePathBuilder(leftShoulderStart);
      leftShoulderBuilder.lineHorizontal(leftShoulderEnd.x - leftShoulderStart.x);
      leftShoulderBuilder.lineVertical(leftShoulderEnd.y - leftShoulderStart.y);
      edges.push({
        path: leftShoulderBuilder.getPath(),
        fromId: null,
        toId: null,
        isSupport: true
      });
      const leftLastNode = node.left!.nodes?.at(-1);
      const leftFinishingStart: Point = {
        x: leftShoulderEnd.x,
        y: leftLastNode
           ? leftLastNode.y
             + leftLastNode.height
             - MIN_BRANCH_HEIGHT
             - (isScopable(leftLastNode.element) ? 0 : getMargins(leftLastNode.element).bottom)
           : leftShoulderEnd.y
      }
      const finishingEnd: Point = {
        x: node.x + DEFAULT_WIDTH / 2,
        y: node.y + node.height - getMargins(node.element).bottom
      }
      const leftFinishingBuilder = new LinePathBuilder(leftFinishingStart);
      leftFinishingBuilder.lineVertical(finishingEnd.y - leftFinishingStart.y);
      leftFinishingBuilder.lineHorizontal(finishingEnd.x - leftFinishingStart.x);
      edges.push({
        path: leftFinishingBuilder.getPath(),
        fromId: null,
        toId: null,
        isSupport: true
      });

      const leftNode = node.left!.nodes?.[0];
      if (leftNode) {
        const startPosition: Point = {
          x: leftShoulderEnd.x,
          y: leftShoulderStart.y
        }
        const endPosition: Point = {
          x: leftShoulderEnd.x,
          y: leftNode.y - DEFAULT_LINE_BOTTOM_MARGIN
        };

        const builder = new LinePathBuilder(startPosition);
        builder.lineVertical(endPosition.y - startPosition.y);

        edges.push({
          path: builder.getPath(),
          fromId: null,
          toId: leftNode.element.id,
          isSupport: false
        });
      }

      const rightShoulderStart: Point = {
        x: node.x + DEFAULT_WIDTH,
        y: node.y + DEFAULT_HEIGHT / 2,
      };
      const rightShoulderEnd: Point = {
        x: node.right!.x + node.right!.width / 2 + DEFAULT_WIDTH / 2,
        y: node.y + DEFAULT_HEIGHT / 2 + DEFAULT_HEIGHT,
      }
      const rightShoulderBuilder = new LinePathBuilder(rightShoulderStart);
      rightShoulderBuilder.lineHorizontal(rightShoulderEnd.x - rightShoulderStart.x);
      rightShoulderBuilder.lineVertical(rightShoulderEnd.y - rightShoulderStart.y);
      edges.push({
        path: rightShoulderBuilder.getPath(),
        fromId: null,
        toId: null,
        isSupport: true
      });

      const rightLastNode = node.right!.nodes?.at(-1);
      const rightFinishingStart: Point = {
        x: rightShoulderEnd.x,
        y: rightLastNode
           ? rightLastNode.y
             + rightLastNode.height
             - MIN_BRANCH_HEIGHT
             - (isScopable(rightLastNode.element) ? 0 : getMargins(rightLastNode.element).bottom)
           : rightShoulderEnd.y
      }
      const rightFinishingBuilder = new LinePathBuilder(rightFinishingStart);
      rightFinishingBuilder.lineVertical(finishingEnd.y - rightFinishingStart.y);
      rightFinishingBuilder.lineHorizontal(finishingEnd.x - rightFinishingStart.x);
      edges.push({
        path: rightFinishingBuilder.getPath(),
        fromId: null,
        toId: null,
        isSupport: true
      });

      const rightNode = node.right!.nodes?.[0];
      if (rightNode) {
        const startPosition: Point = {
          x: rightShoulderEnd.x,
          y: rightShoulderStart.y
        }
        const endPosition: Point = {
          x: rightShoulderEnd.x,
          y: rightNode.y - DEFAULT_LINE_BOTTOM_MARGIN
        };

        const builder = new LinePathBuilder(startPosition);
        builder.lineVertical(endPosition.y - startPosition.y);

        edges.push({
          path: builder.getPath(),
          fromId: null,
          toId: rightNode.element.id,
          isSupport: false
        });
      }
    }
  }

  return edges;
}
