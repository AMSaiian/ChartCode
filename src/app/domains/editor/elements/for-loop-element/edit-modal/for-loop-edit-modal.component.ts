import { Component, DestroyRef, inject, input, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputText } from 'primeng/inputtext';
import { Identifier, IdentifierArrayOrIntegerLiteral } from '../../../../../common/const/field-regex.const';
import { ForLoopElement } from '../../../../../common/models/element/element.model';
import {
  AssignExpression,
  BoolExpression,
  DataType,
  ValueType,
} from '../../../../../common/models/expression/expression.model';
import { FlowchartService } from '../../../../../common/services/flowchart.service';
import {
  BoolExpressionBuilderComponent
} from '../../../../../components/misc/bool-expression/builder/bool-expression-builder.component';

@Component({
  selector: 'app-for-loop-edit-modal',
  imports: [
    InputText,
    TranslatePipe,
    ReactiveFormsModule,
    ButtonModule,
    CheckboxModule,
    BoolExpressionBuilderComponent,
  ],
  templateUrl: './for-loop-edit-modal.component.html',
  styleUrl: './for-loop-edit-modal.component.css'
})
export class ForLoopEditModalComponent implements OnInit {
  element = input.required<ForLoopElement>();
  flowchart = inject(FlowchartService);
  dialogRef = inject(DynamicDialogRef);
  destroyRef = inject(DestroyRef);

  form!: FormGroup<{
    destination: FormControl<string | null>;
    startValue: FormControl<string | null>;
    isIncrement: FormControl<boolean | null>;
  }>;

  expression!: BoolExpression;

  isValid!: boolean;

  ngOnInit(): void {
    this.form = new FormGroup({
      destination: new FormControl(
        this.element().accumulator.destination, [
          Validators.required,
          Validators.pattern(Identifier),
        ]
      ),
      startValue: new FormControl(
        this.element().accumulator.assign as string, [
          Validators.required,
          Validators.pattern(IdentifierArrayOrIntegerLiteral),
        ]
      ),
      isIncrement: new FormControl(
        this.element().isIncrement
      )
    });

    this.form.valueChanges.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => {
      this.isValid = this.isValidForLoop();
    });

    this.expression = this.element().checkExpression.clone();
    this.isValid = this.isValidForLoop();
  }

  public onSave() {
    const newValue = this.form.value;
    const element = this.element();

    const accumulator = new AssignExpression(
      newValue.destination!,
      newValue.startValue!,
      true,
      new ValueType(DataType.Integer)
    );
    element.accumulator = accumulator;
    element.checkExpression = this.expression;
    element.isIncrement = newValue.isIncrement!;

    this.flowchart.editElement(element);
    this.dialogRef.close(element);
  }

  public onCancel() {
    this.dialogRef.close();
  }

  public isValidForLoop(): boolean {
    return this.form.valid && this.expression.isValid();
  }

  public onExpressionChanged($event: { expression: BoolExpression, isValid: boolean }) {
    this.isValid = this.isValidForLoop();
  }
}
