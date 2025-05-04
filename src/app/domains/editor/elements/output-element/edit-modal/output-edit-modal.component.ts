import { Component, inject, input, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { Button } from 'primeng/button';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputText } from 'primeng/inputtext';
import { IdentifierOrArrayAccess } from '../../../../../common/const/field-regex.const';
import { OutputElement } from '../../../../../common/models/element/element.model';
import { FlowchartService } from '../../../../../common/services/flowchart.service';

@Component({
  selector: 'app-output-edit-modal',
  imports: [
    InputText,
    TranslatePipe,
    ReactiveFormsModule,
    Button,
  ],
  templateUrl: './output-edit-modal.component.html',
  styleUrl: './output-edit-modal.component.css'
})
export class OutputEditModalComponent implements OnInit {
  element = input.required<OutputElement>();
  flowchart = inject(FlowchartService);
  dialogRef = inject(DynamicDialogRef);

  form!: FormGroup<{
    source: FormControl<string | null>;
  }>;

  ngOnInit(): void {
    this.form = new FormGroup({
      source: new FormControl(
        this.element().source, [
          Validators.required,
          Validators.pattern(IdentifierOrArrayAccess),
        ]
      ),
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
}
