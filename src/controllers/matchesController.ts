import { Request, Response } from 'express';
import { getConnection } from 'typeorm';
import { Match } from '../entities/Match';
import { Piece } from '../entities/Piece';


const matchesRepository = getConnection().getRepository(Match); 

export const getMatch = async (request: Request, response: Response) : Promise<Response> => {
	const secretKey = request.header('Secret-Key');
	const matchId = request.params.id;


	const findMatch = await matchesRepository.findOne({where: {id: matchId}, relations: ['pieces']});

	if(!findMatch) return response.status(404).send({error: 'match not found'});

	if(secretKey !== findMatch.secret_key) return response.status(422).send({error: 'invalid credentials'});


	return response.status(200).send(findMatch);
};

export const postMatch = async (request: Request, response: Response) : Promise<Response> => {
	
	const match = new Match;
	const pieces: Piece[] = await createBasePiecesArray();
	match.pieces = pieces;
	await match.save();

	const findMatch = await matchesRepository.findOne({where: {id: match.id}, relations: ['pieces']});

	return response.status(200).send(findMatch);
};

const createBasePiecesArray = async(): Promise<Piece[]> => {
	let pieces = [];
	
	const pawns = await createPawns();
	
	const queensRows = await createQueensRows();
	
	pieces = pieces.concat(pawns, queensRows);
	
	return pieces;
};

const createPiece = async (type: string, color: string, col: number, row: number) : Promise<Piece> => {

	const piece = new Piece;
	piece.type = type;
	piece.color = color;
	piece.row = row;
	piece.col = col;
	const savePiece = await piece.save();
	
	return savePiece;
};

const createPawns = async () : Promise<Piece[]> => {
	const pieces = [];

	for(let i = 0; i < 16; i++){
		if(i < 8){
			pieces.push(await createPiece('pawn', 'white', i, 1));
		} else{
			pieces.push(await createPiece('pawn', 'black', i-8, 6));
		}
	}
	
	return pieces;
};

const createQueensRows = async () : Promise<Piece[]> => {
	const pieces = [];

	const piecesTypes = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];

	await Promise.all(piecesTypes.map(async (element, index) => {
		pieces.push(await createPiece(element, 'white', index, 0));
	}));

	await Promise.all(piecesTypes.map(async (element, index) => {
		pieces.push(await createPiece(element, 'black', index, 7));
	}));
	
	return pieces;
};
