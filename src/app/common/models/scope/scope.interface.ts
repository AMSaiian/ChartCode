import { Clonable } from '../clonable';

export interface IScope extends Clonable<IScope> {
  id: string;
  startId: string | null;
  endId: string | null;
  parentId: string | null;
  childrenId: string[];
  elementsId: string[];
}
