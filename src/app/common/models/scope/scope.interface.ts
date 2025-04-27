import { Clonable } from '../clonable';

type ScopeId = string;
type ElementId = string;

export interface IScope extends Clonable<IScope> {
  id: string;
  startId: ElementId | null;
  endId: ElementId | null;
  parentId: ScopeId | null;
  childrenId: ScopeId[];
  elementsId: ElementId[];
}

// export interface IScopeVariable {
//   initiatedAtId: ElementId | null;
//   variableId: VariableId;
// }
