import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { EdgeDto, InsertionDto, NodeDto, Point } from '../dto/layout.dto';
import { ElementType, IElement } from '../models/element/element.interface';
import { ConditionElement, ProcedureElement, TerminalElement } from '../models/element/element.model';
import { Procedure } from '../models/scope/procedure/procedure.model';
import { IScope } from '../models/scope/scope.interface';
import { Scope } from '../models/scope/scope.model';
import { isLoop } from '../utils/element.utils';
import { ProcedureLayoutBuilder } from '../utils/layout.builder';
import { ProcedureEdgeBuilder } from '../utils/edging.builder';

export interface AppState {
  scopes: Record<string, IScope>;
  elements: Record<string, IElement>;
}

@Injectable({
  providedIn: 'root'
})
export class AppStateService {
  state$: BehaviorSubject<AppState> = new BehaviorSubject({
    scopes: {},
    elements: {},
  });

  selectedProcedureId$ = new BehaviorSubject<string>('');
  selectedElementType$ = new BehaviorSubject<ElementType | null>(null);

  public addElement(element: IElement, scopeId: string, previousId: string | null) {
    const snapshot = this.getStateSnapshot();
    // element = element.clone();
    if (element.id) {
      throw new Error(`Cannot insert initialised element. Id ${element.id}`);
    } else {
      element.id = crypto.randomUUID();
    }

    if (!snapshot.scopes[scopeId]) {
      throw new Error(`Scope with id ${scopeId} doesn't exists`);
    }
    if (previousId && !snapshot.scopes[scopeId].elementsId.includes(previousId)) {
      throw new Error(`Scope with id ${scopeId} doesn't have element with id ${previousId}`);
    }

    const scope = snapshot.scopes[scopeId].clone();
    snapshot.scopes[scope.id] = scope;
    scope.elementsId = [...scope.elementsId, element.id];
    element.inScopeId = scope.id;

    snapshot.elements[element.id] = element;

    if (element instanceof ConditionElement) {
      const positiveScope = new Scope();
      snapshot.scopes[positiveScope.id] = positiveScope;
      const negativeScope = new Scope();
      snapshot.scopes[negativeScope.id] = negativeScope;

      element.positiveWayId = positiveScope.id;
      element.negativeWayId = negativeScope.id;

      positiveScope.parentId = scope.id;
      negativeScope.parentId = scope.id;

      scope.childrenId = [...scope.childrenId, positiveScope.id, negativeScope.id];
    } else if (isLoop(element)) {
      const loopScope = new Scope();
      snapshot.scopes[loopScope.id] = loopScope;
      element.scopeId = loopScope.id;
      loopScope.parentId = scope.id;
      scope.childrenId = [...scope.childrenId, loopScope.id];
    }

    if (previousId) {
      const previous = snapshot.elements[previousId].clone();
      snapshot.elements[previous.id] = previous;

      element.previousId = [...element.previousId, previous.id];
      element.nextId = previous.nextId;

      if (previous.nextId) {
        const next = snapshot.elements[previous.nextId].clone();

        next.previousId = next.previousId.filter(x => x !== previous.id);
        next.previousId = [...next.previousId, element.id];

        snapshot.elements[next.id] = next;
      }

      previous.nextId = element.id;

      if (previous.id === scope.endId) {
        scope.endId = element.id;
      }

    } else {
      if (scope.startId) {
        const start = snapshot.elements[scope.startId].clone()
        snapshot.elements[start.id] = start;

        start.previousId = [...start.previousId, element.id];
        element.nextId = start.id;
      }
      scope.startId = element.id;

      if (!scope.endId) {
        scope.endId = element.id;
      }
    }

    this.state$.next(snapshot);
  }

  public deleteElement(elementId: string) {
    const snapshot = this.getStateSnapshot();

    const element = snapshot.elements[elementId];
    if (!element) {
      throw new Error(`Element with id ${elementId} doesn't exist`);
    }

    const scopeId = element.inScopeId;
    if (!scopeId || !snapshot.scopes[scopeId]) {
      throw new Error(`Scope for element with id ${elementId} doesn't exist`);
    }

    const scope = snapshot.scopes[scopeId];
    if (!scope.elementsId.includes(elementId)) {
      throw new Error(`Scope with id ${scopeId} doesn't contain element with id ${elementId}`);
    }

    const updatedScope = scope.clone();
    snapshot.scopes[scopeId] = updatedScope;
    updatedScope.elementsId = updatedScope.elementsId.filter(id => id !== elementId);

    if (element.previousId.length > 0) {
      for (const prevId of element.previousId) {
        const prev = snapshot.elements[prevId].clone();
        snapshot.elements[prev.id] = prev;
        prev.nextId = element.nextId;
      }
    }

    if (element.nextId) {
      const next = snapshot.elements[element.nextId].clone();
      snapshot.elements[next.id] = next;

      next.previousId = next.previousId.filter(id => id !== elementId);
      next.previousId = [...new Set([...next.previousId, ...element.previousId])];
    }

    if (updatedScope.startId === elementId) {
      updatedScope.startId = element.nextId;
    }
    if (updatedScope.endId === elementId) {
      updatedScope.endId = element.previousId.length > 0 ? element.previousId[0] : null;
    }

    if (element instanceof ConditionElement) {
      if (element.positiveWayId) {
        this.deleteScopeRecursively(element.positiveWayId, snapshot);
        updatedScope.childrenId = updatedScope.childrenId.filter(id => id !== element.positiveWayId);
      }
      if (element.negativeWayId) {
        this.deleteScopeRecursively(element.negativeWayId, snapshot);
        updatedScope.childrenId = updatedScope.childrenId.filter(id => id !== element.negativeWayId);
      }
    } else if (isLoop(element)) {
      if (element.scopeId) {
        this.deleteScopeRecursively(element.scopeId, snapshot);
        updatedScope.childrenId = updatedScope.childrenId.filter(id => id !== element.scopeId);
      }
    }

    delete snapshot.elements[elementId];

    this.state$.next(snapshot);
  }

  public getProcedureElements(procedureId: string): Observable<{ nodes: NodeDto[]; edges: EdgeDto[], insertions: InsertionDto[] }> {
    return this.state$.pipe(
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

  public initializeDefault() {
    const snapshot = this.getStateSnapshot();

    const mainScope = new Procedure('Main', true);

    const mainElement = new ProcedureElement(mainScope.id);
    mainElement.id = crypto.randomUUID();

    const start = new TerminalElement(true);
    start.id = crypto.randomUUID();

    const end = new TerminalElement(false);
    end.id = crypto.randomUUID();

    mainScope.startId = start.id;
    mainScope.endId = end.id;
    mainScope.elementsId = [mainScope.startId, mainScope.endId];

    start.nextId = end.id;
    end.previousId.push(start.id);

    start.inScopeId = mainScope.id;
    end.inScopeId = mainScope.id;

    snapshot.scopes[mainScope.id] = mainScope;

    snapshot.elements[mainElement.id] = mainElement;
    snapshot.elements[start.id] = start;
    snapshot.elements[end.id] = end;

    this.state$.next(snapshot);
    this.selectedProcedureId$.next(mainElement.id);
  }

  public getStateSnapshot(): AppState {
    const value = this.state$.value;

    return {
      scopes: { ...value.scopes },
      elements: { ...value.elements }
    };
  };

  private deleteScopeRecursively(scopeId: string, snapshot: AppState) {
    const scopeToDelete = snapshot.scopes[scopeId];

    if (!scopeToDelete) {
      return;
    }

    for (const elId of scopeToDelete.elementsId) {
      const child = snapshot.elements[elId];
      if (!child) {
        console.warn(`Scope with id ${scopeId} does not have element with id ${elId}`)
        continue;
      }

      if (child instanceof ConditionElement) {
        if (child.positiveWayId) {
          this.deleteScopeRecursively(child.positiveWayId, snapshot);
        } else {
          console.warn(`Condition with id ${child.id} does not have positive scope`)
        }
        if (child.negativeWayId) {
          this.deleteScopeRecursively(child.negativeWayId, snapshot);
        } else {
          console.warn(`Condition with id ${child.id} does not have negative scope`)
        }
      } else if (isLoop(child)) {
        if (child.scopeId) {
          this.deleteScopeRecursively(child.scopeId, snapshot);
        } else {
          console.warn(`Loop with id ${child.id} does not have body scope`)
        }
      }

      delete snapshot.elements[elId];
    }

    delete snapshot.scopes[scopeId];
  }
}
