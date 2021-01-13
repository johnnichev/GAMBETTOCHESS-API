import joi from 'joi';

export const validateGetMatch = (
	playerColor: string,
	secretKey: string,
	matchId: string,
) : boolean => {

	const match = joi.object({
		playerColor: joi.string().required(),
		secretKey: joi.string().uuid().required(),
		matchId: joi.string().uuid().required(),
	});

	const data = {
		playerColor,
		secretKey,
		matchId,
	};

	const validation = match.validate(data);
	
	return !!validation.error;
};