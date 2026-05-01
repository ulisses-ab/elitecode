import { PrismaClient } from "../../generated/prisma/client";
import { IResourceRepo } from "../../domain/repos/IResourceRepo";
import { Resource } from "../../domain/entities/Resource";

export class PrismaResourceRepo implements IResourceRepo {
  constructor(private prisma: PrismaClient) {}

  async findAll(): Promise<Resource[]> {
    const rows = await this.prisma.resource.findMany({ orderBy: { order: "asc" } });
    return rows.map(this.map);
  }

  async findById(id: string): Promise<Resource | null> {
    const row = await this.prisma.resource.findUnique({ where: { id } });
    return row ? this.map(row) : null;
  }

  async findByProblemId(problemId: string): Promise<Resource[]> {
    const rows = await this.prisma.resource.findMany({
      where: { problems: { some: { id: problemId } } },
      orderBy: { order: "asc" },
    });
    return rows.map(this.map);
  }

  async save(resource: Resource): Promise<void> {
    await this.prisma.resource.upsert({
      where: { id: resource.id },
      update: {
        title: resource.title,
        content: resource.content,
        order: resource.order,
        updatedAt: resource.updatedAt,
      },
      create: {
        id: resource.id,
        title: resource.title,
        content: resource.content,
        order: resource.order,
        createdAt: resource.createdAt,
        updatedAt: resource.updatedAt,
      },
    });
  }

  async deleteById(id: string): Promise<void> {
    await this.prisma.resource.delete({ where: { id } });
  }

  async linkToProblem(resourceId: string, problemId: string): Promise<void> {
    await this.prisma.resource.update({
      where: { id: resourceId },
      data: { problems: { connect: { id: problemId } } },
    });
  }

  async unlinkFromProblem(resourceId: string, problemId: string): Promise<void> {
    await this.prisma.resource.update({
      where: { id: resourceId },
      data: { problems: { disconnect: { id: problemId } } },
    });
  }

  private map = (r: any): Resource => ({
    id: r.id,
    title: r.title,
    content: r.content,
    order: r.order,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  });
}
