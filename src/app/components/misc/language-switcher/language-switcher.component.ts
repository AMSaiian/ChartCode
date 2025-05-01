import { NgClass } from '@angular/common';
import { Component, effect, signal } from '@angular/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { Ripple } from 'primeng/ripple';
import { defaultLanguage, ILanguageEntry, languageStorageKey } from '../../../common/const/language-storage.const';

@Component({
  selector: 'app-language-switcher',
  imports: [
    MenuModule,
    ButtonModule,
    TranslatePipe,
    NgClass,
    Ripple,
  ],
  templateUrl: './language-switcher.component.html',
  styleUrl: './language-switcher.component.css'
})
export class LanguageSwitcherComponent {
  languages: ILanguageEntry[] = [
    { code: 'en', name: 'LANGUAGES.EN' },
    { code: 'ua', name: 'LANGUAGES.UA' }
  ]

  currentLanguage = signal<string>(defaultLanguage);

  constructor(private translate: TranslateService) {
    const savedLanguage = localStorage.getItem(languageStorageKey);
    if (savedLanguage) {
      this.currentLanguage.set(savedLanguage);
    }

    effect(() => {
      const currentLanguage = this.currentLanguage();
      this.translate.use(currentLanguage);
    })
  }

  switchLanguage(languageCode: string): void {
    this.currentLanguage.set(languageCode);
    this.translate.use(languageCode);

    localStorage.setItem(languageStorageKey, languageCode);
  }
}
