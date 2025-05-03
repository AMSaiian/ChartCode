import { IElement } from '../models/element/element.interface';
import { ConditionElement, ForLoopElement, WhileLoopElement } from '../models/element/element.model';

export const isLoop = (element: IElement) =>
  element instanceof WhileLoopElement
  || element instanceof ForLoopElement;

export const isScopable = (element: IElement) =>
  element instanceof ConditionElement || isLoop(element);
