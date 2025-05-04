import { Component } from '@angular/core';
import { WhileLoopElement } from '../../../../common/models/element/element.model';
import { ConditionShapeComponent } from '../../../../components/shapes/condition/condition-shape.component';
import { ElementDirective } from '../element.directive';

@Component({
  selector: '[while-loop-element]',
  imports: [
    ConditionShapeComponent,
  ],
  templateUrl: './while-loop-element.component.html',
  styleUrl: './while-loop-element.component.css'
})
export class WhileLoopElementComponent extends ElementDirective<WhileLoopElement> {

  constructor() {
    super();
  }

  openDetailsModal(event: MouseEvent): void {
    event.preventDefault();
    console.log("modal while");
  }

  override transformElementData(element: WhileLoopElement): string {
    return element.id.slice(0, 8);
  }
}
