import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "src/resources/user/entities/user.entity";
import { Project } from "./project.entity";
import { ProjectRole } from "../enums/project-role";

@Entity()
export class UserProjectRole {

    @PrimaryGeneratedColumn("uuid")
    readonly id: string;

    @ManyToOne(() => User, (user) => user.userProjectRole, { onDelete: 'CASCADE' })
    user: User;

    @ManyToOne(() => Project, (project) => project.userProjectRoles, { onDelete: 'CASCADE' })
    project: Project;

    @Column({ type: process.env.NODE_ENV === 'test' ? 'varchar' : 'enum', enum: ProjectRole, default: ProjectRole.EDITOR })
    projectRole: ProjectRole;

    @Column({ type: process.env.NODE_ENV === 'test' ? 'datetime' : 'timestamptz' })
    createdAt: Date;

}
