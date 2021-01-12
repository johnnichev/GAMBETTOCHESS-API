import { Request, Response, NextFunction } from 'express';
// import { validateRecommendation, validateUpvoteDownvote } from '../validations/recommendations';


export const getMovesMiddleware = async (request: Request, response: Response, next: NextFunction): Promise<Response | void> => {
	// const id = request.params.id;
	
	// if(!id) return response.status(400).send({error: 'Send a valid id'});

	// const failValidation = validate(id);
	
	// if(failValidation) return response.status(400).send({error: 'Please, send a valid id'});

	next();
};

export const postMoveMiddleware = async (request: Request, response: Response, next: NextFunction): Promise<Response | void> => {
	// const id = request.params.id;
	
	// if(!id) return response.status(400).send({error: 'Send a valid id'});

	// const failValidation = validate(id);
	
	// if(failValidation) return response.status(400).send({error: 'Please, send a valid id'});

	next();
};