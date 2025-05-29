import { Component } from '@angular/core';
import { ShapeDirective } from '../shape.directive';

@Component({
  selector: '[terminal-shape]',
  imports: [],
  templateUrl: './terminal-shape.component.html'
})
export class TerminalShapeComponent extends ShapeDirective {
}
