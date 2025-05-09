import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, distinctUntilChanged, map, Observable } from 'rxjs';
import { FormatOptions } from '../const/сode-template.const';
import { EdgeDto, InsertionDto, NodeDto } from '../dto/layout.dto';
import { ElementType } from '../models/element/element.interface';
import {
  AssignElement,
  ConditionElement,
  ForLoopElement,
  InputElement,
  OutputElement,
  ProcedureElement,
  WhileLoopElement,
} from '../models/element/element.model';
import { ProcedureEdgeBuilder } from '../utils/edging.builder';
import { deepCloneMap } from '../utils/element.utils';
import { ProcedureLayoutBuilder } from '../utils/layout.builder';
import { CodegenService } from './codegen.service';
import { FileService } from './file.service';
import { FlowchartService } from './flowchart.service';

@Injectable({
  providedIn: 'root'
})
export class AppStateService {
  readonly flowchart = inject(FlowchartService);
  readonly fileService = inject(FileService);
  readonly codegenService = inject(CodegenService);

  selectedProcedureId$ = this.flowchart.current$.pipe(
    map(x => x.selectedProcedureId),
    distinctUntilChanged()
  );

  proceduresList$ = this.flowchart.current$.pipe(
    map(state => Object.values(state.elements)
                       .filter(x => x instanceof ProcedureElement)
                       .map(x => ({ name: x.name, id: x.id }))
    )
  );

  selectedElementType$ = new BehaviorSubject<ElementType | null>(null);
  selectedElementId$ = new BehaviorSubject<string | null>(null);

  undoSteps$: Observable<number>;
  redoSteps$: Observable<number>;

  constructor() {
    this.undoSteps$ = this.flowchart.history$.pipe(
      map(x => x.undoStack.length)
    );

    this.redoSteps$ = this.flowchart.history$.pipe(
      map(x => x.redoStack.length)
    );
  }

  public getProcedureElements(procedureId: string): Observable<{
    nodes: NodeDto[];
    edges: EdgeDto[],
    insertions: InsertionDto[]
  }> {
    return this.flowchart.current$.pipe(
      map(snapshot => {
        const copy = {
          selectedProcedureId: snapshot.selectedProcedureId,
          scopes: deepCloneMap(snapshot.scopes),
          elements: deepCloneMap(snapshot.elements),
        };

        const nodes = new ProcedureLayoutBuilder(procedureId, copy).build();
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
    const state = this.flowchart.initializeProcedure('Main', true);
    this.flowchart.updateState(state, false);
  }

  public addProcedure(name: string) {
    const snapshot = this.flowchart.initializeProcedure(name, true);
    this.flowchart.updateState(snapshot);
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

  public undo() {
    if (this.selectedElementId$.value) {
      this.selectedElementId$.next(null);
    }
    if (this.selectedElementType$.value) {
      this.selectedElementType$.next(null);
    }

    this.flowchart.goBackHistory();
  }

  public redo() {
    if (this.selectedElementId$.value) {
      this.selectedElementId$.next(null);
    }
    if (this.selectedElementType$.value) {
      this.selectedElementType$.next(null);
    }

    this.flowchart.goForwardHistory();
  }

  public saveFlowchart() {
    const current = this.flowchart.current$.value;

    return this.fileService.saveFlowchartToFile(current);
  }

  public async loadFlowchart() {
    const fromFile = await this.fileService.loadFlowchartFromFile();
    this.flowchart.resetHistory();

    if (fromFile) {
      this.flowchart.current$.next(fromFile);
    }
  }

  public async exportFlowchartAsImage(flowchart: SVGSVGElement, procedureNode: NodeDto) {
    await this.fileService.exportToJpg(flowchart, procedureNode);
  }

  public selectProcedure(procedureId: string) {
    this.flowchart.current$.value.selectedProcedureId = procedureId;
    this.flowchart.current$.next(this.flowchart.current$.value);
  }

  public getGeneratedCode(language: string, options?: FormatOptions): Observable<string> {
    return this.flowchart.current$.pipe(
      map(x => this.codegenService.generate(language, x.selectedProcedureId, x.elements, x.scopes, options))
    );
  }
}
