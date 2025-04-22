import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { IElement } from '../models/element/element.interface';
import { TerminalElement } from '../models/element/element.model';
import { Procedure } from '../models/scope/procedure/procedure.model';
import { IScope } from '../models/scope/scope.interface';

export interface AppState {
  scopes: Record<string, IScope>;
  elements: Record<string, IElement>;
}

@Injectable({
  providedIn: 'root'
})
export class AppStateService {
  state: BehaviorSubject<AppState> = new BehaviorSubject({
    scopes: {},
    elements: {},
  })

  public addElement(element: IElement, scopeId: string, previousId: string | null) {
    const snapshot = this.getStateSnapshot();

    const scope = snapshot.scopes[scopeId].clone();
    snapshot.scopes[scope.id] = scope;
    scope.elementsId = [...scope.elementsId, element.id];

    snapshot.elements[element.id] = element;

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

    this.state.next(snapshot);
  }

  public initializeDefault() {
    const snapshot = this.getStateSnapshot();

    const main = new Procedure('Main', true);
    const start = new TerminalElement(true);
    const end = new TerminalElement(false);
    main.startId = start.id;
    main.endId = end.id;
    main.elementsId = [main.startId, main.endId];

    start.nextId = end.id;
    end.previousId.push(start.id);

    snapshot.scopes[main.id] = main;

    snapshot.elements[start.id] = start;
    snapshot.elements[end.id] = end;

    this.state.next(snapshot);
  }

  public getStateSnapshot(): AppState {
    const value = this.state.value;

    return {
      scopes: { ...value.scopes },
      elements: { ...value.elements }
    };
  };
}
