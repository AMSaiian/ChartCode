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
import { ConditionElement, ForLoopElement, WhileLoopElement } from '../models/element/element.model';
import { isLoop, isScopable } from './element.utils';

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
  return node.y
         + node.height
         - (isLoop(node.element) ? 2 * MIN_BRANCH_HEIGHT : MIN_BRANCH_HEIGHT)
         - bottomMargin;
}

export class ProcedureEdgeBuilder {
  private edges!: EdgeDto[];
  private insertPoints!: Point[];
  private nodeMap: Record<string, NodeDto>;

  constructor(private nodes: NodeDto[]) {
    this.nodeMap = nodes.reduce<Record<string, NodeDto>>((acc, node) => {
      acc[node.element.id] = node;
      return acc;
    }, {});
  }

  public build(): EdgeDto[] {
    this.edges = [];
    this.insertPoints = [];

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
    } else if (isLoop(node.element)) {
      const labelPosition: Point = {
        x: node.x + DEFAULT_WIDTH / 2,
        y: node.y + DEFAULT_HEIGHT
      };

      const { loopBodyEnd, loopEnd } = this.buildLoopBodyConnections(node, labelPosition);

      this.buildReturnLine(node, loopEnd, loopBodyEnd);
      this.buildExitLine(node, loopEnd);
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

  private buildLoopBodyConnections(node: NodeDto, labelPosition: Point) {
    let loopBodyEnd: Point;
    let loopEnd: Point;

    const firstBody = node.body!.nodes?.[0];
    const lastBody = node.body!.nodes?.at(-1);

    if (firstBody && lastBody) {
      const firstBodyTop: Point = {
        x: firstBody.x + DEFAULT_WIDTH / 2,
        y: firstBody.y - DEFAULT_LINE_BOTTOM_MARGIN,
      };

      this.connectVertical(labelPosition, firstBodyTop.y, null, firstBody.element.nextId, false);

      loopBodyEnd = {
        x: lastBody.x + DEFAULT_WIDTH / 2,
        y: getNodeBottomY(lastBody),
      };

      loopEnd = {
        x: loopBodyEnd.x,
        y: loopBodyEnd.y + getMargins(node.element).bottom / 2
      };

      this.connectVertical(loopBodyEnd, loopEnd.y, lastBody.element.id, null, true);
    } else {
      loopBodyEnd = {
        x: labelPosition.x,
        y: labelPosition.y + node.body?.height!
      };

      loopEnd = {
        x: labelPosition.x,
        y: loopBodyEnd.y + getMargins(node.element).bottom / 2
      };

      this.connectVertical(labelPosition, loopEnd.y, null, null, true);
    }

    return { loopBodyEnd, loopEnd };
  }

  private buildReturnLine(node: NodeDto, loopEnd: Point, loopBodyEnd: Point) {
    let loopReturn: Point;
    let isSupport: boolean;

    if (node.element instanceof ForLoopElement) {
      loopReturn = {
        x: node.x,
        y: node.y + DEFAULT_HEIGHT / 2
      };
      isSupport = false;
    } else {
      loopReturn = {
        x: node.x + DEFAULT_WIDTH / 2,
        y: node.y - MIN_BRANCH_HEIGHT
      };
      isSupport = true;
    }

    const returnShoulder: Point = {
      x: loopEnd.x - (node.body!.width / 2 + getMargins(node.element).left / 2),
      y: loopReturn.y
    };

    const builder = new LinePathBuilder(loopEnd);
    builder.lineHorizontal(returnShoulder.x - loopEnd.x);
    builder.lineVertical(loopReturn.y - loopEnd.y);
    builder.lineHorizontal(loopReturn.x - returnShoulder.x);

    this.edges.push({
      path: builder.getPath(),
      fromId: node.body?.nodes?.at(-1)?.element.id ?? null,
      toId: null,
      isSupport
    });
  }

  private buildExitLine(node: NodeDto, loopEnd: Point) {
    const exitStart: Point = {
      x: node.x + DEFAULT_WIDTH,
      y: node.y + DEFAULT_HEIGHT / 2
    };

    const exitShoulder: Point = {
      x: loopEnd.x + (node.body!.width / 2 + getMargins(node.element).right / 2),
      y: getNodeBottomY(node)
    };

    const builder = new LinePathBuilder(exitStart);
    builder.lineHorizontal(exitShoulder.x - exitStart.x);
    builder.lineVertical(exitShoulder.y - exitStart.y);
    builder.lineHorizontal(loopEnd.x - exitShoulder.x);

    this.edges.push({
      path: builder.getPath(),
      fromId: null,
      toId: null,
      isSupport: true
    });
  }
}

