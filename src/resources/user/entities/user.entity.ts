import { ResetPassword } from "src/auth/reset-password/reset-password.entity";
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from "typeorm";
import { GlobalRole } from "../enums/global-role";
import { UserProjectRole } from "src/resources/project/entities/user-project-role.entity";

@Entity()
export class User {

    @PrimaryGeneratedColumn("uuid")
    readonly id: string;

    @Column({ length: 25 })
    firstname: string;

    @Column({ length: 25 })
    lastname: string;

    @Column({ length: 100 })
    email: string;

    @Column({ length: 100 })
    password: string;

    @Column('boolean', {default: false})
    emailVerified: boolean;

    @Column({type: 'enum', enum: GlobalRole, default: GlobalRole.REGULAR_USER})
    globalRole: GlobalRole;

    @Column({ type: 'timestamptz' })
    createdAt: Date;

    @OneToMany(() => ResetPassword, (resetPassword) => resetPassword.user)
    resetPassword: ResetPassword[];
    
    @OneToMany(() => UserProjectRole, (userProjectRole) => userProjectRole.user)
    userProjectRole: UserProjectRole[];

}
