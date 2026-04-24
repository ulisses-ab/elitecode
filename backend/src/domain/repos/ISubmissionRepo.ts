import { Submission } from "../../domain/entities/Submission";

export interface ISubmissionRepo {
  save(submission: Submission): Promise<void>;

  findById(id: string): Promise<Submission | null>;
  findAllByUserId(userId: string): Promise<Submission[]>;
  findNonTemporaryByUserId(userId: string): Promise<Submission[]>;
  findSolvedProblemDifficulties(userId: string): Promise<Array<{problemId: string, difficulty: string}>>;
  findAllByUserIdAndProblemId(userId: string, problemId: string): Promise<Submission[]>;
  findLatestByUserIdAndProblemId(userId: string, problemId: string): Promise<Submission | null>;

  findAllByStatusBeforeDate(status: string, date: Date): Promise<Submission[]>;
  findAllTemporaryBeforeDate(date: Date): Promise<Submission[]>;

  deleteById(id: string): Promise<void>;
}