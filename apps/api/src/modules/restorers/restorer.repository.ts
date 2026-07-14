import { Injectable } from "@nestjs/common";
import type { Restorer } from "@nogal/database";
import { PrismaService } from "@/modules/prisma/prisma.service";

@Injectable()
export class RestorerRepository {
  constructor(private readonly prisma: PrismaService) {}

  findMany(): Promise<Restorer[]> {
    return this.prisma.client.restorer.findMany({
      orderBy: { name: "asc" },
    });
  }

  findActive(): Promise<Restorer[]> {
    return this.prisma.client.restorer.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    });
  }

  findById(id: string): Promise<Restorer | null> {
    return this.prisma.client.restorer.findUnique({ where: { id } });
  }

  create(data: {
    name: string;
    specialty?: string;
    phone?: string;
    email?: string;
    city?: string;
    notes?: string;
  }): Promise<Restorer> {
    return this.prisma.client.restorer.create({ data });
  }

  update(
    id: string,
    data: {
      name?: string;
      specialty?: string;
      phone?: string;
      email?: string;
      city?: string;
      notes?: string;
      isActive?: boolean;
    },
  ): Promise<Restorer> {
    return this.prisma.client.restorer.update({ where: { id }, data });
  }
}
