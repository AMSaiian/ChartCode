import { Component, input, OnInit, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { Divider } from 'primeng/divider';
import { ArithmeticExpression } from '../../../../common/models/expression/expression.model';
import {
  ArithmeticExpressionEditorComponent
} from '../editor/arithmetic-expression-editor.component';
import {
  ArithmeticExpressionPreviewComponent
} from '../preview/arithmetic-expression-preview.component';

@Component({
  selector: 'app-arithmetic-expression-builder',
  imports: [
    FormsModule,
    ArithmeticExpressionPreviewComponent,
    ArithmeticExpressionEditorComponent,
    TranslatePipe,
    Divider,
  ],
  templateUrl: './arithmetic-expression-builder.component.html',
  styleUrl: './arithmetic-expression-builder.component.css'
})
export class ArithmeticExpressionBuilderComponent implements OnInit {
  root = input.required<ArithmeticExpression>();
  rootChanged = output<{ expression: ArithmeticExpression, isValid: boolean }>();

  selected!: ArithmeticExpression;
  isValid!: boolean;

  ngOnInit() {
    this.selected = this.root();
    this.isValid = this.root().isValid();
  }

  selectExpression(expr: ArithmeticExpression) {
    this.selected = expr;
  }

  public onExpressionChanged(event: ArithmeticExpression) {
    this.selected = event;
    this.rootChanged.emit({ expression: this.root(), isValid: this.root().isValid() });
  }
}
