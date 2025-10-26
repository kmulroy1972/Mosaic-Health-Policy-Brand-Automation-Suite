export interface IdentityContext {
  naaAvailable: boolean;
  oboTokenIssued: boolean;
}

export interface TokenResponse {
  accessToken: string;
  expiresIn: number;
  scopes: string[];
}

export function createIdentityScenario(context: IdentityContext): {
  requestToken: (scope: string) => Promise<TokenResponse>;
} {
  return {
    async requestToken(scope: string): Promise<TokenResponse> {
      if (scope.includes('offline_access') && !context.naaAvailable) {
        throw new Error('NAA unavailable');
      }
      if (!context.oboTokenIssued && scope.includes('Files.ReadWrite')) {
        throw new Error('OBO token not issued');
      }
      return {
        accessToken: `mock-${scope.replace(/[.:]/g, '-')}`,
        expiresIn: 3600,
        scopes: scope.split(' ')
      };
    }
  };
}
