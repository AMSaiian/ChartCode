import { Scope } from '../scope.model';
import { IProcedure } from './procedure.interface';

type VariableId = string;
type AssignedId = string;
type ProcedureId = string;

export class Procedure extends Scope implements IProcedure {
  constructor(
    public name: string,
    public isMain: boolean = false,
  ) {
    super();
    this.isMain = isMain;
  }
}

