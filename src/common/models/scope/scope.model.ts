import * as crypto from 'node:crypto';
import { IScope } from './scope.interface';

export class Scope implements IScope {
  id: string;
  parentId: string | null = null;
  startId?: string;
  endId?: string;
  childrenId: string[] = [];
  elementsId: string[] = [];

  constructor() {
    this.id = crypto.randomUUID();
  }
}
