import { Component } from '@angular/core';
import { ShapeDirective } from '../shape.directive';

@Component({
  selector: '[condition-shape]',
  imports: [],
  templateUrl: './condition-shape.component.html'
})
export class ConditionShapeComponent extends ShapeDirective {
  getDiamondPoints(width: number, height: number): string {
    const cx = width / 2;
    const cy = height / 2;

    const points = [
      `${cx},0`,
      `${width},${cy}`,
      `${cx},${height}`,
      `0,${cy}`
    ];

    return points.join(' ');
  }
}

