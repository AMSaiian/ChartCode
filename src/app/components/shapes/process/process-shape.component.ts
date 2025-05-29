import { Component } from '@angular/core';
import { ShapeDirective } from '../shape.directive';

@Component({
  selector: '[process-shape]',
  imports: [],
  templateUrl: './process-shape.component.html'
})
export class ProcessShapeComponent extends ShapeDirective {
}
