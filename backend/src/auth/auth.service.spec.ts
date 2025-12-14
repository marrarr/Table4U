// backend/src/auth/auth.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UzytkownikService } from '../uzytkownik/uzytkownik.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

// Mockowanie biblioteki bcryptjs do testowania hashowania haseł
jest.mock('bcryptjs');

/**
 * Testy jednostkowe dla AuthService
 * Testują funkcjonalności związane z autentykacją użytkowników
 */
describe('AuthService', () => {
  let service: AuthService;
  let uzytkownikService: UzytkownikService;
  let jwtService: JwtService;

  // Mock (atrapa) serwisu użytkowników - symuluje zachowanie bez rzeczywistej bazy danych
  const mockUzytkownikService = {
    findOneByUsername: jest.fn(),
    create: jest.fn(),
  };

  // Mock (atrapa) serwisu JWT - symuluje generowanie tokenów
  const mockJwtService = {
    sign: jest.fn(),
  };

  // Przed każdym testem tworzymy świeżą instancję modułu testowego
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UzytkownikService,
          useValue: mockUzytkownikService, // Używamy mocka zamiast prawdziwego serwisu
        },
        {
          provide: JwtService,
          useValue: mockJwtService, // Używamy mocka zamiast prawdziwego JWT
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    uzytkownikService = module.get<UzytkownikService>(UzytkownikService);
    jwtService = module.get<JwtService>(JwtService);
  });

  // Po każdym teście czyścimy wszystkie mocki
  afterEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Test 1: Sprawdza czy serwis jest poprawnie zdefiniowany
   * Weryfikuje czy instancja AuthService została utworzona
   */
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  /**
   * Test 2: Sprawdza poprawność logowania użytkownika
   * Testuje scenariusz: użytkownik podaje poprawne dane logowania
   * Oczekiwany rezultat: zwrócony zostaje token dostępu (access_token)
   */
  it('should login user and return access token', async () => {
    // Przygotowanie danych testowych - mockowy użytkownik
    const mockUser = {
      uzytkownik_id: 1,
      login: 'testuser',
      haslo: 'hashedPassword',
      rola: { nazwa: 'user' },
    };

    const mockToken = 'jwt.token.here';
    
    // Konfiguracja mocków - definiujemy co mają zwracać
    mockUzytkownikService.findOneByUsername.mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true); // Symulujemy poprawne hasło
    mockJwtService.sign.mockReturnValue(mockToken);

    // Wywołanie testowanej metody
    const result = await service.login('testuser', 'password123');

    // Asercje - sprawdzamy czy wszystko działa zgodnie z oczekiwaniami
    expect(mockUzytkownikService.findOneByUsername).toHaveBeenCalledWith('testuser');
    expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedPassword');
    expect(mockJwtService.sign).toHaveBeenCalledWith({
      username: 'testuser',
      sub: 1,
      role: 'user',
    });
    expect(result).toEqual({ access_token: mockToken });
  });
});