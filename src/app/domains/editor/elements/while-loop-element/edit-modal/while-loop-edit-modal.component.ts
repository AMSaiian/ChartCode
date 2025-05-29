import { Component, inject, input, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { Button } from 'primeng/button';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { WhileLoopElement } from '../../../../../common/models/element/element.model';
import { FlowchartRepository } from '../../../../../common/services/flowchart.repository';
import { BoolExpression } from '../../../../../common/models/expression/expression.model';
import {
  BoolExpressionBuilderComponent
} from '../../../../../components/misc/bool-expression/builder/bool-expression-builder.component';

@Component({
  selector: 'app-while-loop-edit-modal',
  imports: [
    Button,
    FormsModule,
    ReactiveFormsModule,
    TranslatePipe,
    BoolExpressionBuilderComponent,
  ],
  templateUrl: './while-loop-edit-modal.component.html'
})
export class WhileLoopEditModalComponent implements OnInit {
  element = input.required<WhileLoopElement>();
  flowchart = inject(FlowchartRepository);
  dialogRef = inject(DynamicDialogRef);

  expression!: BoolExpression;
  isExpressionValid!: boolean;

  ngOnInit(): void {
    this.expression = this.element().checkExpression.clone();
    this.isExpressionValid = this.expression.isValid();
  }

  public onSave() {
    const element = this.element();
    element.checkExpression = this.expression;

    this.flowchart.editElement(element);
    this.dialogRef.close(element);
  }

  public onCancel() {
    this.dialogRef.close();
  }

  public onExpressionChanged($event: { expression: BoolExpression, isValid: boolean }) {
    this.isExpressionValid = $event.isValid;
  }
}
