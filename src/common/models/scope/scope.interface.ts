type ScopeId = string;
type ElementId = string;

export interface IScope {
  id: string;
  startId?: ElementId;
  endId?: ElementId;
  parentId: ScopeId | null;
  childrenId: ScopeId[];
  elementsId: ElementId[];
}

// export interface IScopeVariable {
//   initiatedAtId: ElementId | null;
//   variableId: VariableId;
// }
