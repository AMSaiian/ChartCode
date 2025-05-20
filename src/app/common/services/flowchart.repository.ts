import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { IElement } from '../models/element/element.interface';
import { ConditionElement, ProcedureElement, TerminalElement } from '../models/element/element.model';
import { IScope } from '../models/scope/scope.interface';
import { Scope } from '../models/scope/scope.model';
import { deepCloneMap, isLoop } from '../utils/element.utils';

export interface FlowchartState {
  selectedProcedureId: string;
  scopes: Record<string, IScope>;
  elements: Record<string, IElement>;
}

export interface HistoryState {
  undoStack: FlowchartState[],
  redoStack: FlowchartState[]
}

@Injectable({
  providedIn: 'root'
})
export class FlowchartRepository {
  current$: BehaviorSubject<FlowchartState> = new BehaviorSubject({
    selectedProcedureId:  '',
    scopes: {},
    elements: {},
  });

  history$: BehaviorSubject<HistoryState> = new BehaviorSubject({
    undoStack: [] as FlowchartState[],
    redoStack: [] as FlowchartState[]
  });

  constructor() { }

  public addElement(element: IElement, scopeId: string, previousId: string | null): string {
    const snapshot = this.getStateSnapshot(true);
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

    const scope = snapshot.scopes[scopeId];
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
      const previous = snapshot.elements[previousId];

      element.previousId = [...element.previousId, previous.id];
      element.nextId = previous.nextId;

      if (previous.nextId) {
        const next = snapshot.elements[previous.nextId];

        next.previousId = next.previousId.filter(x => x !== previous.id);
        next.previousId = [...next.previousId, element.id];
      }

      previous.nextId = element.id;

      if (previous.id === scope.endId) {
        scope.endId = element.id;
      }

    } else {
      if (scope.startId) {
        const start = snapshot.elements[scope.startId];

        start.previousId = [...start.previousId, element.id];
        element.nextId = start.id;
      }
      scope.startId = element.id;

      if (!scope.endId) {
        scope.endId = element.id;
      }
    }

    this.updateState(snapshot);

    return element.id;
  }

  public deleteElement(elementId: string) {
    const snapshot = this.getStateSnapshot(true);

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

    scope.elementsId = scope.elementsId.filter(id => id !== elementId);

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

    if (scope.startId === elementId) {
      scope.startId = element.nextId;
    }
    if (scope.endId === elementId) {
      scope.endId = element.previousId.length > 0 ? element.previousId[0] : null;
    }

    if (element instanceof ConditionElement) {
      if (element.positiveWayId) {
        this.deleteScopeRecursively(element.positiveWayId, snapshot);
        scope.childrenId = scope.childrenId.filter(id => id !== element.positiveWayId);
      }
      if (element.negativeWayId) {
        this.deleteScopeRecursively(element.negativeWayId, snapshot);
        scope.childrenId = scope.childrenId.filter(id => id !== element.negativeWayId);
      }
    } else if (isLoop(element)) {
      if (element.scopeId) {
        this.deleteScopeRecursively(element.scopeId, snapshot);
        scope.childrenId = scope.childrenId.filter(id => id !== element.scopeId);
      }
    }

    delete snapshot.elements[elementId];

    this.updateState(snapshot);
  }

  public editElement(element: IElement) {
    const snapshot = this.getStateSnapshot(true);
    let currentElement = snapshot.elements[element.id];

    if (!currentElement) {
      throw new Error(`Element with id ${element.id} doesn't exist`);
    }
    if (currentElement.constructor !== element.constructor) {
      throw new Error(
        `Cannot update elements with not matching types. Current: ${currentElement.constructor}, Edit: ${element.constructor}`
      );
    }

    currentElement = Object.assign(currentElement, element)

    snapshot.elements[currentElement.id] = currentElement;

    this.updateState(snapshot);
  }

  public getStateSnapshot(isCopied: boolean = false): FlowchartState {
    const value = this.current$.value;

    return !isCopied ? {
      selectedProcedureId: value.selectedProcedureId,
      scopes: { ...value.scopes },
      elements: { ...value.elements },
    } : {
      selectedProcedureId: value.selectedProcedureId,
      scopes: deepCloneMap(value.scopes),
      elements: deepCloneMap(value.elements),
    };
  };

  public initializeProcedure(name: string, isMain: boolean): FlowchartState {
    const snapshot = this.getStateSnapshot();

    const procedureScope = new Scope();

    const mainElement = new ProcedureElement(name, isMain, procedureScope.id);
    mainElement.id = crypto.randomUUID();

    const start = new TerminalElement(true);
    start.id = crypto.randomUUID();

    const end = new TerminalElement(false);
    end.id = crypto.randomUUID();

    procedureScope.startId = start.id;
    procedureScope.endId = end.id;
    procedureScope.elementsId = [procedureScope.startId, procedureScope.endId];

    start.nextId = end.id;
    end.previousId.push(start.id);

    start.inScopeId = procedureScope.id;
    end.inScopeId = procedureScope.id;

    snapshot.scopes[procedureScope.id] = procedureScope;

    snapshot.elements[mainElement.id] = mainElement;
    snapshot.elements[start.id] = start;
    snapshot.elements[end.id] = end;

    snapshot.selectedProcedureId = mainElement.id;

    return snapshot;
  }

  private deleteScopeRecursively(scopeId: string, snapshot: FlowchartState) {
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

  public goBackHistory() {
    const { undoStack, redoStack } = this.history$.value;
    const current = this.current$.value;

    if (undoStack.length === 0) {
      return;
    }

    const previous = undoStack[undoStack.length - 1];

    this.history$.next({
      undoStack: undoStack.slice(0, -1),
      redoStack: [...redoStack, current]
    });

    this.current$.next(previous);
  }

  public goForwardHistory() {
    const { undoStack, redoStack } = this.history$.value;
    const current = this.current$.value;

    if (redoStack.length === 0) {
      return;
    }

    const next = redoStack[redoStack.length - 1];

    this.history$.next({
      undoStack: [...undoStack, current],
      redoStack: redoStack.slice(0, -1)
    });

    this.current$.next(next);
  }

  public resetHistory() {
    this.history$.next({
      undoStack: [],
      redoStack: []
    });
  }

  public updateState(newState: FlowchartState, withHistory: boolean = true) {
    if (withHistory) {
      const current = this.getStateSnapshot(true);
      const history = this.history$.value;

      this.history$.next({
        undoStack: [...history.undoStack, current],
        redoStack: []
      });
    }

    this.current$.next(newState);
  }

  public resetState() {
    this.current$.next({
      selectedProcedureId: '',
      scopes: {},
      elements: {},
    });

    this.history$.next({
      undoStack: [],
      redoStack: []
    });
  }
}
