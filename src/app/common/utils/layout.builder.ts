import {
  BranchDto,
  DEFAULT_HEIGHT,
  DEFAULT_WIDTH,
  getMargins,
  MIN_BRANCH_HEIGHT,
  MIN_BRANCH_WIDTH,
  NodeDto,
} from '../dto/layout.dto';
import { IElement } from '../models/element/element.interface';
import {
  ConditionElement,
  ProcedureElement,
} from '../models/element/element.model';
import { AppState } from '../services/app-state.service';
import { isLoop } from './element.utils';

export class ProcedureLayoutBuilder {
  private nodes: NodeDto[] = [];

  constructor(
    private procedureId: string,
    private snapshot: AppState,
    private originX = 0,
    private originY = 0
  ) {}

  public build(): NodeDto[] {
    this.nodes = [];

    const root: IElement = this.snapshot.elements[this.procedureId];
    if (!root) {
      throw new Error(`Root with id ${this.procedureId} not found`);
    }

    this.measureElement(this.procedureId);
    this.positionNode(this.nodes[0], this.originX, this.originY);

    for (const node of this.nodes) {
      node.x = node.x + node.width / 2;
      node.y = node.y
               + (isLoop(node.element) ? 2 * MIN_BRANCH_HEIGHT : MIN_BRANCH_HEIGHT);
    }

    return [...this.nodes];
  }

  private measureScope(id: string): BranchDto {
    const scope = this.snapshot.scopes[id];

    if (!scope) {
      throw new Error(`Scope with id ${this.procedureId} not found`);
    }

    const nodes: NodeDto[] = [];
    let maxWidth = 0;
    let totalHeight = 0;

    let elementId = scope.startId;
    while (elementId) {
      const element = this.measureElement(elementId);
      nodes.push(element);

      maxWidth = Math.max(maxWidth, element.width);
      totalHeight += element.height;

      elementId = this.snapshot.elements[elementId].nextId;
    }

    return {
      x: -Infinity,
      y: -Infinity,
      width: maxWidth > MIN_BRANCH_WIDTH ? maxWidth : MIN_BRANCH_WIDTH,
      height: totalHeight > MIN_BRANCH_HEIGHT ? totalHeight : MIN_BRANCH_HEIGHT,
      nodes: nodes
    };
  }

  private measureElement(id: string): NodeDto {
    const element = this.snapshot.elements[id];

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

    this.nodes.push(node);

    if (element instanceof ConditionElement) {

      const positiveBranch = this.measureScope(element.positiveWayId!);
      const negativeBranch = this.measureScope(element.negativeWayId!);
      node.width = positiveBranch.width + negativeBranch.width;
      node.height = Math.max(positiveBranch.height, negativeBranch.height);
      node.left = positiveBranch;
      node.right = negativeBranch;

    } else if (isLoop(element)) {

      const body = this.measureScope(element.scopeId);
      node.width = body.width;
      node.height = body.height;
      node.body = body;

    } else if (element instanceof ProcedureElement) {

      const body = this.measureScope(element.scopeId);
      node.width = body.width;
      node.height = body.height;
      node.body = body;
    }

    const margin = getMargins(node.element);
    node.width += margin.left + margin.right;
    node.height += margin.top + margin.bottom;

    return node;
  }

  private positionBranch(branch: BranchDto, x: number, y: number): void {
    branch.x = x;
    branch.y = y;

    let currentY = y;

    for (const node of branch.nodes)  {
      this.positionNode(node, x + (branch.width - node.width) / 2, currentY);
      currentY += node.height;
    }
  }

  private positionNode(node: NodeDto, x: number, y: number): void {
    node.x = x;
    node.y = y;

    const margin = getMargins(node.element!);
    const branchY = y + margin.top;

    if (node.element instanceof ConditionElement) {
      this.positionBranch(node.left!, x + margin.left, branchY);
      this.positionBranch(node.right!, x + margin.left + node.left?.width!, branchY);

    } else if (node.element instanceof ProcedureElement || isLoop(node.element)) {
      this.positionBranch(node.body!, x + margin.left, branchY);
    }
  }
}

