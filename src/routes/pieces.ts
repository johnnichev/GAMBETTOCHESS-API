import { Request, Response, Router } from 'express';

import { movesMiddleware, movementFormatMiddleware } from '../middlewares/piecesMiddlewares';
import piecesController from '../controllers/piecesController';

const pieces = Router();

pieces.get('/:id/moves', movesMiddleware, async (request: Request, response: Response): Promise<Response> => {
	const playerColor = request.header('Player-Color');
	const secretKey = request.header('Secret-Key');
	const pieceId = request.params.id;
    
	try{
		const match = await piecesController.getMoves(playerColor, secretKey, pieceId);
	    return response.status(200).send(match);
	} catch(error){
		return response.status(error.code).send(error.message);
	}
});
pieces.post('/:id/moves', movesMiddleware, movementFormatMiddleware, async (request: Request, response: Response): Promise<Response> => {
	const playerColor = request.header('Player-Color');
	const secretKey = request.header('Secret-Key');
	const pieceId = request.params.id;
	const { row, col } = request.body;
    
	try{
		const match = await piecesController.postMove(playerColor, secretKey, pieceId, row, col);
	    return response.status(201).send(match);
	} catch(error){
		return response.status(error.code).send(error.message);
	}
});

export default pieces;