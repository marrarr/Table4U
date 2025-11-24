import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Rezerwacja } from './rezerwacja.entity';

@Entity('klient')
export class Klient {
  @PrimaryGeneratedColumn()
  klient_id: number;

  @Column({
    type: 'varchar',
    nullable: false,
  })
  imie: string;

  @Column({
    type: 'varchar',
    nullable: false,
  })
  nazwisko: string;

  @Column({
    type: 'varchar',
    nullable: false,
  })
  telefon: string;

  @Column({
    type: 'varchar',
    nullable: false,
  })
  email: string;

  @OneToMany(() => Rezerwacja, (rezerwacja) => rezerwacja.klient)
  rezerwacje: Rezerwacja[];
}
