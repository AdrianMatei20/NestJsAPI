import { ApiProperty } from "@nestjs/swagger";
import { PublicUserDto } from "../../../../src/resources/user/dto/public-user.dto";
import { Project } from "../entities/project.entity";
import { ProjectRole } from "../enums/project-role";
import { User } from "../../../../src/resources/user/entities/user.entity";

export class ProjectMember {
    @ApiProperty({ type: String, description: 'User\'s id.', example: 'af7c1fe6-d669-414e-b066-e9733f0de7a8' })
    readonly id: string;

    @ApiProperty({ type: String, description: 'User\'s firstname.', example: 'Adrian' })
    readonly firstname: string;

    @ApiProperty({ type: String, description: 'User\'s lastname.', example: 'Matei' })
    readonly lastname: string;

    @ApiProperty({ type: String, description: 'User\'s email address.', example: 'adrian.matei@fakemail.com' })
    readonly email: string;

    @ApiProperty({ type: Date, description: 'User\'s join date.', example: new Date('2024-01-01T12:00:00Z') })
    readonly createdAt: Date;
    
    @ApiProperty({ type: process.env.NODE_ENV === 'test' ? 'varchar' : 'enum', enum: ProjectRole, description: 'User\'s role.', example: ProjectRole.MEMBER })
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

export class PublicProjectDto {

    @ApiProperty({ type: String, description: 'Project\'s id.', example: '08c71152-c552-42e7-b094-f510ff44e9cb' })
    readonly id: string;

    @ApiProperty({ type: String, description: 'Project\'s name.', example: 'Lorem ipsum' })
    readonly name: string;

    @ApiProperty({ type: String, description: 'Project\'s description.', example: 'Lorem ipsum dolor sit amet consectetur adipisicing elit.' })
    readonly description: string;

    @ApiProperty({ type: Date, description: 'Project\'s creation date.', example: '1999-09-23T00:00:00.000Z' })
    readonly createdAt: Date;

    @ApiProperty({ type: PublicUserDto, description: 'Project\'s owner.', example: { id: 'af7c1fe6-d669-414e-b066-e9733f0de7a8', firstname: 'Adrian', lastname: 'Matei', email: 'adrian.matei@fakemail.com' } })
    readonly owner: PublicUserDto;

    @ApiProperty({ type: PublicUserDto, isArray: true, description: 'Project members.', example: { id: 'af7c1fe6-d669-414e-b066-e9733f0de7a8', firstname: 'Adrian', lastname: 'Matei', email: 'adrian.matei@fakemail.com' } })
    readonly members: ProjectMember[];

    constructor(project: Project) {
        this.id = project.id;
        this.name = project.name;
        this.description = project.description;
        this.createdAt = project.createdAt;

        const projectMembers = project.userProjectRoles.map(userProjectRole => new ProjectMember(userProjectRole.user, userProjectRole.projectRole));

        this.members = projectMembers.sort((a, b) => {
            const roleA = Object.values(ProjectRole).indexOf(a.projectRole);
            const roleB = Object.values(ProjectRole).indexOf(b.projectRole);
            return roleA - roleB;
        })
    }

}
