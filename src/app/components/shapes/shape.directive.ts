import { computed, Directive, input, signal } from '@angular/core';
import { DEFAULT_HEIGHT, DEFAULT_WIDTH } from '../../common/dto/layout.dto';

@Directive()
export class ShapeDirective {
  displayInfo!: string;
  info = input.required<string>();

  isSelected = input<boolean>(false);
  isHovered = signal<boolean>(false);

  constructor() { }

  protected readonly DEFAULT_WIDTH = DEFAULT_WIDTH;
  protected readonly DEFAULT_HEIGHT = DEFAULT_HEIGHT;

  strokeColor = computed(() => {
    const isSelected = this.isSelected();
    const isHovered = this.isHovered();

    return isHovered
           ? '#800000'
           : isSelected
             ? '#D22B2B'
             : '#000000';
  });
}
