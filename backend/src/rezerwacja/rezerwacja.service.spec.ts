// backend/src/rezerwacja/rezerwacja.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { RezerwacjaService } from './rezerwacja.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Rezerwacja } from './rezerwacja.entity';
import { Repository } from 'typeorm';

/**
 * Testy jednostkowe dla RezerwacjaService
 * Testują funkcjonalności zarządzania rezerwacjami stolików w restauracjach
 */
describe('RezerwacjaService', () => {
  let service: RezerwacjaService;
  let repository: Repository<Rezerwacja>;

  // Mock (atrapa) repozytorium TypeORM - symuluje operacje na bazie danych
  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  // Przed każdym testem tworzymy świeżą instancję modułu testowego
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RezerwacjaService,
        {
          provide: getRepositoryToken(Rezerwacja), // Token do wstrzykiwania repozytorium
          useValue: mockRepository, // Używamy mocka zamiast prawdziwego repozytorium
        },
      ],
    }).compile();

    service = module.get<RezerwacjaService>(RezerwacjaService);
    repository = module.get<Repository<Rezerwacja>>(getRepositoryToken(Rezerwacja));
  });

  // Po każdym teście czyścimy wszystkie mocki
  afterEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Test 1: Sprawdza tworzenie nowej rezerwacji
   * Testuje scenariusz: użytkownik rezerwuje stolik w restauracji na konkretny dzień i godzinę
   * Oczekiwany rezultat: rezerwacja zostaje utworzona z wszystkimi danymi
   */
  it('should create a new rezerwacja', async () => {
    // Przygotowanie danych testowych - dane nowej rezerwacji
    const createDto = {
      data_rezerwacji: new Date('2025-12-20'),
      status: 'potwierdzona',
      stolik_id: 1,
      uzytkownik_id: 1,
      restauracja_id: 1,
      data_utworzenia: new Date(),
      godzina_od: '18:00',
      godzina_do: '20:00',
    };

    // Mockowa rezerwacja po zapisaniu w bazie (z wygenerowanym ID)
    const mockRezerwacja = {
      rezerwacja_id: 1,
      ...createDto,
    };

    // Konfiguracja mocków
    mockRepository.create.mockReturnValue(mockRezerwacja);
    mockRepository.save.mockResolvedValue(mockRezerwacja);

    // Wywołanie testowanej metody
    const result = await service.create(createDto);

    // Asercje - sprawdzamy czy:
    // 1. Repozytorium utworzyło nowy obiekt rezerwacji
    expect(mockRepository.create).toHaveBeenCalledWith(createDto);
    // 2. Rezerwacja została zapisana w bazie danych
    expect(mockRepository.save).toHaveBeenCalledWith(mockRezerwacja);
    // 3. Zwrócony obiekt zawiera wszystkie dane
    expect(result).toEqual(mockRezerwacja);
    expect(result.godzina_od).toBe('18:00');
    expect(result.status).toBe('potwierdzona');
  });

  /**
   * Test 2: Sprawdza pobieranie wszystkich rezerwacji z relacjami
   * Testuje scenariusz: administrator lub właściciel sprawdza listę rezerwacji wraz ze szczegółami
   * Oczekiwany rezultat: zwrócona lista rezerwacji z danymi użytkownika, stolika i restauracji
   */
  it('should return all rezerwacje with relations', async () => {
    // Przygotowanie danych testowych - lista rezerwacji z pełnymi relacjami
    const mockRezerwacje = [
      {
        rezerwacja_id: 1,
        data_rezerwacji: new Date('2025-12-20'),
        godzina_od: '18:00',
        godzina_do: '20:00',
        status: 'potwierdzona',
        klient_id: 1,
        pracownik_id: 1,
        stolik_id: 1,
        restauracja_id: 1,
        data_utworzenia: new Date(),
        uzytkownik: {
          uzytkownik_id: 1,
          login: 'jan.kowalski',
          imie: 'Jan',
          nazwisko: 'Kowalski',
        },
        stolik: {
          stolik_id: 1,
          numer_stolika: 5,
          ilosc_miejsc: 4,
        },
        restauracja: {
          restauracja_id: 1,
          nazwa: 'Test Restaurant',
          adres: 'ul. Testowa 1',
        },
      },
      {
        rezerwacja_id: 2,
        data_rezerwacji: new Date('2025-12-21'),
        godzina_od: '19:00',
        godzina_do: '21:00',
        status: 'oczekujaca',
        klient_id: 2,
        pracownik_id: 1,
        stolik_id: 2,
        restauracja_id: 1,
        data_utworzenia: new Date(),
        uzytkownik: {
          uzytkownik_id: 2,
          login: 'anna.nowak',
          imie: 'Anna',
          nazwisko: 'Nowak',
        },
        stolik: {
          stolik_id: 2,
          numer_stolika: 3,
          ilosc_miejsc: 2,
        },
        restauracja: {
          restauracja_id: 1,
          nazwa: 'Test Restaurant',
          adres: 'ul. Testowa 1',
        },
      },
    ];

    // Konfiguracja mocka
    mockRepository.find.mockResolvedValue(mockRezerwacje);

    // Wywołanie testowanej metody
    const result = await service.findAll();

    // Asercje - sprawdzamy czy:
    // 1. Repozytorium zostało wywołane z wszystkimi relacjami
    expect(mockRepository.find).toHaveBeenCalledWith({
      relations: ['uzytkownik', 'stolik', 'restauracja'],
    });
    // 2. Zwrócona lista jest zgodna z oczekiwaniami
    expect(result).toEqual(mockRezerwacje);
    // 3. Lista zawiera wszystkie rezerwacje (2 elementy)
    expect(result).toHaveLength(2);
    // 4. Relacje zostały załadowane (użytkownik, stolik, restauracja)
    expect(result[0].uzytkownik).toBeDefined();
    expect(result[0].stolik).toBeDefined();
    expect(result[0].restauracja).toBeDefined();
    expect(result[0].uzytkownik.login).toBe('jan.kowalski');
    expect(result[0].stolik.numer_stolika).toBe(5);
  });
});