import { Component } from '@angular/core';
import { OutputElement } from '../../../../common/models/element/element.model';
import { InputShapeComponent } from '../../../../components/shapes/input/input-shape.component';
import { ElementDirective } from '../element.directive';

@Component({
  selector: '[output-element]',
  imports: [
    InputShapeComponent,
  ],
  templateUrl: './output-element.component.html',
  styleUrl: './output-element.component.css'
})
export class OutputElementComponent extends ElementDirective<OutputElement> {

  constructor() {
    super();
  }

  openDetailsModal(event: MouseEvent): void {
    event.preventDefault();
    this.modalService.openOutputEditModal(this.element());
  }

  override transformElementData(element: OutputElement): string {
    return `<< ${element.source}`;
  }
}
