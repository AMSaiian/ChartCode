import { inject, Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DialogService } from 'primeng/dynamicdialog';
import {
  AssignEditModalComponent
} from '../../domains/editor/elements/assign-element/edit-modal/assign-edit-modal.component';
import {
  ConditionEditModalComponent
} from '../../domains/editor/elements/condition-element/edit-modal/condition-edit-modal.component';
import {
  InputEditModalComponent
} from '../../domains/editor/elements/input-element/edit-modal/input-edit-modal.component';
import {
  OutputEditModalComponent
} from '../../domains/editor/elements/output-element/edit-modal/output-edit-modal.component';
import {
  WhileLoopEditModalComponent
} from '../../domains/editor/elements/while-loop-element/edit-modal/while-loop-edit-modal.component';
import {
  AssignElement,
  ConditionElement,
  InputElement,
  OutputElement,
  WhileLoopElement,
} from '../models/element/element.model';

const defaultDialogOptions = {
  modal: true,
  closeOnEscape: true,
  closable: true,
  draggable: false,
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

  openAssignEditModal(element: AssignElement) {
    return this.dialog.open(AssignEditModalComponent, {
      ...defaultDialogOptions,
      inputValues: {
        element: element,
      },
      header: this.translate.instant('MODALS.ASSIGN.HEADER')
    })
  }

  openConditionEditModal(element: ConditionElement) {
    return this.dialog.open(ConditionEditModalComponent, {
      ...defaultDialogOptions,
      inputValues: {
        element: element,
      },
      header: this.translate.instant('MODALS.CONDITION.HEADER')
    })
  }

  openWhileLoopEditModal(element: WhileLoopElement) {
    return this.dialog.open(WhileLoopEditModalComponent, {
      ...defaultDialogOptions,
      inputValues: {
        element: element,
      },
      header: this.translate.instant('MODALS.WHILE_LOOP.HEADER')
    })
  }
}
