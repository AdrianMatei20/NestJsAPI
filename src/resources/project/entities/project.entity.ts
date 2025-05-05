import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { UserProjectRole } from "./user-project-role.entity";
import { Field, ID, ObjectType } from "@nestjs/graphql";

@Entity()
@ObjectType()
export class Project {

    @PrimaryGeneratedColumn("uuid")
    @Field(() => ID)
    readonly id: string;

    @Column({ length: 25 })
    @Field()
    name: string;

    @Column({ length: 500 })
    @Field()
    description: string;

    @Column({ type: process.env.NODE_ENV === 'test' ? 'datetime' : 'timestamptz' })
    @Field()
    createdAt: Date;

    @OneToMany(() => UserProjectRole, (userProjectRole) => userProjectRole.project, { cascade: true })
    userProjectRoles: UserProjectRole[];

}
