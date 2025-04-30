import { Component, input } from '@angular/core';
import { DEFAULT_HEIGHT, DEFAULT_WIDTH } from '../../../common/dto/layout.dto';
import { ShapeDirective } from '../shape.directive';

@Component({
  selector: '[while-loop-shape]',
  imports: [],
  templateUrl: './while-loop-shape.component.html',
  styleUrl: './while-loop-shape.component.css'
})
export class WhileLoopShapeComponent extends ShapeDirective {
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
