import { Component } from '@angular/core';
import { ConditionElement } from '../../../../common/models/element/element.model';
import { ElementDirective } from '../element.directive';
import { ConditionShapeComponent } from '../../../../components/shapes/condition/condition-shape.component';

@Component({
  selector: '[condition-element]',
  imports: [
    ConditionShapeComponent,
  ],
  templateUrl: './condition-element.component.html',
  styleUrl: './condition-element.component.css'
})
export class ConditionElementComponent extends ElementDirective<ConditionElement> {

  constructor() {
    super();
  }

  openDetailsModal(event: MouseEvent): void {
    event.preventDefault();
    console.log("modal condition");
  }

  override transformElementData(element: ConditionElement): string {
    return element.id.slice(0, 8);
  }
}
