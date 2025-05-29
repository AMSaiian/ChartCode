import { NgClass } from '@angular/common';
import { Component, input, output } from '@angular/core';
import {
  BoolExpression,
  BoolExpressionType,
  BoolExpressionTypeMap,
  isNestedExpression,
} from '../../../../common/models/expression/expression.model';

@Component({
  selector: 'app-bool-expression-preview',
  imports: [
    NgClass,
  ],
  templateUrl: './bool-expression-preview.component.html',
  styleUrl: './bool-expression-preview.component.css'
})
export class BoolExpressionPreviewComponent {
  expression = input.required<BoolExpression>();
  isRoot = input.required<boolean>();
  expressionSelected = output<BoolExpression>();
  hovered = false;
  leftHovered = false;
  rightHovered = false;

  isNested = isNestedExpression;
  operatorsMap = BoolExpressionTypeMap;
  protected readonly BoolExpressionType = BoolExpressionType;
}

