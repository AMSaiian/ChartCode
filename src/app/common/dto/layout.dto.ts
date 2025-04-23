import { IElement } from '../models/element/element.interface';

export interface NodeDto {
  element: IElement;
  x: number;
  y: number;
  width: number;
  height: number;
}
