export interface Session {
  accessToken: string | null;
  tokenType: string | null;
  refreshToken: string | null;
  expiresIn: number | null;
  expires: string | null;
  issued: string | null;
}

export interface Profile {
  name: string | null;
  username: string | null;
  email: string | null;
  tel: string | null;
  image: string | null;
  type: string | null;
  verification: {
    email: boolean;
    tel: boolean;
    nationalId: boolean;
  };
  settings: {
    hasPin?: boolean;
  };
}