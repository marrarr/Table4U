import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Rezerwacja } from './rezerwacja.entity';

@Entity('pracownik')
export class Pracownik {
  @PrimaryGeneratedColumn()
  pracownik_id: number;

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
  rola: string;

  @Column({
    type: 'varchar',
    nullable: false,
  })
  login: string;

  @Column({
    type: 'varchar',
    nullable: false,
  })
  haslo: string;

  @OneToMany(() => Rezerwacja, (rezerwacja) => rezerwacja.pracownik)
  rezerwacje: Rezerwacja[];
}
