import { ApiProperty } from "@nestjs/swagger";
import { Project } from "../entities/project.entity";
import { ProjectRole } from "../enums/project-role";
import { User } from "src/resources/user/entities/user.entity";
import { Field, ID, ObjectType } from "@nestjs/graphql";
import { UserProjectRole } from "../entities/user-project-role.entity";

@ObjectType()
export class ProjectMember {
    @ApiProperty({ type: String, description: 'User\'s id.', example: 'af7c1fe6-d669-414e-b066-e9733f0de7a8' })
    @Field(() => ID)
    readonly id: string;

    @ApiProperty({ type: String, description: 'User\'s firstname.', example: 'Adrian' })
    @Field()
    readonly firstname: string;

    @ApiProperty({ type: String, description: 'User\'s lastname.', example: 'Matei' })
    @Field()
    readonly lastname: string;

    @ApiProperty({ type: String, description: 'User\'s email address.', example: 'adrian.matei@fakemail.com' })
    @Field()
    readonly email: string;

    @ApiProperty({ type: Date, description: 'User\'s join date.', example: new Date('2024-01-01T12:00:00Z') })
    @Field()
    readonly createdAt: Date;

    @ApiProperty({ type: process.env.NODE_ENV === 'test' ? 'varchar' : 'enum', enum: ProjectRole, description: 'User\'s role.', example: ProjectRole.EDITOR })
    @Field(() => ProjectRole)
    readonly projectRole: ProjectRole;

    constructor(user: User, projectRole: ProjectRole) {
        this.id = user.id;
        this.firstname = user.firstname;
        this.lastname = user.lastname;
        this.email = user.email;
        this.createdAt = user.createdAt;
        this.projectRole = projectRole;
    }
}

@ObjectType()
export class PublicProjectDto {

    @ApiProperty({ type: String, description: 'Project\'s id.', example: '08c71152-c552-42e7-b094-f510ff44e9cb' })
    @Field(() => ID)
    readonly id: string;

    @ApiProperty({ type: String, description: 'Project\'s name.', example: 'Lorem ipsum' })
    @Field()
    readonly name: string;

    @ApiProperty({ type: String, description: 'Project\'s description.', example: 'Lorem ipsum dolor sit amet consectetur adipisicing elit.' })
    @Field()
    readonly description: string;

    @ApiProperty({ type: Date, description: 'Project\'s creation date.', example: '1999-09-23T00:00:00.000Z' })
    @Field()
    readonly createdAt: Date;

    @ApiProperty({ type: ProjectMember, description: 'Project\'s owner.', example: { id: 'af7c1fe6-d669-414e-b066-e9733f0de7a8', firstname: 'Adrian', lastname: 'Matei', email: 'adrian.matei@fakemail.com' } })
    @Field(() => ProjectMember)
    readonly owner: ProjectMember;

    @ApiProperty({ type: ProjectMember, isArray: true, description: 'Project members.', example: { id: 'af7c1fe6-d669-414e-b066-e9733f0de7a8', firstname: 'Adrian', lastname: 'Matei', email: 'adrian.matei@fakemail.com' } })
    @Field(() => [ProjectMember])
    readonly members: ProjectMember[] = [];

    constructor(project: Project) {
        this.id = project.id;
        this.name = project.name;
        this.description = project.description;
        this.createdAt = project.createdAt;

        if (project.userProjectRoles) {
            const ownerRole = project.userProjectRoles.find(upr => upr.projectRole === ProjectRole.OWNER);
            if (ownerRole) {
                this.owner = new ProjectMember(ownerRole.user, ProjectRole.OWNER);
            }

            const projectMembers = project.userProjectRoles
                .filter(userProjectRole => userProjectRole.projectRole !== ProjectRole.OWNER)
                .map(userProjectRole => new ProjectMember(userProjectRole.user, userProjectRole.projectRole));

            this.members = projectMembers.sort((a, b) => {
                const roleA = Object.values(ProjectRole).indexOf(a.projectRole);
                const roleB = Object.values(ProjectRole).indexOf(b.projectRole);
                return roleA - roleB;
            });
        }
    }

}
