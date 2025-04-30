import { Component, input } from '@angular/core';
import { DEFAULT_HEIGHT, DEFAULT_WIDTH } from '../../../common/dto/layout.dto';

@Component({
  selector: '[terminal-shape]',
  imports: [],
  templateUrl: './terminal-shape.component.html',
  styleUrl: './terminal-shape.component.css'
})
export class TerminalShapeComponent {
  displayInfo!: string;
  info = input.required<string>();

  protected readonly DEFAULT_WIDTH = DEFAULT_WIDTH;
  protected readonly DEFAULT_HEIGHT = DEFAULT_HEIGHT;
}
