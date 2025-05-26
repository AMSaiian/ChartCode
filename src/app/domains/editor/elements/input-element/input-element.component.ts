import { Component } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { InputElement } from '../../../../common/models/element/element.model';
import { InputShapeComponent } from '../../../../components/shapes/input/input-shape.component';
import { ElementDirective } from '../element.directive';

@Component({
  selector: '[input-element]',
  imports: [
    InputShapeComponent,
    DialogModule
  ],
  templateUrl: './input-element.component.html'
})
export class InputElementComponent extends ElementDirective<InputElement> {

  constructor() {
    super();
  }

  openDetailsModal(event: MouseEvent): void {
    event.preventDefault();
    this.modalService.openInputEditModal(this.element());
  }

  override transformElementData(element: InputElement): string {
    return `>> ${element.destination}`;
  }
}
