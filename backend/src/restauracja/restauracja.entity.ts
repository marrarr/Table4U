import { Entity, PrimaryGeneratedColumn, Column, OneToOne, OneToMany, ManyToMany } from 'typeorm';
import { Rezerwacja } from '../rezerwacja/rezerwacja.entity';
import { Uzytkownik } from '../uzytkownik/uzytkownik.entity';
import { RestauracjaObraz } from './obrazy/restauracjaObraz.entity';
import { Stolik } from '../stolik/stolik.entity';

@Entity('restauracja')
export class Restauracja {
  @PrimaryGeneratedColumn()
  restauracja_id: number;

  @Column({
    type: 'varchar',
    nullable: false,
  })
  nazwa: string;

  @Column({
    type: 'varchar',
    nullable: false,
  })
  adres: string;

  @Column({
    type: 'varchar',
    nullable: false,
  })
  nr_kontaktowy: string;

  @Column({
    type: 'varchar',
    nullable: false,
  })
  email: string;

  @OneToMany(() => Rezerwacja, (rezerwacja) => rezerwacja.restauracja)
  rezerwacje: Rezerwacja[];

  @ManyToMany(() => Uzytkownik, (uzytkownik) => uzytkownik.restauracje, {
    cascade: true,
  })
  wlasciciele: Uzytkownik[];

  @OneToOne(() => RestauracjaObraz, (obraz) => obraz.restauracja, {
    cascade: true,
  })
  obraz: RestauracjaObraz | null;

  @OneToMany(() => Stolik, (stolik) => stolik.restauracja)
  stoliki: Stolik[];
}
