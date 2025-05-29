import { Component } from '@angular/core';
import { ForLoopElement } from '../../../../common/models/element/element.model';
import { ForLoopShapeComponent } from '../../../../components/shapes/for-loop/for-loop-shape.component';
import { ElementDirective } from '../element.directive';

@Component({
  selector: '[for-loop-element]',
  imports: [
    ForLoopShapeComponent,
  ],
  templateUrl: './for-loop-element.component.html'
})
export class ForLoopElementComponent extends ElementDirective<ForLoopElement> {

  constructor() {
    super();
  }

  openDetailsModal(event: MouseEvent): void {
    event.preventDefault();
    this.modalService.openForLoopEditModal(this.element());
  }

  override transformElementData(element: ForLoopElement): string {
    return `
    ${element.accumulator.destination} := ${(element.accumulator.assign as string)};
    ${element.checkExpression.toReadable(true)};
    ${element.accumulator.destination}${element.isIncrement ? '++' : '--'}`;
  }
}
