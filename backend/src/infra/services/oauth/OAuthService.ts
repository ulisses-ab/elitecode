import { AppError } from "../../../application/errors/AppError";
import { ErrorCode } from "../../../application/errors/ErrorCode";
import { IOAuthService, OAuthUser } from "../../../application/services/interfaces/IOAuthService";
import { OAuthProvider } from "../../../domain/types/OAuthProvider";
import { IOAuthClient } from "./IOAuthClient";

export class OAuthService implements IOAuthService {
  constructor(
    private readonly clients: Record<OAuthProvider, IOAuthClient>
  ) {}

  public getAuthUrl(provider: OAuthProvider, state: string): string {
    return this.clientFor(provider).getAuthUrl(state);
  }

  public async getUserFromAuthCode(provider: OAuthProvider, code: string): Promise<OAuthUser> {
    return this.clientFor(provider).getUserFromAuthCode(code);
  }

  private clientFor(provider: OAuthProvider): IOAuthClient {
    const client = this.clients[provider];
    if (!client) {
      throw new AppError(ErrorCode.NOT_IMPLEMENTED, `OAuth not implemented for provider: ${provider}`);
    }
    return client;
  }
}
