import { Component, input } from '@angular/core';
import { DEFAULT_HEIGHT, DEFAULT_WIDTH } from '../../../common/dto/layout.dto';

@Component({
  selector: '[condition-shape]',
  imports: [],
  templateUrl: './condition-shape.component.html',
  styleUrl: './condition-shape.component.css'
})
export class ConditionShapeComponent {
  displayInfo!: string;
  info = input.required<string>();

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

  protected readonly DEFAULT_WIDTH = DEFAULT_WIDTH;
  protected readonly DEFAULT_HEIGHT = DEFAULT_HEIGHT;
}

