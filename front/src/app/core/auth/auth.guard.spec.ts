import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';

import { AuthService } from './auth.service';
import { authGuard } from './auth.guard';

describe('authGuard', () => {
  function runGuard(url: string) {
    return TestBed.runInInjectionContext(() =>
      authGuard({} as any, { url } as any),
    );
  }

  it('returns true when authenticated', () => {
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: { isAuthenticated: () => true } },
        { provide: Router, useValue: { createUrlTree: jasmine.createSpy('createUrlTree') } },
      ],
    });

    const result = runGuard('/tasks');
    expect(result).toBeTrue();
  });

  it('redirects to /login with returnUrl when not authenticated', () => {
    const urlTree = {} as UrlTree;
    const createUrlTree = jasmine.createSpy('createUrlTree').and.returnValue(urlTree);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: { isAuthenticated: () => false } },
        { provide: Router, useValue: { createUrlTree } },
      ],
    });

    const result = runGuard('/tasks?x=1');

    expect(createUrlTree).toHaveBeenCalledWith(['/login'], {
      queryParams: { returnUrl: '/tasks?x=1' },
    });
    expect(result).toBe(urlTree);
  });
});

