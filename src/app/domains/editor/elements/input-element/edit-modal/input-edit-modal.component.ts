import { Component, inject, input, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { IdentifierOrArrayAccess } from '../../../../../common/const/field-regex.const';
import { InputElement } from '../../../../../common/models/element/element.model';
import { DataType, DataTypeList } from '../../../../../common/models/expression/expression.model';
import { FlowchartService } from '../../../../../common/services/flowchart.service';

@Component({
  selector: 'app-input-edit-modal',
  imports: [
    InputText,
    TranslatePipe,
    ReactiveFormsModule,
    ButtonModule,
    Select,
  ],
  templateUrl: './input-edit-modal.component.html',
  styleUrl: './input-edit-modal.component.css'
})
export class InputEditModalComponent implements OnInit {
  element = input.required<InputElement>();
  flowchart = inject(FlowchartService);
  dialogRef = inject(DynamicDialogRef);

  form!: FormGroup<{
    destination: FormControl<string | null>;
    type: FormControl<DataType | null>;
  }>;

  ngOnInit(): void {
    this.form = new FormGroup({
      destination: new FormControl(
        this.element().destination, [
          Validators.required,
          Validators.pattern(IdentifierOrArrayAccess),
        ]
      ),
      type: new FormControl(this.element().type, [Validators.required]),
    });
  }

  public onSave() {
    const newValue = this.form.value;
    const element = this.element();
    Object.assign(element, newValue);

    this.flowchart.editElement(element);
    this.dialogRef.close(element);
  }

  public onCancel() {
    this.dialogRef.close();
  }

  protected readonly dataTypes = DataTypeList;
}
