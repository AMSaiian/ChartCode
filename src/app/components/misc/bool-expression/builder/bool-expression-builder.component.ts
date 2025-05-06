import { Component, input, OnInit, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { Divider } from 'primeng/divider';
import { BoolExpression } from '../../../../common/models/expression/expression.model';
import {
  BoolExpressionEditorComponent
} from '../editor/bool-expression-editor.component';
import {
  BoolExpressionPreviewComponent
} from '../preview/bool-expression-preview.component';

@Component({
  selector: 'app-bool-expression-builder',
  imports: [
    FormsModule,
    BoolExpressionPreviewComponent,
    BoolExpressionEditorComponent,
    TranslatePipe,
    Divider,
  ],
  templateUrl: './bool-expression-builder.component.html',
  styleUrl: './bool-expression-builder.component.css'
})
export class BoolExpressionBuilderComponent implements OnInit {
  root = input.required<BoolExpression>();
  rootChanged = output<{ expression: BoolExpression, isValid: boolean }>();

  selected!: BoolExpression;
  isValid!: boolean;

  ngOnInit() {
    this.selected = this.root();
    this.isValid = this.root().isValid();
  }

  selectExpression(expr: BoolExpression) {
    this.selected = expr;
  }

  public onExpressionChanged(event: BoolExpression) {
    this.selected = event;
    this.rootChanged.emit({ expression: this.root(), isValid: this.root().isValid() });
  }
}
