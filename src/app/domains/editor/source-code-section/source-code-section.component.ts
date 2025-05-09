import { AsyncPipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { FloatLabelModule } from 'primeng/floatlabel';
import { SelectModule } from 'primeng/select';
import { Observable, startWith, switchMap } from 'rxjs';
import { codegenTemplateList } from '../../../common/const/сode-template.const';
import { AppStateService } from '../../../common/services/app-state.service';

@Component({
  selector: 'app-source-code-section',
  imports: [
    ButtonModule,
    AsyncPipe,
    ReactiveFormsModule,
    FloatLabelModule,
    SelectModule,
    TranslatePipe,
  ],
  templateUrl: './source-code-section.component.html',
  styleUrl: './source-code-section.component.css'
})
export class SourceCodeSectionComponent implements OnInit {
  state = inject(AppStateService);
  isOpen = signal<boolean>(false);
  currentSourceCode!: Observable<string>;
  optionsForm!: FormGroup<{
    indentLength: FormControl<number | null | undefined>;
    indentStyle: FormControl<"allman" | "kr" | null | undefined>;
    language: FormControl<string | null>;
    useTabs: FormControl<boolean | null>
  }>;

  ngOnInit(): void {
    this.optionsForm = new FormGroup({
      language: new FormControl(this.languagesList[0].key),
      indentStyle: new FormControl<'allman' | 'kr' | undefined>(undefined),
      indentLength: new FormControl<number | undefined>(undefined),
      useTabs: new FormControl(false),
    });

    this.currentSourceCode = this.optionsForm.valueChanges.pipe(
      startWith(this.optionsForm.value),
      switchMap(x => this.state.getGeneratedCode(x.language!, {  }))
    );
  }

  onIsOpenClick() {
    this.isOpen.update((value) => !value);
  }

  languagesList = codegenTemplateList;
  stylesList = [{ key: 'allman', label: 'Allman' }, { key: 'kr', label: 'K&R' }];
}
