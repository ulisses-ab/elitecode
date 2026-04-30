import { GetUserUseCase } from "../../application/usecases/users/GetUserUseCase";
import { GetUserProfileUseCase } from "../../application/usecases/users/GetUserProfileUseCase";
import { UpdateUsernameUseCase } from "../../application/usecases/users/UpdateUsernameUseCase";
import { Response } from 'express';
import { handleError } from "../errors/handleError";
import { AuthenticatedRequest } from "../middleware/authMiddleware";

export class UsersController {
  constructor(
    private getUserUseCase: GetUserUseCase,
    private getUserProfileUseCase: GetUserProfileUseCase,
    private updateUsernameUseCase: UpdateUsernameUseCase,
  ) {}

  public async getUser(req: AuthenticatedRequest, res: Response) {
    const userId = req.user!;
    try {
      const output = await this.getUserUseCase.execute({ userId });
      return res.status(200).json(output);
    } catch (error) {
      handleError(error, res);
    }
  }

  public async getUserProfile(req: AuthenticatedRequest, res: Response) {
    const userId = req.user!;
    try {
      const output = await this.getUserProfileUseCase.execute({ userId });
      return res.status(200).json(output);
    } catch (error) {
      handleError(error, res);
    }
  }

  public async updateUsername(req: AuthenticatedRequest, res: Response) {
    const userId = req.user!;
    const { handle } = req.body;
    try {
      const output = await this.updateUsernameUseCase.execute({ userId, handle });
      return res.status(200).json(output);
    } catch (error) {
      handleError(error, res);
    }
  }
}