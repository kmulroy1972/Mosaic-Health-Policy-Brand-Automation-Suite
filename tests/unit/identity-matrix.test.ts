import { createIdentityScenario } from '../fixtures/identityMock';

describe('Identity matrix', () => {
  it('supports NAA happy path', async () => {
    const identity = createIdentityScenario({ naaAvailable: true, oboTokenIssued: true });
    const token = await identity.requestToken('User.Read offline_access');
    expect(token.scopes).toContain('User.Read');
  });

  it('falls back when NAA unavailable', async () => {
    const identity = createIdentityScenario({ naaAvailable: false, oboTokenIssued: true });
    await expect(identity.requestToken('User.Read offline_access')).rejects.toThrow(
      'NAA unavailable'
    );
  });

  it('blocks write scope when OBO fails', async () => {
    const identity = createIdentityScenario({ naaAvailable: true, oboTokenIssued: false });
    await expect(identity.requestToken('Files.ReadWrite')).rejects.toThrow('OBO token not issued');
  });
});
