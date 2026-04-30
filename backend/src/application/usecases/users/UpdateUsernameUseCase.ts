import { mapUserToDTO } from "../../mappers/mapUserToDTO";
import { IUserRepo } from "../../../domain/repos/IUserRepo";
import { UserDTO } from "../../dtos/UserDTO";
import { AppError } from "../../errors/AppError";
import { ErrorCode } from "../../errors/ErrorCode";

const HANDLE_REGEX = /^[a-z0-9_]{3,20}$/;

export type UpdateUsernameInput = {
  userId: string;
  handle: string;
};

export type UpdateUsernameOutput = {
  user: UserDTO;
};

export class UpdateUsernameUseCase {
  constructor(private readonly userRepo: IUserRepo) {}

  public async execute(input: UpdateUsernameInput): Promise<UpdateUsernameOutput> {
    const { userId, handle } = input;

    if (!HANDLE_REGEX.test(handle)) {
      throw new AppError(
        ErrorCode.INVALID_INPUT,
        "Handle must be 3–20 characters and contain only lowercase letters, numbers, or underscores."
      );
    }

    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new AppError(ErrorCode.USER_NOT_FOUND, "User not found");
    }

    if (user.handle === handle) {
      return { user: mapUserToDTO(user) };
    }

    const existing = await this.userRepo.findByHandle(handle);
    if (existing) {
      throw new AppError(ErrorCode.HANDLE_ALREADY_IN_USE, "That username is already taken.");
    }

    user.handle = handle;
    user.updatedAt = new Date();
    await this.userRepo.save(user);

    return { user: mapUserToDTO(user) };
  }
}
