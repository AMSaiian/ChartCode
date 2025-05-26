import { Component, input, output } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import {
  BoolExpression, BoolExpressionType, BoolExpressionTypeList,
  isNestedExpression,
} from '../../../../common/models/expression/expression.model';

@Component({
  selector: 'app-bool-expression-editor',
  imports: [
    FormsModule,
    InputText,
    ReactiveFormsModule,
    TranslatePipe,
    Button,
    Select,
  ],
  templateUrl: './bool-expression-editor.component.html'
})
export class BoolExpressionEditorComponent {
  expression = input.required<BoolExpression>();
  expressionChanged = output<BoolExpression>();

  operators = BoolExpressionTypeList;

  isNested = isNestedExpression;

  makeNested(side: 'left' | 'right') {
    const nested = new BoolExpression('', BoolExpressionType.Equals, '');
    this.expression()[`${side}Operand`] = nested;
    this.expressionChanged.emit(this.expression());
  }

  makeSimple(side: 'left' | 'right') {
    this.expression()[`${side}Operand`] = '';
    this.expressionChanged.emit(this.expression());
  }

  public onOperatorChanged($event: BoolExpressionType) {
    if ($event === BoolExpressionType.Not) {
      this.expression().rightOperand = undefined;
    }

    this.expression().expressionType = $event;
    this.expressionChanged.emit(this.expression())
  }

  protected readonly BoolExpressionType = BoolExpressionType;
}
