import { IScope } from './scope.interface';

export class Scope implements IScope {
  id: string;
  parentId: string | null = null;
  startId: string | null = null;
  endId: string | null = null;
  childrenId: string[] = [];
  elementsId: string[] = [];

  constructor() {
    this.id = crypto.randomUUID();
  }

  clone(): Scope {
    const base = new Scope();
    return this.copyBaseTo(base);
  }

  protected copyBaseTo<T extends Scope>(target: T): T {
    target.id = this.id;
    target.parentId = this.parentId;
    target.startId = this.startId;
    target.endId = this.endId;
    target.childrenId = [...this.childrenId];
    target.elementsId = [...this.elementsId];

    return target;
  }
}
