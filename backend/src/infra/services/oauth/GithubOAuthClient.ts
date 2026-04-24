import { IOAuthClient } from "./IOAuthClient";
import { OAuthUser } from "../../../application/services/interfaces/IOAuthService";
import { OAuthProvider } from "../../../domain/types/OAuthProvider";

export class GithubOAuthClient implements IOAuthClient {
  private static readonly AUTH_URL = "https://github.com/login/oauth/authorize";
  private static readonly TOKEN_URL = "https://github.com/login/oauth/access_token";
  private static readonly API_URL = "https://api.github.com";

  constructor(
    private readonly clientId: string,
    private readonly clientSecret: string,
    private readonly redirectUri: string,
  ) {}

  public getAuthUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      scope: "read:user user:email",
      state,
    });

    return `${GithubOAuthClient.AUTH_URL}?${params.toString()}`;
  }

  public async getUserFromAuthCode(code: string): Promise<OAuthUser> {
    const accessToken = await this.exchangeCodeForAccessToken(code);
    return this.fetchUser(accessToken);
  }

  private async exchangeCodeForAccessToken(code: string): Promise<string> {
    const response = await fetch(GithubOAuthClient.TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        code,
        redirect_uri: this.redirectUri,
      }),
    });

    const data = await response.json();

    if (!response.ok || data.error) {
      throw new Error(`GitHub token exchange failed: ${data.error_description ?? data.error ?? response.statusText}`);
    }

    return data.access_token;
  }

  private async fetchUser(accessToken: string): Promise<OAuthUser> {
    const headers = {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.github+json",
    };

    const [profileRes, emailsRes] = await Promise.all([
      fetch(`${GithubOAuthClient.API_URL}/user`, { headers }),
      fetch(`${GithubOAuthClient.API_URL}/user/emails`, { headers }),
    ]);

    if (!profileRes.ok) {
      throw new Error(`GitHub profile fetch failed: ${profileRes.statusText}`);
    }
    if (!emailsRes.ok) {
      throw new Error(`GitHub emails fetch failed: ${emailsRes.statusText}`);
    }

    const [profile, emails]: [any, { email: string; primary: boolean; verified: boolean }[]] =
      await Promise.all([profileRes.json(), emailsRes.json()]);

    const primaryEmail =
      emails.find((e) => e.primary && e.verified)?.email ??
      emails.find((e) => e.verified)?.email ??
      emails[0]?.email;

    if (!primaryEmail) {
      throw new Error("No email address found on this GitHub account");
    }

    return {
      email: primaryEmail,
      name: profile.name ?? profile.login,
      provider: OAuthProvider.GITHUB,
      providerUserId: String(profile.id),
    };
  }
}
