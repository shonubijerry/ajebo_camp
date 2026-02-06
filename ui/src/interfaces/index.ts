import { paths } from '@/lib/api/v1'

export type User =
  paths['/api/v1/users/list']['get']['responses']['200']['content']['application/json']['data'][number]
export type Camp =
  paths['/api/v1/camps/list']['get']['responses']['200']['content']['application/json']['data'][number]
export type CampAllocation =
  paths['/api/v1/camp-allocations/list']['get']['responses']['200']['content']['application/json']['data'][number]
export type AuthLoginResponse =
  paths['/api/v1/auth/login']['post']['responses']['200']['content']['application/json']
export type AuthSignupResponse =
  paths['/api/v1/auth/signup']['post']['responses']['200']['content']['application/json']
export type District =
  paths['/api/v1/districts/list']['get']['responses']['200']['content']['application/json']['data'][number]
export type Entity =
  paths['/api/v1/entities/list']['get']['responses']['200']['content']['application/json']['data'][number]
export type Payment =
  paths['/api/v1/payments/list']['get']['responses']['200']['content']['application/json']['data'][number]
export type Campite =
  paths['/api/v1/campites/list']['get']['responses']['200']['content']['application/json']['data'][number]

export type CreateUserRequest = NonNullable<
  paths['/api/v1/users']['post']['requestBody']
>['content']['application/json']
export type CreateCampRequest = NonNullable<
  paths['/api/v1/camps']['post']['requestBody']
>['content']['multipart/form-data']
export type CreateCampAllocationRequest = NonNullable<
  paths['/api/v1/camp-allocations']['post']['requestBody']
>['content']['application/json']
export type UpdateUserRequest = NonNullable<
  paths['/api/v1/users/{id}']['patch']['requestBody']
>['content']['application/json']
export type UpdateCampRequest = NonNullable<
  paths['/api/v1/camps/{id}']['patch']['requestBody']
>['content']['multipart/form-data']
export type UpdateCampAllocationRequest = NonNullable<
  paths['/api/v1/camp-allocations/{id}']['patch']['requestBody']
>['content']['application/json']
export type LoginRequest = NonNullable<
  paths['/api/v1/auth/login']['post']['requestBody']
>['content']['application/json']
export type SignupRequest = NonNullable<
  paths['/api/v1/auth/signup']['post']['requestBody']
>['content']['application/json']
export type ForgotPasswordRequest = NonNullable<
  paths['/api/v1/forgot']['post']['requestBody']
>['content']['application/json']
export type ChangePasswordRequest = NonNullable<
  paths['/api/v1/forgot/change-password/{code}']['post']['requestBody']
>['content']['application/json']
export type DetailedAnalytics =
  paths['/api/v1/analytics/detailed']['get']['responses']['200']['content']['application/json']['data']
export type Permission =
  paths['/api/v1/users/me']['get']['responses']['200']['content']['application/json']['data']['permissions'][number]
export type UserRole =
  paths['/api/v1/users/me']['get']['responses']['200']['content']['application/json']['data']['role']
