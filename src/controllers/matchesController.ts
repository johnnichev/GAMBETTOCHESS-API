import { getConnection } from 'typeorm';
import { Request, Response } from 'express';
import { Match } from '../entities/Match';

const matchesRepository = getConnection().getRepository(Match);


export const getMatch = async (request: Request, response: Response) : Promise<Response> => {
	return response.status(200).send('ok!');
};

export const postMatch = async (request: Request, response: Response) : Promise<Response> => {
	return response.status(200).send('ok!');
};