import { Clonable } from '../models/clonable';
import { IElement } from '../models/element/element.interface';
import { ConditionElement, ForLoopElement, WhileLoopElement } from '../models/element/element.model';

export const isLoop = (element: IElement) =>
  element instanceof WhileLoopElement
  || element instanceof ForLoopElement;

export const isScopable = (element: IElement) =>
  element instanceof ConditionElement || isLoop(element);

export function deepCloneMap<T extends Clonable<T>>(input: Record<string, T>): Record<string, T> {
  const output: Record<string, T> = {};
  for (const [key, value] of Object.entries(input)) {
    output[key] = value.clone();
  }
  return output;
}
