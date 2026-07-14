import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { Roles } from "@/common/decorators/roles.decorator";
import { RoleName } from "@/common/graphql/role-name.enum";
import { CreateRestorerInput } from "./dto/create-restorer.input";
import { UpdateRestorerInput } from "./dto/update-restorer.input";
import { RestorerEntity } from "./entities/restorer.entity";
import { RestorerService } from "./restorer.service";

@Roles(RoleName.MODERATOR, RoleName.ADMIN)
@Resolver(() => RestorerEntity)
export class RestorerResolver {
  constructor(private readonly restorerService: RestorerService) {}

  @Query(() => [RestorerEntity])
  restorers(): Promise<RestorerEntity[]> {
    return this.restorerService.findAll();
  }

  @Query(() => RestorerEntity)
  restorer(@Args("id") id: string): Promise<RestorerEntity> {
    return this.restorerService.findById(id);
  }

  /** Poblado para el selector de "derivar a restaurador" en el panel de
   * clasificación — solo restauradores activos. */
  @Query(() => [RestorerEntity])
  activeRestorers(): Promise<RestorerEntity[]> {
    return this.restorerService.findActive();
  }

  @Mutation(() => RestorerEntity)
  createRestorer(
    @Args("input") input: CreateRestorerInput,
  ): Promise<RestorerEntity> {
    return this.restorerService.create(input);
  }

  @Mutation(() => RestorerEntity)
  updateRestorer(
    @Args("input") input: UpdateRestorerInput,
  ): Promise<RestorerEntity> {
    return this.restorerService.update(input);
  }

  @Mutation(() => RestorerEntity)
  setRestorerActive(
    @Args("id") id: string,
    @Args("isActive") isActive: boolean,
  ): Promise<RestorerEntity> {
    return this.restorerService.setActive(id, isActive);
  }
}
