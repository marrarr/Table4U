import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Rezerwacja } from '../rezerwacja/rezerwacja.entity';

@Entity('stolik')
export class Stolik {
  @PrimaryGeneratedColumn()
  stolik_id: number;

  @Column({
    type: 'integer',
    nullable: false,
  })
  imie: number;

  @Column({
    type: 'integer',
    nullable: false,
  })
  nazwisko: number;

  @Column({
    type: 'varchar',
    nullable: false,
  })
  email: string;

  @OneToMany(() => Rezerwacja, (rezerwacja) => rezerwacja.stolik)
  rezerwacje: Rezerwacja[];
}
