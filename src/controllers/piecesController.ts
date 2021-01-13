import { Request, Response } from 'express';
import { getConnection } from 'typeorm';
import { Piece } from '../entities/Piece';

const piecesRepository = getConnection().getRepository(Piece); 

export const getMoves = async (request: Request, response: Response) : Promise<Response> => {
	const playerColor = request.header('Player-Color');
	const secretKey = request.header('Secret-Key');
	const pieceId = request.params.id;


	const findPiece = await piecesRepository.findOne({where: {id: pieceId}, relations: ['match']});
	if(!findPiece) return response.status(404).send({error: 'piece not found'});

	if(secretKey !== findPiece.match.secret_key) return response.status(422).send({error: 'invalid credentials'});

	const playerTurn = findPiece.match.status == 'whitePlay'? 'white' : 'black';
	if(playerColor !== playerTurn) return response.status(403).send({error: 'not your turn'});

	if(playerColor !== findPiece.color) return response.status(403).send({error: 'not your piece'});

	const moves = checkMoves();
	console.log(moves);
	
	return response.status(200).send(findPiece);
};

export const postMove = async (request: Request, response: Response) : Promise<Response> => {
	return response.status(200).send('ok!');
};

const checkMoves = (): string => {
	return 'zap';
};