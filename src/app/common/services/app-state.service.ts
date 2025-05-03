import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { EdgeDto, InsertionDto, NodeDto, Point } from '../dto/layout.dto';
import { ElementType, IElement } from '../models/element/element.interface';
import {
  AssignElement,
  ConditionElement,
  ForLoopElement,
  InputElement,
  OutputElement,
  WhileLoopElement,
} from '../models/element/element.model';
import { IScope } from '../models/scope/scope.interface';
import { ProcedureLayoutBuilder } from '../utils/layout.builder';
import { ProcedureEdgeBuilder } from '../utils/edging.builder';
import { FlowchartService } from './flowchart.service';

export interface AppState {
  scopes: Record<string, IScope>;
  elements: Record<string, IElement>;
}

@Injectable({
  providedIn: 'root'
})
export class AppStateService {
  readonly flowchart = inject(FlowchartService);

  selectedProcedureId$ = new BehaviorSubject<string>('');
  selectedElementType$ = new BehaviorSubject<ElementType | null>(null);
  selectedElementId$ = new BehaviorSubject<string | null>(null);

  public getProcedureElements(procedureId: string): Observable<{
    nodes: NodeDto[];
    edges: EdgeDto[],
    insertions: InsertionDto[]
  }> {
    return this.flowchart.current$.pipe(
      map(snapshot => {
        const nodes = new ProcedureLayoutBuilder(procedureId, snapshot).build();
        const edgesAndInsertions = new ProcedureEdgeBuilder(nodes).build();

        return {
          nodes,
          edges: edgesAndInsertions.edges,
          insertions: edgesAndInsertions.insertions
        }
      })
    )
  }

  public selectElement(elementId: string) {
    this.clearElementTypeSelection();

    if (this.selectedElementId$.value === elementId) {
      this.selectedElementId$.next(null);
    } else {
      this.selectedElementId$.next(elementId);
    }
  }

  public clearElementSelection() {
    this.selectedElementId$.next(null);
  }

  public selectElementType(type: ElementType) {
    this.clearElementSelection();

    if (this.selectedElementType$.value === type) {
      this.selectedElementType$.next(null);
    } else {
      this.selectedElementType$.next(type);
    }
  }

  public clearElementTypeSelection() {
    this.selectedElementType$.next(null);
  }

  public initializeFlowchart() {
    const mainProcedureId = this.flowchart.initializeDefault();
    this.selectedProcedureId$.next(mainProcedureId);
  }

  public insert(point: InsertionDto): string {
    if (!this.selectedElementType$.value) {
      console.warn(`No element type selected but tried to insert. Point: ${JSON.stringify(point, null, 2)}`);
      return '';
    }
    const element = (() => {
      switch (this.selectedElementType$.value) {
        case 'input': return InputElement.getDefault();
        case 'output': return OutputElement.getDefault();
        case 'assign': return AssignElement.getDefault();
        case 'condition': return ConditionElement.getDefault();
        case 'for-loop': return ForLoopElement.getDefault();
        case 'while-loop': return WhileLoopElement.getDefault();
        default: throw new Error(`Unknown element type ${this.selectedElementType$.value}`);
      }
    })();

    const newElementId = this.flowchart.addElement(element, point.scopeId, point.fromId);
    this.selectedElementType$.next(null);
    return newElementId;
  }

  public deleteSelected() {
    const selectedId = this.selectedElementId$.value;

    if (!selectedId) {
      console.warn(`No element selected but tried to delete`);
      return;
    }

    this.flowchart.deleteElement(selectedId);
    this.clearElementSelection();
  }
}
