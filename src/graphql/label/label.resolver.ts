import { Resolver, Query, Args, Mutation } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { LabelService } from 'src/resources/label/label.service';
import { Label } from 'src/resources/label/entities/label.entity';
import { CreateLabelDto } from 'src/resources/label/dto/create-label.dto';
import { UpdateLabelDto } from 'src/resources/label/dto/update-label.dto';
import { PublicLabelDto } from 'src/resources/label/dto/public-label.dto';
import { AuthenticatedGuard } from 'src/auth/guards/authenticated.guard';
import { CurrentUser } from 'src/auth/current-user';
import { CurrentUserDecorator } from '../current-user.decorator';

@Resolver(() => PublicLabelDto)
@UseGuards(AuthenticatedGuard)
export class LabelResolver {
    constructor(private labelService: LabelService) { }

    @Query(() => [PublicLabelDto])
    async labels(
        @Args('projectId') projectId: string,
        @CurrentUserDecorator() user: CurrentUser,
    ): Promise<PublicLabelDto[]> {
        const labels: Label[] = await this.labelService.findAllByProjectId(projectId, user.id);
        return labels.map(label => new PublicLabelDto(label));
    }

    @Query(() => PublicLabelDto)
    async label(
        @Args('id') id: string,
        @CurrentUserDecorator() user: CurrentUser,
    ): Promise<PublicLabelDto> {
        const label: Label = await this.labelService.findOneById(id, user.id);
        return new PublicLabelDto(label);
    }

    @Mutation(() => PublicLabelDto)
    async createLabel(
        @Args('input') createLabelDto: CreateLabelDto,
        @CurrentUserDecorator() user: CurrentUser,
    ): Promise<PublicLabelDto> {
        const label: Label = await this.labelService.create(createLabelDto, user.id);
        return new PublicLabelDto(label);
    }

    @Mutation(() => PublicLabelDto)
    async updateLabel(
        @Args('id') id: string,
        @Args('input') updateLabelDto: UpdateLabelDto,
        @CurrentUserDecorator() user: CurrentUser,
    ): Promise<PublicLabelDto> {
        const label: Label = await this.labelService.update(id, updateLabelDto, user.id);
        return new PublicLabelDto(label);
    }

    @Mutation(() => Boolean)
    async removeLabel(
        @Args('id') id: string,
        @CurrentUserDecorator() user: CurrentUser,
    ): Promise<boolean> {
        return await this.labelService.remove(id, user.id);
    }
}
