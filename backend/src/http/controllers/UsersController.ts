import { GetUserUseCase } from "../../application/usecases/users/GetUserUseCase";
import { GetUserProfileUseCase } from "../../application/usecases/users/GetUserProfileUseCase";
import { Response } from 'express';
import { handleError } from "../errors/handleError";
import { AuthenticatedRequest } from "../middleware/authMiddleware";

export class UsersController {
  constructor(
    private getUserUseCase: GetUserUseCase,
    private getUserProfileUseCase: GetUserProfileUseCase,
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
}