import { HttpError } from '../utils/errors';
import { getConnection } from 'typeorm';
import { Match } from '../entities/Match';
import { Piece } from '../entities/Piece';

export default new class MatchesController {
	matchesRepository = getConnection().getRepository(Match); 

	postMatch = async () : Promise<Match> => {
		
		const match = new Match;
		const pieces: Piece[] = await this._createBasePiecesArray();
		match.pieces = pieces;
		await match.save();

		const findMatch = await this.matchesRepository.findOne({where: {id: match.id}, relations: ['pieces']});
		
		if(!findMatch) throw new HttpError(500, 'please, send this to a developer');
		
		return findMatch;
	};

	getMatch = async (secretKey: string, matchId: string) : Promise<Match> => {

		const findMatch = await this.matchesRepository.findOne({where: {id: matchId}, relations: ['pieces']});

		if(!findMatch) throw new HttpError(404, 'match id not found');

		if(secretKey !== findMatch.secret_key) throw new HttpError(422, 'invalid credentials');

		return findMatch;
	};

	_createBasePiecesArray = async(): Promise<Piece[]> => {
		let pieces = [];
		
		const pawns = await this._createPawns();
		
		const queensRows = await this._createQueensRows();
		
		pieces = pieces.concat(pawns, queensRows);
		
		return pieces;
	};

	_createPiece = async (type: string, color: string, col: number, row: number) : Promise<Piece> => {

		const piece = new Piece;
		piece.type = type;
		piece.color = color;
		piece.row = row;
		piece.col = col;
		const savePiece = await piece.save();
		
		return savePiece;
	};

	_createPawns = async () : Promise<Piece[]> => {
		const pieces = [];

		for(let i = 0; i < 16; i++){
			if(i < 8){
				pieces.push(await this._createPiece('pawn', 'white', i, 1));
			} else{
				pieces.push(await this._createPiece('pawn', 'black', i-8, 6));
			}
		}
		
		return pieces;
	};

	_createQueensRows = async () : Promise<Piece[]> => {
		const pieces = [];

		const piecesTypes = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];

		await Promise.all(piecesTypes.map(async (element, index) => {
			pieces.push(await this._createPiece(element, 'white', index, 0));
		}));

		await Promise.all(piecesTypes.map(async (element, index) => {
			pieces.push(await this._createPiece(element, 'black', index, 7));
		}));
		
		return pieces;
	};

};