import { PrismaClient } from "../../generated/prisma/client";
import { ISubmissionRepo } from "../../domain/repos/ISubmissionRepo";
import { Submission } from "../../domain/entities/Submission";
import { LeaderboardRow } from "../../domain/types/LeaderboardRow";

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
        runtimeMs: submission.runtimeMs ?? null,
        memoryKb: submission.memoryKb ?? null,
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
        runtimeMs: submission.runtimeMs ?? null,
        memoryKb: submission.memoryKb ?? null,
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

  async findRecentWithDetailsByUserId(userId: string, limit: number): Promise<import("../../domain/repos/ISubmissionRepo").SubmissionWithDetails[]> {
    const rows = await this.prisma.submission.findMany({
      where: { userId, temporary: false },
      orderBy: { submittedAt: "desc" },
      take: limit,
      include: {
        problem: { select: { title: true, slug: true } },
        setup:   { select: { language: true } },
      },
    });
    return rows.map((r: any) => ({
      ...this.map(r),
      problemTitle: r.problem.title,
      problemSlug:  r.problem.slug,
      language:     r.setup.language,
    }));
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

  async findLeaderboard(setupId: string): Promise<LeaderboardRow[]> {
    const rows = await this.prisma.submission.findMany({
      where: { setupId, status: "ACCEPTED", temporary: false },
      include: { user: { select: { handle: true } }, setup: { select: { language: true } } },
      orderBy: { submittedAt: "asc" },
    });
    return rows.map((r: any) => ({
      submissionId: r.id,
      userId: r.userId,
      userHandle: r.user.handle,
      language: r.setup.language,
      runtimeMs: r.runtimeMs ?? null,
      memoryKb: r.memoryKb ?? null,
      submittedAt: r.submittedAt,
    }));
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
    runtimeMs: s.runtimeMs ?? null,
    memoryKb: s.memoryKb ?? null,
  });
}
