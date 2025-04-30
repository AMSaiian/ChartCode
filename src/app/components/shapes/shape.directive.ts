import { Directive, input } from '@angular/core';
import { DEFAULT_HEIGHT, DEFAULT_WIDTH } from '../../common/dto/layout.dto';

@Directive()
export class ShapeDirective {
  displayInfo!: string;
  info = input.required<string>();

  constructor() { }

  protected readonly DEFAULT_WIDTH = DEFAULT_WIDTH;
  protected readonly DEFAULT_HEIGHT = DEFAULT_HEIGHT;
}
