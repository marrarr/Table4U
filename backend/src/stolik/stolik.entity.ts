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
  numer_stolika: number;

  @Column({
    type: 'integer',
    nullable: false,
  })
  ilosc_miejsc: number;

  @Column({
    type: 'varchar',
    nullable: false,
  })
  lokalizacja: string;

  @OneToMany(() => Rezerwacja, (rezerwacja) => rezerwacja.stolik)
  rezerwacje: Rezerwacja[];
}
