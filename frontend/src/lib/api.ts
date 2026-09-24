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

export type Learner = {
  id: string
  fullname: string
  email?: string
  bio?: string | null
  profileurl?: string | null
  nativelanguage?: string | null
  learninglanguage?: string | null
  location?: string | null
  isonboarded?: boolean
}

export type IncomingFriendRequest = {
  requestId: string
  status: string
  createdAt: string
  sender: {
    id: string
    fullname: string
    profileurl?: string | null
    location?: string | null
    bio?: string | null
    nativeLanguage?: string | null
    learningLanguage?: string | null
  }
}

export type OutgoingFriendRequest = {
  requestId: string
  status: string
  createdAt: string
  recipient: {
    id: string
    fullname: string
    profileurl?: string | null
    nativeLanguage?: string | null
    learningLanguage?: string | null
  }
}

export type AcceptedFriendRequest = {
  requestId: string
  status: string
  createdAt: string
  friend: {
    id: string
    fullname: string
    profileurl?: string | null
  }
}

export type FriendRequestsData = {
  incomingRequest: IncomingFriendRequest[]
  acceptedRequests: AcceptedFriendRequest[]
}

export async function getUserFriends(): Promise<Learner[]> {
  const response = await axiosInstance.get<{ success: true; friends: Learner[] }>(
    '/users/friends',
  )
  return response.data.friends
}

export async function getRecommendedUsers(): Promise<Learner[]> {
  const response = await axiosInstance.get<{ success: true; users: Learner[] }>(
    '/users',
  )
  return response.data.users
}

export async function getOutgoingFriendRequests(): Promise<OutgoingFriendRequest[]> {
  const response = await axiosInstance.get<{
    success: true
    data: OutgoingFriendRequest[]
  }>('/friend-request/requests/outgoing')
  return response.data.data
}

export async function getFriendRequests(): Promise<FriendRequestsData> {
  const response = await axiosInstance.get<{
    success: true
    data: FriendRequestsData
  }>('/friend-request/requests')
  return response.data.data
}

export async function sendFriendRequest(recipientId: string) {
  const response = await axiosInstance.post(`/friend-request/${recipientId}`)
  return response.data
}

export async function acceptFriendRequest(requestId: string) {
  const response = await axiosInstance.put(`/friend-request/${requestId}/accept`)
  return response.data
}

export async function rejectFriendRequest(requestId: string) {
  const response = await axiosInstance.put(`/friend-request/${requestId}/reject`)
  return response.data
} 