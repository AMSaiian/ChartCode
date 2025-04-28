import {
  BranchDto,
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
    this.current = { ...current };
    this.path += `M ${this.current.x} ${this.current.y} `;
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

function getNodeBottomY(node: NodeDto): number {
  const bottomMargin = isScopable(node.element) ? 0 : getMargins(node.element).bottom;
  return node.y + node.height - MIN_BRANCH_HEIGHT - bottomMargin;
}

export class ProcedureEdgeBuilder {
  private edges!: EdgeDto[];
  private nodeMap: Record<string, NodeDto>;

  constructor(private nodes: NodeDto[]) {
    this.nodeMap = nodes.reduce<Record<string, NodeDto>>((acc, node) => {
      acc[node.element.id] = node;
      return acc;
    }, {});
  }

  public build(): EdgeDto[] {
    this.edges = [];

    for (const node of this.nodes) {
      this.processNode(node);
    }
    return this.edges;
  }

  private processNode(node: NodeDto): void {
    if (node.element.nextId) {
      const nextNode = this.nodeMap[node.element.nextId];
      const startPosition: Point = {
        x: node.x + DEFAULT_WIDTH / 2,
        y: getNodeBottomY(node),
      };
      const endPosition: Point = {
        x: nextNode.x + DEFAULT_WIDTH / 2,
        y: nextNode.y - DEFAULT_LINE_BOTTOM_MARGIN,
      };

      this.connectVertical(startPosition, endPosition.y, node.element.id, node.element.nextId, false);
    }

    if (node.element instanceof ConditionElement) {
      const finishingEnd: Point = {
        x: node.x + DEFAULT_WIDTH / 2,
        y: node.y + node.height - getMargins(node.element).bottom,
      };

      this.handleBranch(
        node.left!,
        {
          x: node.x,
          y: node.y + DEFAULT_HEIGHT / 2,
        },
        {
          x: node.left!.x + node.left!.width / 2 + DEFAULT_WIDTH / 2,
          y: node.y + DEFAULT_HEIGHT / 2 + DEFAULT_HEIGHT,
        },
        finishingEnd
      );

      this.handleBranch(
        node.right!,
        {
          x: node.x + DEFAULT_WIDTH,
          y: node.y + DEFAULT_HEIGHT / 2,
        },
        {
          x: node.right!.x + node.right!.width / 2 + DEFAULT_WIDTH / 2,
          y: node.y + DEFAULT_HEIGHT / 2 + DEFAULT_HEIGHT,
        },
        finishingEnd
      );
    }
  }

  private connectVertical(
    start: Point,
    endY: number,
    fromId: string | null,
    toId: string | null,
    isSupport: boolean
  ): void {
    const builder = new LinePathBuilder(start);
    builder.lineVertical(endY - start.y);
    this.edges.push({
      path: builder.getPath(),
      fromId,
      toId,
      isSupport,
    });
  }

  private connectShoulder(start: Point, end: Point): void {
    const builder = new LinePathBuilder(start);
    builder.lineHorizontal(end.x - start.x);
    builder.lineVertical(end.y - start.y);
    this.edges.push({
      path: builder.getPath(),
      fromId: null,
      toId: null,
      isSupport: true,
    });
  }

  private connectFinishing(start: Point, finish: Point): void {
    const builder = new LinePathBuilder(start);
    builder.lineVertical(finish.y - start.y);
    builder.lineHorizontal(finish.x - start.x);
    this.edges.push({
      path: builder.getPath(),
      fromId: null,
      toId: null,
      isSupport: true,
    });
  }

  private handleBranch(
    branch: BranchDto,
    shoulderStart: Point,
    shoulderEnd: Point,
    finishingEnd: Point
  ): void {
    this.connectShoulder(shoulderStart, shoulderEnd);

    const lastNode = branch.nodes?.at(-1);
    const finishingStart: Point = {
      x: shoulderEnd.x,
      y: lastNode ? getNodeBottomY(lastNode) : shoulderEnd.y,
    };
    this.connectFinishing(finishingStart, finishingEnd);

    const firstNode = branch.nodes?.[0];
    if (firstNode) {
      const startPosition: Point = {
        x: shoulderEnd.x,
        y: shoulderStart.y,
      };
      const endY = firstNode.y - DEFAULT_LINE_BOTTOM_MARGIN;
      this.connectVertical(startPosition, endY, null, firstNode.element.id, false);
    }
  }
}

