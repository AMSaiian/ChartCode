import { Component, input, output } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import {
  ArithmeticExpression,
  ArithmeticExpressionType,
  ArithmeticExpressionTypeList,
  isNestedExpression,
} from '../../../../common/models/expression/expression.model';

@Component({
  selector: 'app-arithmetic-expression-editor',
  imports: [
    FormsModule,
    InputText,
    ReactiveFormsModule,
    TranslatePipe,
    Button,
    Select,
  ],
  templateUrl: './arithmetic-expression-editor.component.html',
  styleUrl: './arithmetic-expression-editor.component.css'
})
export class ArithmeticExpressionEditorComponent {
  expression = input.required<ArithmeticExpression>();
  expressionChanged = output<ArithmeticExpression>();

  operators = ArithmeticExpressionTypeList;

  isNested = isNestedExpression;

  makeNested(side: 'left' | 'right') {
    const nested = new ArithmeticExpression('', ArithmeticExpressionType.Add, '');
    this.expression()[`${side}Operand`] = nested;
    this.expressionChanged.emit(this.expression());
  }

  makeSimple(side: 'left' | 'right') {
    this.expression()[`${side}Operand`] = '';
    this.expressionChanged.emit(this.expression());
  }

  public onOperatorChanged($event: ArithmeticExpressionType) {
    this.expression().expressionType = $event;

    this.expressionChanged.emit(this.expression());
  }
}
