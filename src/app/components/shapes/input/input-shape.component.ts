import { Component } from '@angular/core';
import { ShapeDirective } from '../shape.directive';

@Component({
  selector: '[input-shape]',
  imports: [],
  templateUrl: './input-shape.component.html',
  styleUrl: './input-shape.component.css'
})
export class InputShapeComponent extends ShapeDirective {
  getParallelogramPoints(width: number, height: number, offsetRatio: number = 0.25): string {
    const offset = width * offsetRatio;

    const points = [
      `${offset},0`,
      `${width},0`,
      `${width - offset},${height}`,
      `0,${height}`
    ];

    return points.join(' ');
  }
}
