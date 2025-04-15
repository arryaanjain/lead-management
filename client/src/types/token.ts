// src/types/token.ts
export interface DecodedToken {
    leadId: string;
    phone: string;
    name: string;
    city: string;
    business: string;
    role: string;
    status: string;
    iat: number;
    exp: number;
  }
  