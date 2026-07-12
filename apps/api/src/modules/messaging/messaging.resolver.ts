import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import type { AuthTokenPayload } from "@/common/guards/jwt-auth.guard";
import { ConversationEntity, MessageEntity } from "./entities/conversation.entity";
import { MessagingService } from "./messaging.service";

@Resolver()
export class MessagingResolver {
  constructor(private readonly messagingService: MessagingService) {}

  @Query(() => [ConversationEntity])
  myConversations(
    @CurrentUser() authUser: AuthTokenPayload,
  ): Promise<ConversationEntity[]> {
    return this.messagingService.listForUser(authUser.sub);
  }

  @Query(() => ConversationEntity)
  conversation(
    @CurrentUser() authUser: AuthTokenPayload,
    @Args("id") id: string,
  ): Promise<ConversationEntity> {
    return this.messagingService.findByIdForUser(id, authUser.sub);
  }

  @Mutation(() => String)
  startConversation(
    @CurrentUser() authUser: AuthTokenPayload,
    @Args("furnitureId") furnitureId: string,
  ): Promise<string> {
    return this.messagingService.startConversation(authUser.sub, furnitureId);
  }

  @Mutation(() => MessageEntity)
  sendMessage(
    @CurrentUser() authUser: AuthTokenPayload,
    @Args("conversationId") conversationId: string,
    @Args("body") body: string,
  ): Promise<MessageEntity> {
    return this.messagingService.sendMessage(
      conversationId,
      authUser.sub,
      body,
    );
  }
}
