import { ResetPassword } from "src/auth/reset-password/reset-password.entity";
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from "typeorm";

@Entity()
export class User {

    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    firstname: string;

    @Column()
    lastname: string;

    @Column()
    email: string;

    @Column()
    password: string;

    @Column('boolean', {default: false})
    emailVerified: boolean;

    @OneToMany(() => ResetPassword, (resetPassword) => resetPassword.user)
    resetPassword: ResetPassword[];
}
