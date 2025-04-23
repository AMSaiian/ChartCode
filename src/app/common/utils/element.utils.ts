import { IElement } from '../models/element/element.interface';
import { DoLoopElement, ForLoopElement, WhileLoopElement } from '../models/element/element.model';

export const isLoop = (element: IElement) =>
  element instanceof DoLoopElement
  || element instanceof WhileLoopElement
  || element instanceof ForLoopElement;
