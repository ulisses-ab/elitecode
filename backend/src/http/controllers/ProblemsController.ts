import { CreateProblemUseCase } from '../../application/usecases/problems/CreateProblemUseCase';
import { DeleteProblemUseCase } from '../../application/usecases/problems/DeleteProblemUseCase';
import { UpdateProblemUseCase } from '../../application/usecases/problems/UpdateProblemUseCase';
import { GetProblemUseCase } from '../../application/usecases/problems/GetProblemUseCase';
import { ListProblemsUseCase } from '../../application/usecases/problems/ListProblemsUseCase';
import { AddProblemSetupUseCase } from '../../application/usecases/problems/AddProblemSetupUseCase';
import { GetTestsForDisplayUseCase } from '../../application/usecases/problems/GetTestsForDisplayUseCase';
import { SubmitTestsFileUseCase } from '../../application/usecases/problems/SubmitTestsFileUseCase';
import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { handleError } from '../errors/handleError';
import { Difficulty } from '../../domain/types/Difficulty';
import { Language } from '../../domain/types/Language';
import { SubmitRunnerFileUseCase } from '../../application/usecases/problems/SubmitRunnerFileUseCase';
import { SubmitTemplateFileUseCase } from '../../application/usecases/problems/SubmitTemplateFileUseCase';
import { GetTemplateFileUseCase } from '../../application/usecases/problems/GetTemplateFileUseCase';

export class ProblemsController {
  constructor(
    private createProblemUseCase: CreateProblemUseCase,
    private deleteProblemUseCase: DeleteProblemUseCase,
    private updateProblemUseCase: UpdateProblemUseCase,
    private getProblemUseCase: GetProblemUseCase,
    private listProblemsUseCase: ListProblemsUseCase,
    private addProblemSetupUseCase: AddProblemSetupUseCase,
    private getTestsForDisplayUseCase: GetTestsForDisplayUseCase,
    private submitTestsFileUseCase: SubmitTestsFileUseCase,
    private submitRunnerFileUseCase: SubmitRunnerFileUseCase,
    private submitTemplateFileUseCase: SubmitTemplateFileUseCase,
    private getTemplateFileUseCase: GetTemplateFileUseCase,
  ) {}

  public async createProblem(req: AuthenticatedRequest, res: Response) {
    const { title, statement, difficulty, description } = req.body;
    const userId = req.user!;

    try {
      const output = await this.createProblemUseCase.execute({
        title,
        statement,
        difficulty,
        userId,
        description,
      });

      return res.status(201).json(output);
    } catch (error) {
      handleError(error, res);
    }
  }

  public async getProblem(req: Request, res: Response) {
    const { problemId } = req.params;

    try {
      const output = await this.getProblemUseCase.execute({ 
        problemId 
      });

      return res.status(200).json(output);
    } catch (error) {
      handleError(error, res);
    }
  }

  public async listProblems(req: Request, res: Response) {
    const { limit, language, offset, difficulty, searchText } = req.query;

    try {
      const output = await this.listProblemsUseCase.execute({
        limit: limit ? Number(limit) : undefined,
        offset: offset ? Number(offset) : undefined,
        difficulty: difficulty ? difficulty as Difficulty : undefined,
        language: language ? language as Language : undefined,
        searchText: searchText ? String(searchText) : undefined,
      });

      return res.status(200).json(output);
    } catch (error) {
      handleError(error, res);
    }
  }

  public async addProblemSetup(req: AuthenticatedRequest, res: Response) {
    const { problemId } = req.params;
    const { language, info } = req.body;
    const userId = req.user!;

    try {
      const output = await this.addProblemSetupUseCase.execute({
        problemId, 
        userId,
        language,
        info: info ?? "",
      });

      return res.status(201).json(output);
    } catch (error) {
      handleError(error, res);
    }
  }

  public async getTestsForDisplay(req: Request, res: Response) {
    const { problemId, setupId } = req.params;

    console.log(problemId, setupId);

    try {
      const output = await this.getTestsForDisplayUseCase.execute({
        problemId, 
        setupId
      });

      return res.status(200).json(output);
    } catch (error) {
      handleError(error, res);
    }
  }

  public async submitTestsFile(req: AuthenticatedRequest, res: Response) {
    const { problemId, setupId } = req.params;
    const file = req.file;
    const userId = req.user!;

    if (!file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    try {
      const output = await this.submitTestsFileUseCase.execute({
        problemId, 
        setupId, 
        fileContent: file.buffer,
        userId,
      });

      return res.status(200).json(output);
    } catch (error) {
      handleError(error, res);
    }
  }

  public async submitRunnerFile(req: AuthenticatedRequest, res: Response) {
    const { problemId, setupId } = req.params;
    const file = req.file;
    const userId = req.user!;

    if (!file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    try {
      const output = await this.submitRunnerFileUseCase.execute({
        problemId, 
        setupId, 
        fileContent: file.buffer,
        userId,
      });

      return res.status(200).json(output);
    } catch (error) {
      handleError(error, res);
    }
  }

  public async getTemplateFile(req: Request, res: Response) {
    const { problemId, setupId } = req.params;

    console.log("Received request for template file with problemId:", problemId, "and setupId:", setupId);

    try {
      const output = await this.getTemplateFileUseCase.execute({
        problemId, 
        setupId, 
      });

      return res.status(200).send(output.fileContent);
    } catch (error) {
      handleError(error, res);
    }
  }

  public async submitTemplateFile(req: AuthenticatedRequest, res: Response) {
    const { problemId, setupId } = req.params;
    const file = req.file;
    const userId = req.user!;

    if (!file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    try {
      const output = await this.submitTemplateFileUseCase.execute({
        problemId,
        setupId,
        fileContent: file.buffer,
        userId,
      });

      return res.status(200).json(output);
    } catch (error) {
      handleError(error, res);
    }
  }

  public async deleteProblem(req: AuthenticatedRequest, res: Response) {
    const { problemId } = req.params;
    const userId = req.user!;

    try {
      await this.deleteProblemUseCase.execute({ problemId, userId });
      return res.status(204).send();
    } catch (error) {
      handleError(error, res);
    }
  }

  public async updateProblem(req: AuthenticatedRequest, res: Response) {
    const { problemId } = req.params;
    const userId = req.user!;
    const { title, statement, difficulty, tags } = req.body;

    try {
      await this.updateProblemUseCase.execute({ problemId, userId, title, statement, difficulty, tags });
      return res.status(204).send();
    } catch (error) {
      handleError(error, res);
    }
  }
}
