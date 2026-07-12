import { Field, ObjectType } from "@nestjs/graphql";
import { NotificationType } from "@/common/graphql/notification-type.enum";

/**
 * El `payload` crudo (Json) nunca se expone por GraphQL: cada tipo de
 * notificación tiene una forma distinta y obligaría al frontend a conocer
 * esos detalles. En su lugar, el resolver ya entrega `message`/`link`
 * formateados (ver notification.format.ts) — el cliente solo renderiza.
 */
@ObjectType()
export class NotificationEntity {
  @Field()
  id!: string;

  @Field(() => NotificationType)
  type!: NotificationType;

  @Field()
  message!: string;

  @Field(() => String, { nullable: true })
  link?: string | null;

  @Field(() => Boolean)
  read!: boolean;

  @Field()
  createdAt!: Date;
}
