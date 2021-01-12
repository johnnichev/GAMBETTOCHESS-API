import joi from 'joi';


export const validateGenre = (
	name: string,
) : boolean => {

	const genre = joi.object({
		name: joi.string().min(2).max(30).required(),
	});

	const data = {
		name,
	};

	const validation = genre.validate(data);
	
	return !!validation.error;
};