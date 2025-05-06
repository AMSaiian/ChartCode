import { Component } from '@angular/core';
import { AssignElement } from '../../../../common/models/element/element.model';
import { isNestedExpression } from '../../../../common/models/expression/expression.model';
import { ProcessShapeComponent } from '../../../../components/shapes/process/process-shape.component';
import { ElementDirective } from '../element.directive';

@Component({
  selector: '[assign-element]',
  imports: [
    ProcessShapeComponent,
  ],
  templateUrl: './assign-element.component.html',
  styleUrl: './assign-element.component.css'
})
export class AssignElementComponent extends ElementDirective<AssignElement> {
  constructor() {
    super();
  }

  openDetailsModal(event: MouseEvent): void {
    event.preventDefault();
    this.modalService.openAssignEditModal(this.element());
  }


  override transformElementData(element: AssignElement): string {
    const assignPart = isNestedExpression(element.expression.assign)
                       ? element.expression.assign.toReadable(true)
                       : element.expression.type.isCollection && element.expression.isNew
                         ? `[ ] L=${element.expression.type.length}`
                         : element.expression.assign;

    return `${element.expression.destination} := ${assignPart}`
  }
}
