import { Component } from '@angular/core';
import { ShapeDirective } from '../shape.directive';

@Component({
  selector: '[for-loop-shape]',
  imports: [],
  templateUrl: './for-loop-shape.component.html',
  styleUrl: './for-loop-shape.component.css'
})
export class ForLoopShapeComponent extends ShapeDirective {
  getHexagonPoints(width: number, height: number): string {
    const w = width;
    const h = height;
    const sideOffset = w / 6;

    const points = [
      `${sideOffset},0`,
      `${w - sideOffset},0`,
      `${w},${h / 2}`,
      `${w - sideOffset},${h}`,
      `${sideOffset},${h}`,
      `0,${h / 2}`
    ];

    return points.join(' ');
  }
}
