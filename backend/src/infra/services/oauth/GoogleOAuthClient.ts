import { IOAuthClient } from "./IOAuthClient";
import { OAuthUser } from "../../../application/services/interfaces/IOAuthService";
import { OAuthProvider } from "../../../domain/types/OAuthProvider";

export class GoogleOAuthClient implements IOAuthClient {
  private static readonly AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
  private static readonly TOKEN_URL = "https://oauth2.googleapis.com/token";

  constructor(
    private readonly clientId: string,
    private readonly clientSecret: string,
    private readonly redirectUri: string,
  ) {}

  public getAuthUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: "code",
      scope: "openid email profile",
      state,
      access_type: "online",
    });

    return `${GoogleOAuthClient.AUTH_URL}?${params.toString()}`;
  }

  public async getUserFromAuthCode(code: string): Promise<OAuthUser> {
    const tokens = await this.exchangeCodeForTokens(code);
    return this.extractUserFromIdToken(tokens.id_token);
  }

  private async exchangeCodeForTokens(code: string): Promise<{ id_token: string }> {
    const response = await fetch(GoogleOAuthClient.TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: this.clientId,
        client_secret: this.clientSecret,
        redirect_uri: this.redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const data = await response.json();

    if (!response.ok || data.error) {
      throw new Error(`Google token exchange failed: ${data.error_description ?? data.error ?? response.statusText}`);
    }

    if (!data.id_token) {
      throw new Error("Google token response missing id_token");
    }

    return data;
  }

  private extractUserFromIdToken(idToken: string): OAuthUser {
    const payloadBase64 = idToken.split(".")[1];
    const payload = JSON.parse(
      Buffer.from(payloadBase64.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8")
    );

    if (!payload.email || !payload.sub) {
      throw new Error("Google id_token missing required fields");
    }

    return {
      email: payload.email,
      name: payload.name ?? payload.email,
      provider: OAuthProvider.GOOGLE,
      providerUserId: payload.sub,
    };
  }
}
