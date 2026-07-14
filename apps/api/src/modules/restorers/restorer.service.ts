import { Injectable, NotFoundException } from "@nestjs/common";
import type { Restorer } from "@nogal/database";
import { RestorerRepository } from "./restorer.repository";
import type { CreateRestorerInput } from "./dto/create-restorer.input";
import type { UpdateRestorerInput } from "./dto/update-restorer.input";

/**
 * Directorio interno de restauradores — sin concepto de ownership, todo
 * staff (MODERATOR/ADMIN, guard en el resolver) administra el mismo
 * directorio compartido. Nunca se borra un registro: una pieza clasificada
 * históricamente puede seguir apuntando a un restaurador que ya no está
 * activo (ver EstateLiquidationPiece.recommendedRestorerId), así que
 * desactivar es siempre vía isActive, nunca DELETE.
 */
@Injectable()
export class RestorerService {
  constructor(private readonly repo: RestorerRepository) {}

  findAll(): Promise<Restorer[]> {
    return this.repo.findMany();
  }

  findActive(): Promise<Restorer[]> {
    return this.repo.findActive();
  }

  async findById(id: string): Promise<Restorer> {
    const restorer = await this.repo.findById(id);
    if (!restorer) throw new NotFoundException("Restaurador no encontrado.");
    return restorer;
  }

  create(input: CreateRestorerInput): Promise<Restorer> {
    return this.repo.create(input);
  }

  async update(input: UpdateRestorerInput): Promise<Restorer> {
    await this.findById(input.id);
    const { id, ...data } = input;
    return this.repo.update(id, data);
  }

  async setActive(id: string, isActive: boolean): Promise<Restorer> {
    await this.findById(id);
    return this.repo.update(id, { isActive });
  }
}
