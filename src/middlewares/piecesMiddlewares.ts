import { Request, Response, NextFunction } from 'express';
import { validateMatchOrMoves, validateMovementFormat } from '../validations/validations';


export const movesMiddleware = async (request: Request, response: Response, next: NextFunction): Promise<Response | void> => {
	const playerColor = request.header('Player-Color');
	const secretKey = request.header('Secret-Key');
	const id = request.params.id;

	if(!playerColor || !secretKey) return response.status(422).send({error: 'Send a player color and a secret key'});
	if(!id) return response.status(422).send({error: 'Send a valid id'});

	const failValidation = validateMatchOrMoves(playerColor, secretKey, id);
	
	if(failValidation) return response.status(400).send({error: 'Please, check the data you are sending'});

	next();
};

export const movementFormatMiddleware = async (request: Request, response: Response, next: NextFunction): Promise<Response | void> => {
	const { row, col } = request.body;

	const failValidation = validateMovementFormat(row, col);
	
	if(failValidation) return response.status(422).send({error: 'Please, rows and cols accordingly'});

	next();
};