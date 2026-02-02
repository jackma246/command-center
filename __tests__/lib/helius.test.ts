import {
  isValidSolanaAddress,
  formatSol,
  formatUsd,
} from '@/lib/helius';

describe('helius utilities', () => {
  describe('isValidSolanaAddress', () => {
    it('should return true for valid Solana address', () => {
      const validAddress = '5myqu8hG5KCsX1QZxtasKQgJ4548ZEHNoef65UGe7wPc';
      expect(isValidSolanaAddress(validAddress)).toBe(true);
    });

    it('should return true for another valid address', () => {
      const validAddress = 'EH9LykQhXUkYMyhjUnLiXY1DvKDwFe7Bnz1ZerJHa4p4';
      expect(isValidSolanaAddress(validAddress)).toBe(true);
    });

    it('should return false for address that is too short', () => {
      const shortAddress = '5myqu8hG5KC';
      expect(isValidSolanaAddress(shortAddress)).toBe(false);
    });

    it('should return false for address with invalid characters', () => {
      const invalidAddress = '5myqu8hG5KCsX1QZxtasKQgJ4548ZEHNoef65UGe7wP0'; // 0 is not in base58
      expect(isValidSolanaAddress(invalidAddress)).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(isValidSolanaAddress('')).toBe(false);
    });

    it('should return false for address with lowercase L', () => {
      const invalidAddress = '5myqu8hG5KCsX1QZxtasKQgJ4548ZEHNoef65UGe7wPl'; // l not in base58
      expect(isValidSolanaAddress(invalidAddress)).toBe(false);
    });
  });

  describe('formatSol', () => {
    it('should convert lamports to SOL with 4 decimals', () => {
      expect(formatSol(1000000000)).toBe('1.0000');
    });

    it('should handle fractional SOL', () => {
      expect(formatSol(1500000000)).toBe('1.5000');
    });

    it('should handle small amounts', () => {
      expect(formatSol(1000000)).toBe('0.0010');
    });

    it('should handle zero', () => {
      expect(formatSol(0)).toBe('0.0000');
    });

    it('should handle large amounts', () => {
      expect(formatSol(100000000000)).toBe('100.0000');
    });
  });

  describe('formatUsd', () => {
    it('should format as USD currency', () => {
      expect(formatUsd(100)).toBe('$100.00');
    });

    it('should handle decimals', () => {
      expect(formatUsd(99.99)).toBe('$99.99');
    });

    it('should handle thousands with comma', () => {
      expect(formatUsd(1000)).toBe('$1,000.00');
    });

    it('should handle negative amounts', () => {
      expect(formatUsd(-50.25)).toBe('-$50.25');
    });

    it('should handle zero', () => {
      expect(formatUsd(0)).toBe('$0.00');
    });
  });
});
