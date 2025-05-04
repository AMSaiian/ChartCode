import { Component } from '@angular/core';
import { ForLoopElement } from '../../../../common/models/element/element.model';
import { ForLoopShapeComponent } from '../../../../components/shapes/for-loop/for-loop-shape.component';
import { ElementDirective } from '../element.directive';

@Component({
  selector: '[for-loop-element]',
  imports: [
    ForLoopShapeComponent,
  ],
  templateUrl: './for-loop-element.component.html',
  styleUrl: './for-loop-element.component.css'
})
export class ForLoopElementComponent extends ElementDirective<ForLoopElement> {

  constructor() {
    super();
  }

  openDetailsModal(event: MouseEvent): void {
    event.preventDefault();
    console.log("modal condition");
  }

  override transformElementData(element: ForLoopElement): string {
    return element.id.slice(0, 8);
  }
}
