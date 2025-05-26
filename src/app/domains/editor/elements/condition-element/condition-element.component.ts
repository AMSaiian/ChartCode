import { Component } from '@angular/core';
import { ConditionElement } from '../../../../common/models/element/element.model';
import { ElementDirective } from '../element.directive';
import { ConditionShapeComponent } from '../../../../components/shapes/condition/condition-shape.component';

@Component({
  selector: '[condition-element]',
  imports: [
    ConditionShapeComponent,
  ],
  templateUrl: './condition-element.component.html'
})
export class ConditionElementComponent extends ElementDirective<ConditionElement> {

  constructor() {
    super();
  }

  openDetailsModal(event: MouseEvent): void {
    event.preventDefault();
    this.modalService.openConditionEditModal(this.element());
  }

  override transformElementData(element: ConditionElement): string {
    return element.conditionExpression.toReadable(true);
  }
}
