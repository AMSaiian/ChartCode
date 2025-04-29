import { Clonable } from '../clonable';

export interface IElement extends Clonable<IElement> {
  id: string;
  previousId: string[];
  nextId: string | null;
  inScopeId: string | null;
}
