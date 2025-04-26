import { Clonable } from '../clonable';

type ScopeId = string;
type ElementId = string;
export type ScopeType = 'procedure' | 'loop' | 'positive' | 'negative'

export interface IScope extends Clonable<IScope> {
  id: string;
  startId: ElementId | null;
  endId: ElementId | null;
  parentId: ScopeId | null;
  childrenId: ScopeId[];
  elementsId: ElementId[];
  type: ScopeType
}

// export interface IScopeVariable {
//   initiatedAtId: ElementId | null;
//   variableId: VariableId;
// }
