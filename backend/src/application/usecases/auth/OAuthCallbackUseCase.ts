import { UserDTO } from "../../dtos/UserDTO"
import { mapUserToDTO } from "../../mappers/mapUserToDTO"
import { IUserRepo } from "../../../domain/repos/IUserRepo"
import { IJWTService } from "../../services/interfaces/IJWTService"
import { IOAuthService, OAuthUser } from "../../services/interfaces/IOAuthService"
import { IUUIDService } from "../../services/interfaces/IUUIDService"
import { Role } from "../../../domain/types/Role"
import { User } from "../../../domain/entities/User"
import { OAuthProvider } from "../../../domain/types/OAuthProvider"
import { IOAuthIdentityRepo } from "../../../domain/repos/IOAuthIdentityRepo"
import { AppError } from "../../errors/AppError"
import { ErrorCode } from "../../errors/ErrorCode"
import { OAuthIdentity } from "../../../domain/entities/OAuthIdentity"

export type OAuthCallbackInput = {
  provider: OAuthProvider,
  code: string,
}

export type OAuthCallbackOutput = {
  token: string,
  user: UserDTO,
}

export class OAuthCallbackUseCase {
  constructor(
    private readonly userRepo: IUserRepo,
    private readonly jwtService: IJWTService,
    private readonly oAuthService: IOAuthService,
    private readonly uuidService: IUUIDService,
    private readonly oAuthIdentityRepo: IOAuthIdentityRepo,
  ) {}

  public async execute(input: OAuthCallbackInput): Promise<OAuthCallbackOutput> {
    const { provider, code } = input;

    const oAuthUser = await this.oAuthService.getUserFromAuthCode(provider, code);

    const identity = await this.oAuthIdentityRepo.findByProviderUserId(provider, oAuthUser.providerUserId)

    const user = 
      identity ?
        await this.getUserFromIdentity(identity) :
        await this.createUserAndIdentity(oAuthUser);

    const token = this.jwtService.sign(
      { sub: user.id },
      user.role === Role.EXECUTION_ENGINE ? undefined : 60 * 60 * 24 * 30 // 30 days
    );

    console.log("JWT token: ", token);

    return {
      token,
      user: mapUserToDTO(user)
    }
  }

  private async getUserFromIdentity(identity: OAuthIdentity): Promise<User> {
    const user = await this.userRepo.findById(identity.userId);
    if(!user) {
      throw new AppError(ErrorCode.USER_NOT_FOUND, "User linked to this OAuth identity not found");
    }

    return user;
  }

  private async createUserAndIdentity(oAuthUser: OAuthUser): Promise<User> {
    const baseHandle = oAuthUser.email.split("@")[0]
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, "");

    let handle = baseHandle;
    let i = 1;

    while (await this.userRepo.findByHandle(handle)) {
      handle = `${baseHandle}_${i++}`;
    }

    const user: User = {
      email: oAuthUser.email,
      id: this.uuidService.generate(),
      role: Role.REGULAR,
      handle,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    await this.userRepo.save(user);

    try {
      await this.oAuthIdentityRepo.save({
        id: this.uuidService.generate(),
        userId: user.id,
        provider: oAuthUser.provider,
        providerUserId: oAuthUser.providerUserId,
        createdAt: new Date(),
      })
    }
    catch(e) {
      await this.userRepo.deleteById(user.id);

      throw e;
    }

    return user;
  }
}

