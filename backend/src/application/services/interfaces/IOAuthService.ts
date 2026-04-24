import { OAuthProvider } from "../../../domain/types/OAuthProvider"

export type OAuthUser = {
  email: string,
  name: string,
  provider: OAuthProvider,
  providerUserId: string,
}

export interface IOAuthService {
  getAuthUrl(provider: OAuthProvider, state: string): string
  getUserFromAuthCode(provider: OAuthProvider, code: string): Promise<OAuthUser>
}
