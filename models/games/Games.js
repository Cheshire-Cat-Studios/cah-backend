// import {User} from "../user/User";
// import {Deck} from "../deck/Deck";
// import {Md5} from "ts-md5";
// import {GameConfig} from "../../interfaces/GameConfig";
// import {WhiteCard} from "@/classes/deck/cards/WhiteCard";
//
// export class Game {
//     id: string;
//     host_id: string;
//     name: string;
//     is_started: boolean = false;
//     is_czar_phase: boolean = false;
//     members: Array<User> = [];
//     cards_in_play: { [key: string]: Array<any> } = {};
//     deck: Deck;
//     config: GameConfig;
//     io: any;
//
//     constructor(id: string, io: any, name: string, host: User, config: GameConfig) {
//         // console.log(io);
//         this.id = id;
//         this.io = io;
//         // this.io = io.of('/'+this.id);
//         this.name = name;
//         this.host_id = host.id;
//         this.config = config;
//         this.members.push(host);
//         this.deck = new Deck(false);
//
//         this.socketsListeners();
//     }
//
//     private async gameTimer() {
//         setTimeout(async function () {
//             this.endGame();
//         }, this.config.game_time_limit);
//     }
//
//     public startRound() {
//
//     }
//
//     private endRound(winner?: User): void {
//
// }
//
// private toggleCzar(): void {
//     let czar_found = false;
//     let czar_set = false;
//
//     this.members.forEach(function (member) {
//         member.game_data.is_czar === true && (czar_found = true);
//         czar_found && (member.game_data.is_czar = true) && (czar_set = true);
//     });
//
//     czar_set || (this.members[0].game_data.is_czar = true)
// }
//
//
// public addUser(user: User): boolean {
//     if (this.members.length >= this.config.max_players) {
//         return false;
//     }
//
//     let match = false;
//     this.members.forEach(function (value) {
//         value === user && (match = true)
//     });
//
//     !match
//     && (
//         this.members.push(user)
//         && user.assignGame(this)
//     )
//
//     return true;
// }
//
// private addCardsInPlay(user: User, cards: Array<any>): void {
// !this.cards_in_play[user.id]
// && (this.cards_in_play[user.id] = cards)
// };
//
// private calculateMovesLeft(): boolean {
//     return Object.keys(this.cards_in_play).length  === this.members.length;
// }
//
// private async socketsListeners() {
//     let self = this;
//
//     this.io.on('connection', function (socket: any) {
//         socket.on('verify', function (data: any) {
//             let client_user = self.members
//                 .find(function (member: User) {
//                     return member.id === data.user.id
//                         && member.secret === data.user.secret
//                 });
//
//             if (!(client_user instanceof User)) {
//                 socket.disconnect();
//
//                 return;
//             }
//
//             socket.broadcast.emit('user-join', {name: client_user.name});
//
//             socket.on('disconnect', function () {
//                 socket.broadcast.emit('user-left', {name: client_user.name}); //sending to all clients except sender
//             });
//
//             socket.on('player-kicked', function (data: any) {
//                 if (client_user.id !== self.host_id) {
//                     return;
//                 }
//
//                 const index = self.members.findIndex(function (member: User) {
//                     return member.id === data.user.id;
//                 });
//
//                 let deleted_user = self.members[index]
//
//                 socket.broadcast.emit('player-kicked', {name: deleted_user.name})
//
//                 deleted_user.game_data.is_czar
//                 && self.toggleCzar()
//
//                 deleted_user.unassignGame()
//
//                 delete self.members[index].name
//             });
//
//             socket.on('cards-chosen', function (data: any) {
//                 if (self.cards_in_play[client_user.id]) {
//                     return;
//                 }
//
//                 self.addCardsInPlay(client_user, data)
//
//                 self.calculateMovesLeft()
//                 && socket.broadcast.emit('cards-chosen', {user_ready_count: self.cards_in_play.length}); //sending to all clients except sender
//                 // socket.broadcast.emit()
//
//             });
//
//             socket.on('game-start', function () {
//             });
//         });
//     });
// }
//
// static generateNewId(name: string): any {
//     return Md5.hashStr(name);
// }
// }
//
