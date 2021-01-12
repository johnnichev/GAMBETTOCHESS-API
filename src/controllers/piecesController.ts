
import { Request, Response } from 'express';


export const getMoves = async (request: Request, response: Response) : Promise<Response> => {
	return response.status(200).send('ok!');
};

export const postMove = async (request: Request, response: Response) : Promise<Response> => {
	return response.status(200).send('ok!');
};