import { Component, inject, input } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { Button } from 'primeng/button';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputText } from 'primeng/inputtext';
import { AssignElement } from '../../../../../common/models/element/element.model';
import {
  ArithmeticExpression,
  ArithmeticExpressionType,
} from '../../../../../common/models/expression/expression.model';
import { FlowchartService } from '../../../../../common/services/flowchart.service';
import {
  ArithmeticExpressionBuilderComponent
} from '../../../../../components/misc/arithmetic-expression/builder/arithmetic-expression-builder.component';

@Component({
  selector: 'app-assign-edit-modal',
  imports: [
    Button,
    ReactiveFormsModule,
    TranslatePipe,
    ArithmeticExpressionBuilderComponent,
  ],
  templateUrl: './assign-edit-modal.component.html',
  styleUrl: './assign-edit-modal.component.css'
})
export class AssignEditModalComponent {
  element = input.required<AssignElement>();
  flowchart = inject(FlowchartService);
  dialogRef = inject(DynamicDialogRef);
  root = new ArithmeticExpression('x', ArithmeticExpressionType.Add, '1');
  isValid = false;

  // form!: FormGroup<{
  //   destination: FormControl<string | null>;
  // }>;

  ngOnInit(): void {
    // this.form = new FormGroup({
    //   destination: new FormControl(
    //     this.element().destination, [
    //       Validators.required,
    //       Validators.pattern(IdentifierOrArrayAccess),
    //     ]
    //   ),
    // });
  }

  public onSave() {
    // const newValue = this.form.value;
    const element = this.element();
    // Object.assign(element, newValue);

    this.flowchart.editElement(element);
    this.dialogRef.close(element);
  }

  public onCancel() {
    this.dialogRef.close();
  }
}
