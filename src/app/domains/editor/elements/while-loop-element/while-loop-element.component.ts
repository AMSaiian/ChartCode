import { Component } from '@angular/core';
import { WhileLoopElement } from '../../../../common/models/element/element.model';
import { ConditionShapeComponent } from '../../../../components/shapes/condition/condition-shape.component';
import { ElementDirective } from '../element.directive';

@Component({
  selector: '[while-loop-element]',
  imports: [
    ConditionShapeComponent,
  ],
  templateUrl: './while-loop-element.component.html'
})
export class WhileLoopElementComponent extends ElementDirective<WhileLoopElement> {

  constructor() {
    super();
  }

  openDetailsModal(event: MouseEvent): void {
    event.preventDefault();
    this.modalService.openWhileLoopEditModal(this.element());
  }

  override transformElementData(element: WhileLoopElement): string {
    return element.checkExpression.toReadable(true);
  }
}
