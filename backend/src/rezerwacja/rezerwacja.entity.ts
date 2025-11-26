import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Uzytkownik } from '../uzytkownik/uzytkownik.entity';
import { Stolik } from '../stolik/stolik.entity';
import { Restauracja } from '../restauracja/restauracja.entity';

@Entity('rezerwacja')
export class Rezerwacja {
  @PrimaryGeneratedColumn()
  rezerwacja_id: number;

  @Column()
  klient_id: number;

  @Column()
  pracownik_id: number;

  @Column()
  stolik_id: number;

  @Column()
  restauracja_id: number;

  @Column({ type: 'datetime' })
  data_utworzenia: Date;

  @Column({ type: 'date' })
  data_rezerwacji: Date;

  @Column({ type: 'time' })
  godzina_od: string;

  @Column({ type: 'time' })
  godzina_do: string;

  @Column({ type: 'varchar', length: 50 })
  status: string;

  // Relacje z innymi tabelami

  @ManyToOne(() => Uzytkownik)
  @JoinColumn({ name: 'uzytkownik_id' })
  uzytkownik: Uzytkownik;

  @ManyToOne(() => Stolik)
  @JoinColumn({ name: 'stolik_id' })
  stolik: Stolik;

  @ManyToOne(() => Restauracja)
  @JoinColumn({ name: 'restauracja_id' })
  restauracja: Restauracja;
}
