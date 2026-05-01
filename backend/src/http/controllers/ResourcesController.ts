import { Request, Response } from "express";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import { handleError } from "../errors/handleError";
import { ListAllResourcesUseCase } from "../../application/usecases/resources/ListAllResourcesUseCase";
import { ListResourcesUseCase } from "../../application/usecases/resources/ListResourcesUseCase";
import { CreateResourceUseCase } from "../../application/usecases/resources/CreateResourceUseCase";
import { UpdateResourceUseCase } from "../../application/usecases/resources/UpdateResourceUseCase";
import { DeleteResourceUseCase } from "../../application/usecases/resources/DeleteResourceUseCase";
import { LinkResourceUseCase } from "../../application/usecases/resources/LinkResourceUseCase";
import { UnlinkResourceUseCase } from "../../application/usecases/resources/UnlinkResourceUseCase";

export class ResourcesController {
  constructor(
    private listAllResourcesUseCase: ListAllResourcesUseCase,
    private listResourcesUseCase: ListResourcesUseCase,
    private createResourceUseCase: CreateResourceUseCase,
    private updateResourceUseCase: UpdateResourceUseCase,
    private deleteResourceUseCase: DeleteResourceUseCase,
    private linkResourceUseCase: LinkResourceUseCase,
    private unlinkResourceUseCase: UnlinkResourceUseCase,
  ) {}

  public async listAll(req: Request, res: Response) {
    try {
      const output = await this.listAllResourcesUseCase.execute();
      res.json(output);
    } catch (error) {
      handleError(error, res);
    }
  }

  public async listForProblem(req: Request, res: Response) {
    const { problemId } = req.params;
    try {
      const output = await this.listResourcesUseCase.execute({ problemId });
      res.json(output);
    } catch (error) {
      handleError(error, res);
    }
  }

  public async createResource(req: AuthenticatedRequest, res: Response) {
    const { title, content, order } = req.body;
    const userId = req.user!;
    try {
      const output = await this.createResourceUseCase.execute({ userId, title, content, order });
      res.status(201).json(output);
    } catch (error) {
      handleError(error, res);
    }
  }

  public async updateResource(req: AuthenticatedRequest, res: Response) {
    const { resourceId } = req.params;
    const { title, content, order } = req.body;
    const userId = req.user!;
    try {
      await this.updateResourceUseCase.execute({ userId, resourceId, title, content, order });
      res.status(204).send();
    } catch (error) {
      handleError(error, res);
    }
  }

  public async deleteResource(req: AuthenticatedRequest, res: Response) {
    const { resourceId } = req.params;
    const userId = req.user!;
    try {
      await this.deleteResourceUseCase.execute({ userId, resourceId });
      res.status(204).send();
    } catch (error) {
      handleError(error, res);
    }
  }

  public async linkResource(req: AuthenticatedRequest, res: Response) {
    const { problemId, resourceId } = req.params;
    const userId = req.user!;
    try {
      await this.linkResourceUseCase.execute({ userId, resourceId, problemId });
      res.status(204).send();
    } catch (error) {
      handleError(error, res);
    }
  }

  public async unlinkResource(req: AuthenticatedRequest, res: Response) {
    const { problemId, resourceId } = req.params;
    const userId = req.user!;
    try {
      await this.unlinkResourceUseCase.execute({ userId, resourceId, problemId });
      res.status(204).send();
    } catch (error) {
      handleError(error, res);
    }
  }
}
