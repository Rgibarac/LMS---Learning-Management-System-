import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, mergeMap, catchError } from 'rxjs/operators';
import { AuthService } from '../core/services/auth.service';

@Injectable()
export class AuthEffects {
  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType('[Auth] Login'),
      mergeMap((action: { username: string; password: string }) =>
        this.authService.login({ username: action.username, password: action.password }).pipe(
          map(response => ({ type: '[Auth] Login Success', user: response.user, token: response.token })),
          catchError((error) => of({ type: '[Auth] Login Failure', error }))
        )
      )
    )
  );

  constructor(
    private actions$: Actions,
    private authService: AuthService
  ) {}
}