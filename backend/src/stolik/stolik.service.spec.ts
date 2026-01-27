// backend/src/stolik/stolik.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { StolikiService } from './stolik.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Stolik } from './stolik.entity';
import { Repository } from 'typeorm';

/**
 * Testy jednostkowe dla StolikiService
 * Testują funkcjonalności zarządzania stolikami w restauracjach
 */
describe('StolikiService', () => {
  let service: StolikiService;
  let repository: Repository<Stolik>;

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
        StolikiService,
        {
          provide: getRepositoryToken(Stolik), // Token do wstrzykiwania repozytorium
          useValue: mockRepository, // Używamy mocka zamiast prawdziwego repozytorium
        },
      ],
    }).compile();

    service = module.get<StolikiService>(StolikiService);
    repository = module.get<Repository<Stolik>>(getRepositoryToken(Stolik));
  });

  // Po każdym teście czyścimy wszystkie mocki
  afterEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Test 1: Sprawdza tworzenie nowego stolika
   * Testuje scenariusz: właściciel restauracji dodaje nowy stolik do lokalu
   * Oczekiwany rezultat: stolik zostaje utworzony z podanymi parametrami
   */
  it('should create a new stolik', async () => {
    // Przygotowanie danych testowych - dane nowego stolika
    const createDto = {
      numer_stolika: 5,
      ilosc_miejsc: 4,
      lokalizacja: 'Przy oknie',
      restauracja_id: 1,
      pozycjaX_UI: 13,
      pozycjaY_UI: 31,
    };

    // Mockowy stolik po zapisaniu w bazie (z wygenerowanym ID)
    const mockStolik = {
      stolik_id: 1,
      ...createDto,
    };

    // Konfiguracja mocków
    mockRepository.create.mockReturnValue(mockStolik);
    mockRepository.save.mockResolvedValue(mockStolik);

    // Wywołanie testowanej metody
    const result = await service.create(createDto);

    // Asercje - sprawdzamy czy:
    // 1. Repozytorium utworzyło nowy obiekt stolika
    expect(mockRepository.create).toHaveBeenCalledWith(createDto);
    // 2. Stolik został zapisany w bazie danych
    expect(mockRepository.save).toHaveBeenCalledWith(mockStolik);
    // 3. Zwrócony obiekt zawiera wszystkie dane
    expect(result).toEqual(mockStolik);
    expect(result.numer_stolika).toBe(5);
    expect(result.ilosc_miejsc).toBe(4);
  });

  /**
   * Test 2: Sprawdza pobieranie wszystkich stolików
   * Testuje scenariusz: wyświetlanie listy wszystkich stolików w systemie
   * Oczekiwany rezultat: zwrócona lista wszystkich stolików ze wszystkich restauracji
   */
  it('should return all stoliki', async () => {
    // Przygotowanie danych testowych - lista stolików z różnych restauracji
    const mockStoliki = [
      { 
        stolik_id: 1, 
        numer_stolika: 1, 
        ilosc_miejsc: 4, 
        restauracja_id: 1 
      },
      { 
        stolik_id: 2, 
        numer_stolika: 2, 
        ilosc_miejsc: 2, 
        restauracja_id: 1 
      },
      { 
        stolik_id: 3, 
        numer_stolika: 3, 
        ilosc_miejsc: 6, 
        restauracja_id: 2 
      },
    ];

    // Konfiguracja mocka
    mockRepository.find.mockResolvedValue(mockStoliki);

    // Wywołanie testowanej metody
    const result = await service.findAll();

    // Asercje - sprawdzamy czy:
    // 1. Repozytorium zostało wywołane
    expect(mockRepository.find).toHaveBeenCalled();
    // 2. Zwrócona lista jest zgodna z oczekiwaniami
    expect(result).toEqual(mockStoliki);
    // 3. Lista zawiera wszystkie stoliki (3 elementy)
    expect(result).toHaveLength(3);
    // 4. Stoliki mają różną liczbę miejsc
    expect(result[0].ilosc_miejsc).toBe(4);
    expect(result[1].ilosc_miejsc).toBe(2);
    expect(result[2].ilosc_miejsc).toBe(6);
  });
});