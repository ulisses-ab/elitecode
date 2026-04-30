import { FetchExecutionFilesUseCase } from '../../application/usecases/execution/FetchExecutionFilesUseCase';
import { SubmitExecutionResultsUseCase } from '../../application/usecases/execution/SubmitExecutionResultsUseCase';
import { GetSubmissionUseCase } from '../../application/usecases/submissions/GetSubmissionUseCase';
import { GetSubmissionWithResultsUseCase } from '../../application/usecases/submissions/GetSubmissionWithResultsUseCase'
import { GetSubmissionCodeUseCase } from '../../application/usecases/submissions/GetSubmissionCodeUseCase';
import { GetLeaderboardUseCase } from '../../application/usecases/submissions/GetLeaderboardUseCase';
import { MakeSubmissionUseCase } from '../../application/usecases/submissions/MakeSubmissionUseCase';
import { GetAllSubmissionsForProblemUseCase } from '../../application/usecases/submissions/GetAllSubmissionsForProblemUseCase';
import { GetLatestSubmissionForProblemUseCase } from '../../application/usecases/submissions/GetLatestSubmissionForProblemUseCase';
import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { handleError } from '../errors/handleError';

export class SubmissionsController {
  constructor(
    private makeSubmissionUseCase: MakeSubmissionUseCase,
    private getSubmissionUseCase: GetSubmissionUseCase,
    private fetchExecutionFilesUseCase: FetchExecutionFilesUseCase,
    private submitExecutionResultsUseCase: SubmitExecutionResultsUseCase,
    private getSubmissionWithResultsUseCase: GetSubmissionWithResultsUseCase,
    private getAllSubmissionsForProblemUseCase: GetAllSubmissionsForProblemUseCase,
    private getLatestSubmissionForProblemUseCase: GetLatestSubmissionForProblemUseCase,
    private getLeaderboardUseCase: GetLeaderboardUseCase,
    private getSubmissionCodeUseCase: GetSubmissionCodeUseCase,
  ) {}

  public async makeSubmission(req: AuthenticatedRequest, res: Response) {
    const { problemId, setupId } = req.params;
    let { temporary } = req.body;
    const file = req.file;
    const userId = req.user!;

    if(!file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }
 
    temporary = (temporary === "true" ? true : false);

    try {
      const output = await this.makeSubmissionUseCase.execute({
        userId,
        problemId,
        setupId,
        fileContent: file.buffer,
        temporary
      });
    
      return res.status(201).json(output);
    } catch (error) {
      handleError(error, res);
    }
  }

  public async getSubmission(req: AuthenticatedRequest, res: Response) {
    const { submissionId } = req.params;
    const userId = req.user!;
  
    try {
      const output = await this.getSubmissionUseCase.execute({ 
        submissionId,
        userId,
      });

      return res.status(200).json(output);
    } catch (error) {
      handleError(error, res);
    }
  }

  public async fetchExecutionFiles(req: AuthenticatedRequest, res: Response) {
    const { submissionId } = req.params;
    const userId = req.user!;

    try {
      const output = await this.fetchExecutionFilesUseCase.execute({ 
        submissionId,
        userId
      });
      return res.status(200).json(output);
    } catch (error) {
      handleError(error, res);
    }
  }

  public async submitExecutionResults(req: AuthenticatedRequest, res: Response) {
    const { submissionId } = req.params;
    const { status } = req.body;
    const file = req.file;
    const userId = req.user!;

    if (!file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    try {
      const output = await this.submitExecutionResultsUseCase.execute({
        submissionId,
        fileContent: file.buffer,
        userId,
        status,
      });

      return res.status(200).json(output);
    } catch (error) {
      handleError(error, res);
    }   
  }

  public async getSubmissionWithResults(req: AuthenticatedRequest, res: Response) {
    const { submissionId } = req.params;
    const userId = req.user!;

    try {
      const output = await this.getSubmissionWithResultsUseCase.execute({ 
        submissionId,
        userId
      });

      return res.status(200).json(output);
    } catch (error) {
      handleError(error, res);
    } 
  }

  public async getAllSubmissionsForProblem(req: AuthenticatedRequest, res: Response) {
    const { problemId } = req.params;
    const userId = req.user!;

    try {
      const output = await this.getAllSubmissionsForProblemUseCase.execute({ 
        problemId, 
        userId
      });

      return res.status(200).json(output);
    } catch (error) {
      handleError(error, res);
    }
  }

  public async getLatestSubmissionForProblem(req: AuthenticatedRequest, res: Response) {
    const { problemId } = req.params;
    const userId = req.user!;

    try {
      const output = await this.getLatestSubmissionForProblemUseCase.execute({
        problemId,
        userId
      });

      return res.status(200).json(output);
    } catch (error) {
      handleError(error, res);
    }
  }

  public async getLeaderboard(req: AuthenticatedRequest, res: Response) {
    const { setupId } = req.params;

    try {
      const output = await this.getLeaderboardUseCase.execute({ setupId });
      return res.status(200).json(output);
    } catch (error) {
      handleError(error, res);
    }
  }

  public async getSubmissionCode(req: AuthenticatedRequest, res: Response) {
    const { submissionId } = req.params;
    const userId = req.user!;

    try {
      const { codeBuffer } = await this.getSubmissionCodeUseCase.execute({ submissionId, userId });
      res.setHeader("Content-Type", "application/zip");
      res.setHeader("Content-Disposition", `attachment; filename="submission-${submissionId}.zip"`);
      return res.status(200).send(codeBuffer);
    } catch (error) {
      handleError(error, res);
    }
  }
}

