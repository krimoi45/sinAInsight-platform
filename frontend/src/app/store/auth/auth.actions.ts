import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { User } from '@app/core/models/user.model';
import { LoginRequest } from '@app/core/models/login-request.model';
import { RegisterRequest } from '@app/core/models/register-request.model';
import { UpdateProfileRequest } from '@app/core/models/update-profile-request.model';

export const authActions = createActionGroup({
  source: 'Auth',
  events: {
    // Login
    'Login': props<{ request: LoginRequest }>(),
    'Login Success': props<{ user: User }>(),
    'Login Failure': props<{ error: string }>(),
    
    // Registration
    'Register': props<{ request: RegisterRequest }>(),
    'Register Success': props<{ user: User }>(),
    'Register Failure': props<{ error: string }>(),
    
    // Check Auth Status
    'Check Auth Status': emptyProps(),
    'Check Auth Status Success': props<{ user: User }>(),
    'Check Auth Status Failure': emptyProps(),
    
    // Logout
    'Logout': emptyProps(),
    'Logout Success': emptyProps(),
    
    // Update Profile
    'Update Profile': props<{ request: UpdateProfileRequest }>(),
    'Update Profile Success': props<{ user: User }>(),
    'Update Profile Failure': props<{ error: string }>()
  }
});