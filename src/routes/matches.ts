import { Request, Response, Router } from 'express';
import { getMatchMiddleware } from '../middlewares/matchesMiddlewares';
import matchesController from '../controllers/matchesController';

const matches = Router();

matches.post('/', async (request: Request, response: Response): Promise<Response> => {
	try{
		const match = await matchesController.postMatch();
	    return response.status(200).send(match);
	} catch(error){
		return response.status(error.code).send(error.message);
	}
});

matches.get('/:id', getMatchMiddleware, async (request: Request, response: Response): Promise<Response> => {
	const secretKey = request.header('Secret-Key');
	const matchId = request.params.id;
	try{
		const match = await matchesController.getMatch(secretKey, matchId);
	    return response.status(200).send(match);
	} catch(error){
		return response.status(error.code).send(error.message);
	}
});

export default matches; 