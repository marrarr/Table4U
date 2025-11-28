  export interface CreateRestauracjaDto {
    nazwa: string;
    adres: string;
    nr_kontaktowy: string;
    email: string;
    zdjecie?: string | ArrayBuffer | null;
  }
  
  export interface Restauracja{
    nazwa?: string;
    adres?: string;
    nr_kontaktowy?: string;
    email?: string;
    zdjecie?: string | ArrayBuffer | null;
  }
  