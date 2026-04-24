import { OAuthCallbackUseCase } from '../../application/usecases/auth/OAuthCallbackUseCase';
import { Request, Response } from 'express';
import { OAuthProvider } from '../../domain/types/OAuthProvider';
import { IOAuthService } from '../../application/services/interfaces/IOAuthService';

export class AuthController {
  constructor(
    private readonly oAuthCallbackUseCase: OAuthCallbackUseCase,
    private readonly oAuthService: IOAuthService,
    private readonly frontendOAuthRedirect: string,
  ) {}

  public async google(req: Request, res: Response) {
    const state = (req.query.state ?? "") as string;
    res.redirect(this.oAuthService.getAuthUrl(OAuthProvider.GOOGLE, state));
  }

  public async googleCallback(req: Request, res: Response) {
    await this.callback(req, res, OAuthProvider.GOOGLE);
  }

  public async github(req: Request, res: Response) {
    const state = (req.query.state ?? "") as string;
    res.redirect(this.oAuthService.getAuthUrl(OAuthProvider.GITHUB, state));
  }

  public async githubCallback(req: Request, res: Response) {
    await this.callback(req, res, OAuthProvider.GITHUB);
  }

  private async callback(req: Request, res: Response, provider: OAuthProvider) {
    const state = (req.query.state ?? "") as string;
    const code = req.query.code as string;

    if (!code) {
      return res.redirect(`${this.frontendOAuthRedirect}?error=missing_code`);
    }

    try {
      const output = await this.oAuthCallbackUseCase.execute({ provider, code });
      const encodedState = encodeURIComponent(state);
      return res.redirect(`${this.frontendOAuthRedirect}?token=${output.token}&state=${encodedState}`);
    } catch (error) {
      console.error(`OAuth callback error [${provider}]:`, error);
      return res.redirect(`${this.frontendOAuthRedirect}?error=auth_failed`);
    }
  }
}
