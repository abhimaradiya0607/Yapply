import { axiosInstance } from './axios'

export type SignUpData = {
  fullname: string
  email: string
  password: string
}

export type LoginData = {
  email: string
  password: string
}

export type AuthUser = {
  id: string
  fullname: string
  email: string
  bio?: string
  profileurl?: string
  nativelanguage?: string
  learninglanguage?: string
  location?: string
  isonboarded?: boolean
}

export type AuthResponse = {
  success: true
  message: string
  user: AuthUser
}

export type BackendErrorResponse = {
  success: false
  message: string
  errors?: {
    field: string
    message: string
  }[]
}

export type OnboardingData = {
  fullname: string
  bio: string
  nativelanguage: string
  learninglanguage: string
  location: string
  profileurl: string
}

export const signUp = async (
  signupData: SignUpData,
): Promise<AuthResponse> => {
  const response = await axiosInstance.post<AuthResponse>(
    '/auth/register',
    signupData,
  )

  return response.data
}

export const login = async (loginData: LoginData): Promise<AuthResponse> => {
  const response = await axiosInstance.post<AuthResponse>(
    '/auth/login',
    loginData,
  )

  return response.data
}

export const logout = async (): Promise<{ success: boolean; message: string }> => {
  const response = await axiosInstance.post('/auth/logout')
  return response.data
}

export const getAuthUser = async (): Promise<AuthResponse> => {
  const response = await axiosInstance.get<AuthResponse>('/auth/me')
  return response.data
}

export const completeOnboarding = async (
  onboardingData: OnboardingData,
): Promise<AuthResponse> => {
  const response = await axiosInstance.patch<AuthResponse>(
    '/users/onboarding',
    onboardingData,
  )

  return response.data
}