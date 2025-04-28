import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { NodeDto } from '../dto/layout.dto';
import { IElement } from '../models/element/element.interface';
import { ConditionElement, ProcedureElement, TerminalElement } from '../models/element/element.model';
import { Procedure } from '../models/scope/procedure/procedure.model';
import { IScope } from '../models/scope/scope.interface';
import { Scope } from '../models/scope/scope.model';
import { isLoop } from '../utils/element.utils';
import { layoutProcedure } from '../utils/layout.utils';
import { getProcedureEdges } from '../utils/edging.utils';

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

  public addElement(element: IElement, scopeId: string, previousId: string | null) {
    const snapshot = this.getStateSnapshot();
    // element = element.clone();

    if (!snapshot.scopes[scopeId]) {
      throw new Error(`Scope with id ${scopeId} doesn't exists`);
    }
    if (previousId && !snapshot.scopes[scopeId].elementsId.includes(previousId)) {
      throw new Error(`Scope with id ${scopeId} doesn't have element with id ${previousId}`);
    }

    const scope = snapshot.scopes[scopeId].clone();
    snapshot.scopes[scope.id] = scope;
    scope.elementsId = [...scope.elementsId, element.id];

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

  public getProcedureElements(procedureId: string): Observable<{ nodes: NodeDto[]; edges: any[] }> {
    return this.state$.pipe(
      map(snapshot => {
        const nodes = layoutProcedure(procedureId, snapshot);
        const edges = getProcedureEdges(nodes);

        return {
          nodes,
          edges
        }
      })
    )
  }

  public initializeDefault() {
    const snapshot = this.getStateSnapshot();

    const mainScope = new Procedure('Main', true);
    const mainElement = new ProcedureElement(mainScope.id);
    const start = new TerminalElement(true);
    const end = new TerminalElement(false);
    mainScope.startId = start.id;
    mainScope.endId = end.id;
    mainScope.elementsId = [mainScope.startId, mainScope.endId];

    start.nextId = end.id;
    end.previousId.push(start.id);

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
}
