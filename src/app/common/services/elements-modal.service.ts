import { inject, Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DialogService } from 'primeng/dynamicdialog';
import {
  InputEditModalComponent
} from '../../domains/editor/elements/input-element/edit-modal/input-edit-modal.component';
import {
  OutputEditModalComponent
} from '../../domains/editor/elements/output-element/edit-modal/output-edit-modal.component';
import { InputElement, OutputElement } from '../models/element/element.model';

const defaultDialogOptions = {
  modal: true,
  closeOnEscape: true,
  closable: true,
  draggable: true,
  maximizable: false,
  resizable: false,
  position: 'center',
  duplicate: false,
}

@Injectable({
  providedIn: 'root'
})
export class ElementsModalService {
  private readonly dialog = inject(DialogService);
  private readonly translate = inject(TranslateService);

  openInputEditModal(element: InputElement) {
    return this.dialog.open(InputEditModalComponent, {
      ...defaultDialogOptions,
      inputValues: {
        element: element,
      },
      header: this.translate.instant('MODALS.INPUT.HEADER')
    })
  }

  openOutputEditModal(element: OutputElement) {
    return this.dialog.open(OutputEditModalComponent, {
      ...defaultDialogOptions,
      inputValues: {
        element: element,
      },
      header: this.translate.instant('MODALS.OUTPUT.HEADER')
    })
  }
}
