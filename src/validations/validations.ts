import joi from 'joi';

export const validateMatchOrMoves = (
	playerColor: string,
	secretKey: string,
	id: string,
) : boolean => {

	const match = joi.object({
		playerColor: joi.string().required(),
		secretKey: joi.string().uuid().required(),
		id: joi.string().uuid().required(),
	});

	const data = {
		playerColor,
		secretKey,
		id,
	};

	const validation = match.validate(data);
	
	return !!validation.error;
};

export const validateMovementFormat = (
	row: number,
	col: number,
) : boolean => {

	const movement = joi.object({
		row: joi.number().integer().min(0).max(7),
		col: joi.number().integer().min(0).max(7),
	});

	const data = {
		row,
		col,
	};

	const validation = movement.validate(data);
	
	return !!validation.error;
};