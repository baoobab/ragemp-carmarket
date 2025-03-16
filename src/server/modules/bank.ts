// Singleton Bank class to perform money operations
export default class Bank {
  private static _instance: Bank;
  private constructor() {} // Блокировка прямого создания

  public static getInstance(): Bank {
    if (!Bank._instance) {
      Bank._instance = new Bank();
    }
    return Bank._instance;
  }

  private static _isPlayerExists(player: PlayerMp): boolean {
  return player && mp.players.exists(player);
  }

  static balance(player: PlayerMp): number {
    if (!this._isPlayerExists(player)) return 0;

    return player.money || 0;
  }

  static withdraw(player: PlayerMp, amount: number): boolean {
    if (this.balance(player) >= amount) {
      player.money -= amount; // Can stores into the cash var/etc
      return true;
    }
    return false;
  }

  static deposit(player: PlayerMp, amount: number): boolean {
    if (!this._isPlayerExists(player)) return false;

    player.money += amount; // Can takes from the cash var/etc
    return true
  }

  // P2P transfer
  static transfer(sender: PlayerMp, receiver: PlayerMp, amount: number): boolean {
    // Check that withdrawal (sender's money freezing) passes correctly
    if (!this.withdraw(sender, amount)) return false;

    // Check that reciever's deposit passes correctly
    if (!this.deposit(receiver, amount)) {
      // If not - need to moneyback freezed sender's money
      this.deposit(sender, amount)
      return false;
    }

    return true;
  }

  // in DB: transactions logging, storing history
}
