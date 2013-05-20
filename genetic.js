var genetic = (function() {

	var EPSILON = 0.0000001;


	// *********************************
	// ***** DEFAULT CONFIGURATION *****
	// *********************************

	var options = {
		populationSize: 1024,

		genomeSize: 10,
		genomeMinValue: 0, // Inclusive
		genomeMaxValue: 10, // Inclusive
		genomeValueType: 'Integer', // Can be 'Integer', 'Double', 'Character'
		genomeGenerator: defaultGenomeGenerator,

		mutationOperator: defaultMutationOperator,
		fitnessCalculator: defaultFitnessCalculator,
		keepBestReproduction: false // If true, we only keep a child when it's better than its parent.
	};

	function defaultGenomeGenerator()
	{
		var randomGenome = [];
		for (var i = 0; i < options.genomeSize; i++)
		{
			if (options.genomeValueType === 'Integer')
				randomGenome[i] = randomInteger(options.genomeMinValue, options.genomeMaxValue + 1);
			else if (options.genomeValueType === 'Double')
				randomGenome[i] = randomDouble(options.genomeMaxValue, options.genomeMinValue + 1);
			else if (options.genomeValueType === 'Character')
				randomGenome[i] = String.fromCharCode(randomInteger(97, 123));
			else
				randomGenome[i] = 0;
		}
		return randomGenome;
	}

	function defaultFitnessCalculator(genome)
	{
		var squareSum = 0;
		for (var i = 0; i < genome.length; i++)
			squareSum += genome[i] * genome[i];
		return 1 / (squareSum + EPSILON) // To avoid the zero division
	}

	// *********************************
	// *********************************
	// *********************************




	// Update defaultValues array with the values in the newValues array.
	function extend(defaultValues, newValues)
	{
		if (typeof newValues === 'undefined') return;
		for (prop in defaultValues)
			if (prop in newValues)
		  	defaultValues[prop] = newValues[prop];
	}


	// Choose a random integer between `min` (inclusive) and `max` (exclusive)
	function randomInteger(min, max)
	{
		return Math.floor(randomDouble(min, max));
	}


	// Choose a random double between `min` (inclusive) and `max` (exclusive)
	function randomDouble(min, max)
	{
		return Math.random() * (max - min) + min;
	}


	// Choose a random integer between `min` (inclusive) and `max` (exclusive)
	// and preventing `without` to be selected. if without is greater or equal
	// to (max - 1), then (max - 1) will be prevented to be selected.
	function randomInteger(min, max, without)
	{
		var random = Math.floor(Math.random() * (max - min - 1)) + min;
		if (random >= without)
			return random + 1;
		return random;
	}


	// Choose a random double between `min` (inclusice) and `max` (exclusive)
	// and preventing number between `withoutMin` and `withoutMax to be selected.
	function randomDouble(min, max, withoutMin, withoutMax)
	{
		var random = Math.random() * (max - min - withoutMax + withoutMin) + min;
		if (random >= withoutMin)
			return random + withoutMax - withoutMin;
		return random;
	}


	// Return an array of `populationSize` random individual
	// And individual is modelize this way : 
	// {
	//   genome: GENOME,
	//   fitness: FITNESS
	// }
	function generateRandomPopulation()
	{
		var population = [];
		for (var i = 0; i < options.populationSize; i++)
		{
			var randomGenome = options.genomeGenerator();
			population[i] = {
				genome: randomGenome,
				fitness: options.fitnessCalculator(randomGenome)
			}
		}
		return population;
	}


	// Go through the population a find the individual with the
	// best fitness.
	function getBestInPopulation(population)
	{
		var best = population[0];
		for (var i = 1; i < population.length; i++)
			if (population[i].fitness > best.fitness)
				best = population[i];
		return best;
	}


	// Set for each individual the propability to be selected
	// The probability is the cumulative fitness divided by the sum of
	// all the fitnesses.
	function prepareForSelection(population)
	{
		var fitnessSum = 0;
		for (var i = 0; i < population.length; i++)
			fitnessSum += population[i].fitness;

		population[0].probability = population[0].fitness / fitnessSum;
		for (var i = 1; i < population.length; i++)
			population[i].probability = population[i - 1].probability + population[i].fitness / fitnessSum;
	}


	// Select two differents individual using a dichotomic roulette
	// wheel. The function `prepareForSelection` must be called before.
	function selectTwoDifferentIndividual(population)
	{
		var firstRand = randomDouble(0, 1, 0, 0);
		var firstPick = dichotomicRouletteWheel(population, firstRand);
		
		var botLimit = firstPick == 0 ? 0 : population[firstPick - 1].probability
		var topLimit = population[firstPick].probability;
		var secondRand = randomDouble(0, 1, botLimit, topLimit);
		var secondPick = dichotomicRouletteWheel(population, secondRand);

		return [population[firstPick], population[secondPick]];
	}


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
			if (index == 0) return 0;
			if (population[index].probability > randomValue)
			{
				if (population[index - 1].probability < randomValue)
					return index;
				top = index - 1;
			}
			else
				bot = index + 1;
		}
	}


	// Perform a simple point crossover on two indivudals genomes and return the
	// resulting children.
	function simplePointCrossOver(fatherGenome, motherGenome)
	{
		var pivot = randomInteger(1, father.length);
		var sonGenome = [];
		var daughterGenome = [];

		for (var i = 0; i < pivot; i++)
		{
			sonGenome[i] = fatherGenome[i];
			daughterGenome[i] = motherGenome[i];
		}

		for (i = pivot; i < fatherGenome.length; i++)
		{
			sonGenome[i] = motherGenome[i];
			daughterGenome[i] = fatherGenome[i];
		}

		return [sonGenome, daughterGenome];
	}


	// Perform a mutation on a genome
	function defaultMutationOperator(genome)
	{
		var mutationPosition = randomInteger(0, genome.length);

		var newValue = 0;
		if (options.genomeValueType === 'Integer')
			newValue = randomInteger(options.genomeMinValue, options.genomeMaxValue + 1);
		else if (options.genomeValueType === 'Double')
			newValue = randomDouble(options.genomeMaxValue, options.genomeMinValue + 1);
		else if (options.genomeValueType === 'Character')
			newValue = String.fromCharCode(randomInteger(97, 123));

		genome[mutationPosition] = newValue;
	}



	return {
		initialize: function(newOptions) {
			extend(options, newOptions);
		},
		start: function() {
			var population = generateRandomPopulation();
			prepareForSelection(population);

			var parents = selectTwoDifferentIndividual(population);
			options.mutationOperator(parents[0].genome);
			parents[0].fitness = options.fitnessCalculator(parents[0].genome);
		}
	};

})();


