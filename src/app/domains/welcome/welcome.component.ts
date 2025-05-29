import { Component, inject } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { AppCoordinator } from '../../common/services/app-coordinator';
import { LanguageSwitcherComponent } from '../../components/misc/language-switcher/language-switcher.component';

@Component({
  selector: 'app-welcome',
  imports: [ButtonModule, DividerModule, TranslatePipe, LanguageSwitcherComponent],
  templateUrl: './welcome.component.html',
})
export class WelcomeComponent {
  private readonly coordinator = inject(AppCoordinator);

  public onNewFlowchart() {
    this.coordinator.initializeFlowchart();
  }

  public async onLoadFlowchart() {
    await this.coordinator.loadFlowchart();
  }
}
