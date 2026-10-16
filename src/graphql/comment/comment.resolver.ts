import { Resolver, Query, Args, Mutation } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { CommentService } from 'src/resources/comment/comment.service';
import { Comment } from 'src/resources/comment/entities/comment.entity';
import { CreateCommentDto } from 'src/resources/comment/dto/create-comment.dto';
import { UpdateCommentDto } from 'src/resources/comment/dto/update-comment.dto';
import { PublicCommentDto } from 'src/resources/comment/dto/public-comment.dto';
import { AuthenticatedGuard } from 'src/auth/guards/authenticated.guard';
import { CurrentUser } from 'src/auth/current-user';
import { CurrentUserDecorator } from '../current-user.decorator';

@Resolver(() => PublicCommentDto)
@UseGuards(AuthenticatedGuard)
export class CommentResolver {
    constructor(private commentService: CommentService) { }

    @Query(() => [PublicCommentDto])
    async comments(
        @Args('issueId') issueId: string,
        @CurrentUserDecorator() user: CurrentUser,
    ): Promise<PublicCommentDto[]> {
        const comments: Comment[] = await this.commentService.findAllByIssueId(issueId, user.id);
        return comments.map(comment => new PublicCommentDto(comment));
    }

    @Mutation(() => PublicCommentDto)
    async createComment(
        @Args('input') createCommentDto: CreateCommentDto,
        @CurrentUserDecorator() user: CurrentUser,
    ): Promise<PublicCommentDto> {
        const comment: Comment = await this.commentService.create(createCommentDto, user.id);
        return new PublicCommentDto(comment);
    }

    @Mutation(() => PublicCommentDto)
    async updateComment(
        @Args('id') id: string,
        @Args('input') updateCommentDto: UpdateCommentDto,
        @CurrentUserDecorator() user: CurrentUser,
    ): Promise<PublicCommentDto> {
        const comment: Comment = await this.commentService.update(id, updateCommentDto, user.id);
        return new PublicCommentDto(comment);
    }

    @Mutation(() => Boolean)
    async removeComment(
        @Args('id') id: string,
        @CurrentUserDecorator() user: CurrentUser,
    ): Promise<boolean> {
        return await this.commentService.remove(id, user.id);
    }
}
