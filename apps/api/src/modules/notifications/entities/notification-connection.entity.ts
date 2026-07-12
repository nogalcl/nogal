import { Field, Int, ObjectType } from "@nestjs/graphql";
import { NotificationEntity } from "./notification.entity";

@ObjectType()
export class NotificationConnection {
  @Field(() => [NotificationEntity])
  items!: NotificationEntity[];

  @Field(() => Int)
  total!: number;

  @Field(() => Int)
  unreadCount!: number;

  @Field(() => Int)
  page!: number;

  @Field(() => Int)
  totalPages!: number;
}
