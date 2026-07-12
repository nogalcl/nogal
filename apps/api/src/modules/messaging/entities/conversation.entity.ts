import { Field, Int, ObjectType } from "@nestjs/graphql";
import { ConversationStatus } from "@/common/graphql/conversation-status.enum";
import { FurniturePreviewEntity } from "@/modules/furniture/entities/furniture-preview.entity";

@ObjectType()
export class ConversationParticipant {
  @Field()
  id!: string;

  @Field()
  username!: string;

  @Field()
  firstName!: string;

  @Field()
  lastName!: string;

  @Field(() => String, { nullable: true })
  avatarUrl?: string | null;
}

export function toParticipant(user: {
  id: string;
  profile: {
    username: string;
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
  } | null;
}): ConversationParticipant {
  return {
    id: user.id,
    username: user.profile?.username ?? "",
    firstName: user.profile?.firstName ?? "",
    lastName: user.profile?.lastName ?? "",
    avatarUrl: user.profile?.avatarUrl ?? null,
  };
}

@ObjectType()
export class MessageEntity {
  @Field()
  id!: string;

  @Field()
  senderId!: string;

  @Field()
  body!: string;

  @Field(() => [String])
  attachmentUrls!: string[];

  @Field(() => Boolean)
  isMine!: boolean;

  @Field(() => Boolean)
  delivered!: boolean;

  @Field(() => Boolean)
  read!: boolean;

  @Field()
  createdAt!: Date;
}

@ObjectType()
export class ConversationEntity {
  @Field()
  id!: string;

  @Field(() => FurniturePreviewEntity)
  furniture!: FurniturePreviewEntity;

  @Field(() => ConversationParticipant)
  counterpart!: ConversationParticipant;

  @Field(() => ConversationStatus)
  status!: ConversationStatus;

  @Field(() => String, { nullable: true })
  lastMessagePreview?: string | null;

  @Field(() => Int)
  unreadCount!: number;

  /** Vacío en `myConversations` (lista); poblado solo en `conversation` (detalle). */
  @Field(() => [MessageEntity])
  messages!: MessageEntity[];

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;
}
