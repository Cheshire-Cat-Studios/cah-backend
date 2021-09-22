module.exports = class USer {
    id: string;
    name: string;
    deck?: Deck;
    // No type assignment here cause typescript and the md5 package im using is a cunt
    secret = Md5.hashStr(Math.random().toString());
    game_data: GameData = new GameData();

constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
}

public assignDeck(): void {
    this.deck = new Deck(true);
}

public getHand(): Card[] | [] {
    return this.deck
        ? this.deck.getByStatus('inDeck','inPlay')
        : [];
}

public assignGame(game: Game): void {
    if (this.game_data.current_game) {
    return;
}

this.game_data.current_game = game.id;
this.game_data.score = 0;
this.assignDeck()
}

public unassignGame(): void {
    this.game_data.current_game = null;
    this.game_data.score = null;
    this.deck = null;
}

static generateNewId(name: string): any {
    return Md5.hashStr(name);
}