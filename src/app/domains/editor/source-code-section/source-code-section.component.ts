import { AsyncPipe } from '@angular/common';
import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { FloatLabelModule } from 'primeng/floatlabel';
import { IftaLabelModule } from 'primeng/iftalabel';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { ToggleButton } from 'primeng/togglebutton';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { defer, map, Observable, startWith, switchMap } from 'rxjs';
import { codegenTemplateList, CodegenTemplates } from '../../../common/const/сode-template.const';
import { AppCoordinator } from '../../../common/services/app-coordinator';

@Component({
  selector: 'app-source-code-section',
  imports: [
    ButtonModule,
    AsyncPipe,
    ReactiveFormsModule,
    FloatLabelModule,
    SelectModule,
    InputNumberModule,
    TranslatePipe,
    ToggleSwitchModule,
    IftaLabelModule,
    ToggleButton,
  ],
  templateUrl: './source-code-section.component.html',
  styleUrl: './source-code-section.component.css'
})
export class SourceCodeSectionComponent implements OnInit {
  state = inject(AppCoordinator);
  isOpen = signal<boolean>(false);
  currentSourceCode!: Observable<string>;
  optionsForm!: FormGroup<{
    indentLength: FormControl<number | null | undefined>;
    indentStyle: FormControl<"allman" | "kr" | null | undefined>;
    language: FormControl<string | null>;
    useSpaces: FormControl<boolean | null>
  }>;

  lastLanguage!: string;

  destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    const initialLanguage = this.languagesList[0].key;
    this.lastLanguage = initialLanguage;

    this.optionsForm = new FormGroup({
      language: new FormControl(initialLanguage),
      indentStyle: new FormControl<'allman' | 'kr' | undefined>(CodegenTemplates[initialLanguage].style),
      indentLength: new FormControl<number | undefined>(CodegenTemplates[initialLanguage].indentSize),
      useSpaces: new FormControl(CodegenTemplates[initialLanguage].indentChar === ' '),
    });

    this.currentSourceCode = defer(() =>
      this.optionsForm.valueChanges.pipe(
        startWith(this.optionsForm.value),
        map(x => {
          const prevLanguage = this.lastLanguage;
          this.lastLanguage = x.language!;

          let nextOptions;
          if (x.language !== prevLanguage) {
            nextOptions = {
              ...this.getLanguageDefaultOptions(x.language!),
              language: x.language,
            }

            this.optionsForm.patchValue(
              nextOptions,
              { emitEvent: false }
            );
          } else {
            nextOptions = x;
          }

          return nextOptions;
        }),
        switchMap(x => this.state.getGeneratedCode(x.language!, {
          style: x.indentStyle,
          indentChar: x.useSpaces ? ' ' : '\t',
          indentSize: x.indentLength
        }))
      )
    ).pipe(takeUntilDestroyed(this.destroyRef));
  }

  onIsOpenClick() {
    this.isOpen.update((value) => !value);
  }

  onOptionsReset() {
    this.optionsForm.patchValue(
      this.getLanguageDefaultOptions(this.optionsForm.value.language!)
    );
  }

  async onCodeExport() {
    const formValue = this.optionsForm.value;
    const formatOptions = {
      style: formValue.indentStyle,
      indentChar: formValue.useSpaces ? ' ' : '\t',
      indentSize: formValue.indentLength
    };

    await this.state.exportFlowchartAsCode(formValue.language!, formatOptions);
  }

  private getLanguageDefaultOptions(language: string) {
    const template = CodegenTemplates[language];

    return {
      indentStyle: template.style,
      indentLength: template.indentSize,
      useSpaces: template.indentChar === ' ',
    }
  }

  languagesList = codegenTemplateList;
  stylesList = [{ key: 'allman', label: 'Allman' }, { key: 'kr', label: 'K&R' }];
}
