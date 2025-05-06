import { Component, DestroyRef, inject, input, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { Button } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import {
  IdentifierOrArrayAccess,
  IdentifierOrArrayAccessOrLiteral,
} from '../../../../../common/const/field-regex.const';
import { AssignElement } from '../../../../../common/models/element/element.model';
import {
  ArithmeticExpression,
  ArithmeticExpressionType,
  BoolExpression, BoolExpressionType,
  DataType,
  DataTypeList,
  isNestedExpression,
} from '../../../../../common/models/expression/expression.model';
import { InstanceofPipe } from '../../../../../common/pipes/instance-of.pipe';
import { FlowchartService } from '../../../../../common/services/flowchart.service';
import {
  ArithmeticExpressionBuilderComponent
} from '../../../../../components/misc/arithmetic-expression/builder/arithmetic-expression-builder.component';
import {
  BoolExpressionBuilderComponent
} from '../../../../../components/misc/bool-expression/builder/bool-expression-builder.component';

@Component({
  selector: 'app-assign-edit-modal',
  imports: [
    Button,
    ReactiveFormsModule,
    TranslatePipe,
    InputTextModule,
    CheckboxModule,
    SelectModule,
    InputNumberModule,
    InstanceofPipe,
    ArithmeticExpressionBuilderComponent,
    BoolExpressionBuilderComponent,
  ],
  templateUrl: './assign-edit-modal.component.html',
  styleUrl: './assign-edit-modal.component.css'
})
export class AssignEditModalComponent implements OnInit {
  element = input.required<AssignElement>();
  flowchart = inject(FlowchartService);

  expression?: ArithmeticExpression | BoolExpression;
  isExpressionValid?: boolean;
  dataTypes = DataTypeList;

  form!: FormGroup;
  isValid!: boolean;

  destroyRef = inject(DestroyRef);
  dialogRef = inject(DynamicDialogRef);

  ngOnInit(): void {
    this.form = this.initForm();

    if (isNestedExpression(this.element().expression.assign)) {
      this.expression = (this.element().expression.assign as ArithmeticExpression | BoolExpression).clone();
      this.isExpressionValid = this.expression.isValid();
    }

    this.form.controls['dataType'].valueChanges.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(value => {
      if (value === DataType.String ||
          ((value === DataType.Integer || value === DataType.Float) && this.expression instanceof BoolExpression) ||
          (value === DataType.Boolean && this.expression instanceof ArithmeticExpression)
      ) {
        this.expression = undefined;
        this.isExpressionValid = undefined;
      }
    });

    this.form.controls['isCollection'].valueChanges.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(value => {
      if (value) {
        this.expression = undefined;
        this.isExpressionValid = undefined;
      } else {
        this.form.controls['length'].setValue(undefined);
      }
    });

    this.form.valueChanges.pipe(
      takeUntilDestroyed(this.destroyRef)).subscribe(() => {
        this.isValid = this.isValidAssigning();
    })

    this.isValid = this.isValidAssigning();
    console.log("Init:", this.element()); // TODO DELETE
  }

  public onSave() {
    const formValue = this.form.value;
    let element = this.element();

    element = this.updateElementValue(element, formValue);

    this.flowchart.editElement(element);
    this.dialogRef.close(element);
    console.log("Edited:", element); // TODO DELETE
  }

  public onCancel() {
    this.dialogRef.close();
  }

  public onAddExpression() {
    if (this.form.controls['dataType'].value === DataType.Integer ||
        this.form.controls['dataType'].value === DataType.Float
    ) {
      this.expression = new ArithmeticExpression(
        this.form.controls['assign'].value ?? '',
        ArithmeticExpressionType.Add,
        '1'
      );
    } else if (this.form.controls['dataType'].value === DataType.Boolean) {
      this.expression = new BoolExpression(
        this.form.controls['assign'].value ?? '',
        BoolExpressionType.Equals,
        'true'
      );
    }

    this.isExpressionValid = this.expression!.isValid();
  }

  public onExpressionChanged(event: { expression: ArithmeticExpression | BoolExpression, isValid: boolean }) {
    this.isExpressionValid = event.isValid
    this.isValid = this.isValidAssigning();
  }

  public onDeleteExpression() {
    this.expression = undefined;
    this.isExpressionValid = undefined;
  }

  public isValidAssigning(): boolean {
    if (this.expression) {
      return this.isExpressionValid === true && this.form.controls['destination'].valid;
    }
    if (this.form.controls['isCollection'].value === true &&
        this.form.controls['isNew'].value === true
    ) {
      return this.form.controls['destination'].valid && this.form.controls['length'].valid;
    }
    return this.form.controls['destination'].valid && this.form.controls['assign'].valid;
  }

  private initForm() {
    return new FormGroup({
      destination: new FormControl(
        this.element().expression.destination, [
          Validators.required,
          Validators.pattern(IdentifierOrArrayAccess),
        ]
      ),
      assign: new FormControl(
        isNestedExpression(this.element().expression.assign)
        ? ''
        : this.element().expression.assign as string, [
          Validators.required,
          Validators.pattern(IdentifierOrArrayAccessOrLiteral),
        ]
      ),
      isNew: new FormControl(this.element().expression.isNew),
      dataType: new FormControl(this.element().expression.type.type),
      isCollection: new FormControl(this.element().expression.type.isCollection ),
      length: new FormControl(this.element().expression.type.length, [
        Validators.required,
        Validators.min(0)
      ]),
    });
  }

  private updateElementValue(element: AssignElement, formValue: any): AssignElement {
    element.expression.destination = formValue.destination;
    element.expression.isNew = formValue.isNew;
    element.expression.type.isCollection = formValue.isCollection;
    element.expression.type.type = formValue.dataType;
    element.expression.type.length = formValue.length;

    if (this.expression) {
      element.expression.assign = this.expression;
    } else {
      element.expression.assign = formValue.assign;
    }
    if (formValue.isCollection === true && formValue.isNew === true) {
      element.expression.assign = '';
    }

    return element;
  }

  protected readonly DataType = DataType;
  protected readonly ArithmeticExpression = ArithmeticExpression;
  protected readonly BoolExpression = BoolExpression;
}
