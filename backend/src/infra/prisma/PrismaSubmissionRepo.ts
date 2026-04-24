import { PrismaClient } from "../../generated/prisma/client";
import { ISubmissionRepo } from "../../domain/repos/ISubmissionRepo";
import { Submission } from "../../domain/entities/Submission";

export class PrismaSubmissionRepo implements ISubmissionRepo {
  constructor(private prisma: PrismaClient) {}

  async save(submission: Submission): Promise<void> {
    await this.prisma.submission.upsert({
      where: { id: submission.id },
      update: {
        userId: submission.userId,
        problemId: submission.problemId,
        setupId: submission.setupId,
        codeFileKey: submission.codeFileKey,
        resultsFileKey: submission.resultsFileKey ?? null,
        status: submission.status,
        temporary: submission.temporary,
        submittedAt: submission.submittedAt,
        finishedAt: submission.finishedAt ?? null,
      },
      create: {
        id: submission.id,
        userId: submission.userId,
        problemId: submission.problemId,
        setupId: submission.setupId,
        codeFileKey: submission.codeFileKey,
        resultsFileKey: submission.resultsFileKey ?? null,
        status: submission.status,
        temporary: submission.temporary,
        submittedAt: submission.submittedAt,
        finishedAt: submission.finishedAt ?? null,
      },
    });
  }

  async findById(id: string): Promise<Submission | null> {
    const submission = await this.prisma.submission.findUnique({
      where: { id },
    });
    return submission ? this.map(submission) : null;
  }

  async findAllByUserId(userId: string): Promise<Submission[]> {
    const submissions = await this.prisma.submission.findMany({
      where: { userId },
      orderBy: { submittedAt: "desc" },
    });
    return submissions.map(this.map);
  }

  async findNonTemporaryByUserId(userId: string): Promise<Submission[]> {
    const submissions = await this.prisma.submission.findMany({
      where: { userId, temporary: false },
      orderBy: { submittedAt: "desc" },
    });
    return submissions.map(this.map);
  }

  async findSolvedProblemDifficulties(userId: string): Promise<Array<{problemId: string, difficulty: string}>> {
    const rows = await this.prisma.submission.findMany({
      where: { userId, temporary: false, status: "ACCEPTED" },
      distinct: ["problemId"],
      select: {
        problemId: true,
        problem: { select: { difficulty: true } },
      },
    });
    return rows.map((r: any) => ({ problemId: r.problemId, difficulty: r.problem.difficulty }));
  }

  async findAllByUserIdAndProblemId(
    userId: string,
    problemId: string
  ): Promise<Submission[]> {
    const submissions = await this.prisma.submission.findMany({
      where: {
        userId,
        problemId,
      },
      orderBy: { submittedAt: "desc" },
    });
    return submissions.map(this.map);
  }

  async findLatestByUserIdAndProblemId(userId: string, problemId: string): Promise<Submission | null> {
    const submission = await this.prisma.submission.findFirst({
      where: {
        userId,
        problemId,
      },
      orderBy: {
        submittedAt: 'desc',
      },
    });

    return submission ? this.map(submission) : null;
  }

  async findAllByStatusBeforeDate(status: string, date: Date): Promise<Submission[]> {
    const submissions = await this.prisma.submission.findMany({
      where: {
        status,
        submittedAt: { lt: date },
      },
    });
    return submissions.map(this.map);
  }

  async findAllTemporaryBeforeDate(date: Date): Promise<Submission[]> {
    const submissions = await this.prisma.submission.findMany({
      where: {
        temporary: true,
        submittedAt: { lt: date },
      },
    });
    return submissions.map(this.map);
  }

  async deleteById(id: string): Promise<void> {
    await this.prisma.submission.delete({
      where: { id },
    });
  }

  private map = (s: any): Submission => ({
    id: s.id,
    userId: s.userId,
    problemId: s.problemId,
    setupId: s.setupId,
    codeFileKey: s.codeFileKey,
    resultsFileKey: s.resultsFileKey,
    status: s.status,
    temporary: s.temporary,
    submittedAt: s.submittedAt,
    finishedAt: s.finishedAt,
  });
}
