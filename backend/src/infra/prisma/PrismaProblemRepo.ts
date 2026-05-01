import { PrismaClient } from "../../generated/prisma/client";
import { IProblemRepo } from "../../domain/repos/IProblemRepo";
import { Problem } from "../../domain/entities/Problem";
import { ProblemSetup } from "../../domain/entities/ProblemSetup";
import { Difficulty } from "../../domain/types/Difficulty";
import { Language } from "../../domain/types/Language";

export class PrismaProblemRepo implements IProblemRepo {
  constructor(private prisma: PrismaClient) {}

  async findById(id: string): Promise<Problem | null> {
    const problem = await this.prisma.problem.findUnique({
      where: { id },
      include: {
        setups: true,
      },
    });

    return problem ? this.map(problem) : null;
  }

  async findBySlug(slug: string): Promise<Problem | null> {
    const problem = await this.prisma.problem.findUnique({
      where: { slug },
      include: { setups: true },
    });
    return problem ? this.map(problem) : null;
  }

  async findFiltered(
    limit?: number,
    offset?: number,
    searchText?: string,
    difficulty?: Difficulty,
    language?: Language
  ): Promise<Problem[]> {
    const where: any = {
      AND: [],
    };

    if(searchText) {
      where.AND.push({
        title: {
          contains: searchText,
          mode: "insensitive",
        },
      });
    }

    if(difficulty) {
      where.AND.push({ difficulty });
    }

    if(language) {
      where.AND.push({
        setups: {
          some: { language },
        },
      });
    }

    const problems = await this.prisma.problem.findMany({
      where,
      include: {
        setups: true,
      },
      skip: offset,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
    });

    return problems.map(this.map);
  }

  async save(problem: Problem): Promise<void> {
    await this.prisma.problem.upsert({
      where: { id: problem.id },
      update: {
        title: problem.title,
        statement: problem.statement,
        difficulty: problem.difficulty,
        description: problem.description,
        tags: problem.tags,
        creatorId: problem.creatorId,
        updatedAt: problem.updatedAt,
        defaultTestsFileKey: problem.defaultTestsFileKey,

        setups: {
          upsert: problem.setups.map((s) => ({
            where: { id: s.id },
            update: {
              language: s.language,
              info: s.info,
              templateFileKey: s.templateFileKey ?? null,
              runnerFileKey: s.runnerFileKey ?? null,
              testsFileKey: s.testsFileKey ?? null,
              updatedAt: s.updatedAt,
            },
            create: {
              id: s.id,
              language: s.language,
              info: s.info,
              templateFileKey: s.templateFileKey ?? null,
              runnerFileKey: s.runnerFileKey ?? null,
              testsFileKey: s.testsFileKey ?? null,
              createdAt: s.createdAt,
              updatedAt: s.updatedAt,
            },
          })),
        },
      },
      create: {
        id: problem.id,
        slug: problem.slug,
        title: problem.title,
        statement: problem.statement,
        description: problem.description,
        difficulty: problem.difficulty,
        tags: problem.tags,
        creatorId: problem.creatorId,
        createdAt: problem.createdAt,
        updatedAt: problem.updatedAt,
        defaultTestsFileKey: problem.defaultTestsFileKey,

        setups: {
          createMany: {
            data: problem.setups.map((s) => ({
              id: s.id,
              language: s.language,
              info: s.info,
              templateFileKey: s.templateFileKey ?? null,
              runnerFileKey: s.runnerFileKey ?? null,
              testsFileKey: s.testsFileKey ?? null,
              createdAt: s.createdAt,
              updatedAt: s.updatedAt,
            })),
          },
        },
      },
    });
  }

  async deleteById(id: string): Promise<void> {
    await this.prisma.problem.delete({ where: { id } });
  }

  private map = (p: any): Problem => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    statement: p.statement,
    difficulty: p.difficulty,
    tags: p.tags ?? [],
    creatorId: p.creatorId,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
    setups: p.setups.map(this.mapSetup),
    description: p.description,
    defaultTestsFileKey: p.defaultTestsFileKey,
  });

  private mapSetup = (s: any): ProblemSetup => ({
    id: s.id,
    problemId: s.problemId,
    language: s.language,
    info: s.info,
    templateFileKey: s.templateFileKey,
    runnerFileKey: s.runnerFileKey,
    testsFileKey: s.testsFileKey,
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
  });
}
