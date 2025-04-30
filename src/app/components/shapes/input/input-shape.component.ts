import { Component, input } from '@angular/core';
import { DEFAULT_HEIGHT, DEFAULT_WIDTH } from '../../../common/dto/layout.dto';

@Component({
  selector: '[input-shape]',
  imports: [],
  templateUrl: './input-shape.component.html',
  styleUrl: './input-shape.component.css'
})
export class InputShapeComponent {
  displayInfo!: string;
  info = input.required<string>();

  getParallelogramPoints(width: number, height: number, offsetRatio: number = 0.25): string {
    const offset = width * offsetRatio;

    const points = [
      `${offset},0`,               // top-left
      `${width},0`,                // top-right
      `${width - offset},${height}`, // bottom-right
      `0,${height}`                // bottom-left
    ];

    return points.join(' ');
  }

  protected readonly DEFAULT_WIDTH = DEFAULT_WIDTH;
  protected readonly DEFAULT_HEIGHT = DEFAULT_HEIGHT;
}
