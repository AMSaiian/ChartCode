import { Component, input } from '@angular/core';
import { ShapeDirective } from '../shape.directive';

@Component({
  selector: '[terminal-shape]',
  imports: [],
  templateUrl: './terminal-shape.component.html',
  styleUrl: './terminal-shape.component.css'
})
export class TerminalShapeComponent extends ShapeDirective {
}
