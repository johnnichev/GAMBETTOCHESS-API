import joi from 'joi';

export const validateRecommendation = (
	name: string,
	genresIds: string[],
	youtubeLink: string,
) : boolean => {

	const recommendation = joi.object({
		name: joi.string().min(2).max(30).required(),
		genresIds: joi.array().min(1).required(),
		youtubeLink: joi.string().uri().required(),
	});

	const data = {
		name,
		genresIds,
		youtubeLink,
	};

	const validation = recommendation.validate(data);
	
	return !!validation.error;
};

export const validateUpvoteDownvote = (
	id: string,
) : boolean => {

	const recommendation = joi.object({
		id: joi.string().required(),
	});

	const data = {
		id,
	};

	const validation = recommendation.validate(data);
	
	return !!validation.error;
};