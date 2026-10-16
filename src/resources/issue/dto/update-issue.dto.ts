import { ApiProperty } from "@nestjs/swagger";
import { Field, ID, InputType } from "@nestjs/graphql";
import { IssueType } from "../enums/issue-type";
import { IssueStatus } from "../enums/issue-status";
import { IssuePriority } from "../enums/issue-priority";

@InputType()
export class UpdateIssueDto {

    @ApiProperty({ type: String, description: 'Issue\'s title.', example: 'Login button is unresponsive on mobile', required: false })
    @Field({ nullable: true })
    title?: string;

    @ApiProperty({ type: String, description: 'Issue\'s description.', example: 'Tapping the login button on iOS Safari does nothing.', required: false })
    @Field({ nullable: true })
    description?: string;

    @ApiProperty({ type: String, enum: IssueType, description: 'Issue\'s type.', example: IssueType.BUG, required: false })
    @Field(() => IssueType, { nullable: true })
    type?: IssueType;

    @ApiProperty({ type: String, enum: IssueStatus, description: 'Issue\'s status.', example: IssueStatus.IN_PROGRESS, required: false })
    @Field(() => IssueStatus, { nullable: true })
    status?: IssueStatus;

    @ApiProperty({ type: String, enum: IssuePriority, description: 'Issue\'s priority.', example: IssuePriority.HIGH, required: false })
    @Field(() => IssuePriority, { nullable: true })
    priority?: IssuePriority;

    @ApiProperty({ type: String, description: 'Id of the user to assign this issue to. Pass null to unassign.', example: 'af7c1fe6-d669-414e-b066-e9733f0de7a8', required: false, nullable: true })
    @Field(() => ID, { nullable: true })
    assigneeId?: string | null;

    @ApiProperty({ type: Date, description: 'Issue\'s due date. Pass null to clear it.', example: '2026-12-01T00:00:00.000Z', required: false, nullable: true })
    @Field({ nullable: true })
    dueDate?: Date | null;

    @ApiProperty({ type: String, isArray: true, description: 'Ids of the labels this issue should have (replaces the current set).', example: ['3b0872df-d47a-48f4-964e-b6a099964ee7'], required: false })
    @Field(() => [ID], { nullable: true })
    labelIds?: string[];

}
