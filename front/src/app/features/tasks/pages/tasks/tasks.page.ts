import { Component, HostListener, OnInit, computed, inject, signal } from '@angular/core';
import { NgIf } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthUser } from '@atom/shared';
import { AuthService } from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [NgIf, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './tasks.page.html',
  styleUrl: './tasks.page.scss',
})
export class TasksPage implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected currentUser: AuthUser | null = null;

  protected readonly isDesktop = signal<boolean>(window.innerWidth >= 992);
  protected readonly isMenuOpen = signal<boolean>(false);
  protected readonly showHamburger = computed<boolean>(() => !this.isDesktop());

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    console.log('qweqweqweqwes', this.currentUser);
  }

  @HostListener('window:resize')
  protected onWindowResize(): void {
    const nextIsDesktop = window.innerWidth >= 992;
    const prevIsDesktop = this.isDesktop();

    if (nextIsDesktop === prevIsDesktop) {
      return;
    }

    this.isDesktop.set(nextIsDesktop);

    if (nextIsDesktop) {
      this.isMenuOpen.set(false);
    }
  }

  protected toggleMenu(): void {
    this.isMenuOpen.update((open) => !open);
  }

  protected openMenu(): void {
    this.isMenuOpen.set(true);
  }

  protected closeMenu(): void {
    this.isMenuOpen.set(false);
  }

  protected async onNavigate(commands: readonly string[]): Promise<void> {
    await this.router.navigate([...commands]);
    this.closeMenu();
  }

  protected logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}