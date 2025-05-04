import { Component } from '@angular/core';
import { AssignElement } from '../../../../common/models/element/element.model';
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
    return element.id.slice(0, 8);
  }
}
