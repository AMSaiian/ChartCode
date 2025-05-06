import { NgClass } from '@angular/common';
import { Component, input, output } from '@angular/core';
import {
  ArithmeticExpression,
  ArithmeticExpressionTypeMap,
  isNestedExpression,
} from '../../../../common/models/expression/expression.model';

@Component({
  selector: 'app-arithmetic-expression-preview',
  imports: [
    NgClass,
  ],
  templateUrl: './arithmetic-expression-preview.component.html',
  styleUrl: './arithmetic-expression-preview.component.css'
})
export class ArithmeticExpressionPreviewComponent {
  expression = input.required<ArithmeticExpression>();
  isRoot = input.required<boolean>();
  expressionSelected = output<ArithmeticExpression>();
  hovered = false;
  leftHovered = false;
  rightHovered = false;

  isNested = isNestedExpression;
  operatorsMap = ArithmeticExpressionTypeMap;
}

