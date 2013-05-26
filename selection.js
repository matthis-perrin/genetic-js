

// Set for each individual the cumulative propability to be selected.
// The cumulative probability is the cumulative fitness divided by the sum of
// all the fitnesses.
function prepareForRouletteWheel(population)
{
	var fitnessSum = 0;
	for (var i = 0; i < population.length; i++)
		fitnessSum += population[i].fitness;

	population[0].probability = population[0].fitness / fitnessSum;
	for (var i = 1; i < population.length; i++)
		population[i].probability = population[i - 1].probability + population[i].fitness / fitnessSum;
}


// // Select two differents individual using a dichotomic roulette
// // wheel. The function `prepareForRouletteWheel` must be called before.
// function selectTwoDifferentIndividual(population)
// {
// 	var firstRand = randomDouble(0, 1);
// 	var firstPick = dichotomicRouletteWheel(population, firstRand);
	
// 	var botLimit = firstPick == 0 ? 0 : population[firstPick - 1].probability
// 	var topLimit = population[firstPick].probability;
// 	var secondRand = randomDoubleWithout(0, 1, botLimit, topLimit);
// 	var secondPick = dichotomicRouletteWheel(population, secondRand);

// 	return [population[firstPick], population[secondPick]];
// }


// Go through the population dichotomically and find the individual
// corresponding to the random value (meaning the it have a probability
// greater than `randomValue` and that the next individual have a
// probability lower than `randomValue`)
function dichotomicRouletteWheel(population, randomValue)
{
	var bot = 0;
	var top = population.length;

	while (true)
	{
		var index = Math.floor((bot + top) / 2);
		if (index == 0) return population[index];
		if (population[index].probability > randomValue)
		{
			if (population[index - 1].probability < randomValue)
				return population[index];
			top = index - 1;
		}
		else
			bot = index + 1;
	}
}


// Select and individual based on its rank. The first individual has a
// probaility p to be selected. The second one a probability p(1-p) to 
// be selected. More generally the n-th individual has a probability
// p(1 - p)^n to be selected. The population need to be sorted before
// calling this function
var p = 0.1;
function tournamentSelection(population)
{
	for (var i = 0; i < population.length; i++)
		if (randomDouble(0, 1) < p)
			return population[i];
	return population[population.length - 1];
}