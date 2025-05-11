import { Component, inject, input, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { Button } from 'primeng/button';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { ConditionElement } from '../../../../../common/models/element/element.model';
import { FlowchartService } from '../../../../../common/services/flowchart.service';
import { BoolExpression } from '../../../../../common/models/expression/expression.model';
import {
  BoolExpressionBuilderComponent
} from '../../../../../components/misc/bool-expression/builder/bool-expression-builder.component';

@Component({
  selector: 'app-condition-edit-modal',
  imports: [
    Button,
    FormsModule,
    ReactiveFormsModule,
    TranslatePipe,
    BoolExpressionBuilderComponent,
  ],
  templateUrl: './condition-edit-modal.component.html',
  styleUrl: './condition-edit-modal.component.css'
})
export class ConditionEditModalComponent implements OnInit {
  element = input.required<ConditionElement>();
  flowchart = inject(FlowchartService);
  dialogRef = inject(DynamicDialogRef);

  expression!: BoolExpression;
  isExpressionValid!: boolean;

  ngOnInit(): void {
    this.expression = this.element().conditionExpression.clone();
    this.isExpressionValid = this.expression.isValid();
  }

  public onSave() {
    const element = this.element();
    element.conditionExpression = this.expression;

    this.flowchart.editElement(element);
    this.dialogRef.close(element);
  }

  public onCancel() {
    this.dialogRef.close();
  }

  public onExpressionChanged($event: { expression: BoolExpression, isValid: boolean }) {
    this.expression = $event.expression;
    this.isExpressionValid = this.expression.isValid();
  }
}
