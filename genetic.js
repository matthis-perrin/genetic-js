var genetic = (function() {

	var EPSILON = 0.0000001;
	var population;
	var generationNumber = 0;


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
		mutationProba: 0.01,

		selectionMode: 'tournament', // Can be 'rouletteWheel' or 'tournament'

		fitnessCalculator: defaultFitnessCalculator,
		keepBestReproduction: false, // If true, we only keep a child when it's better than its parent.

		finish: null,
		disasterFrequency: 0,
		disasterGravity: 0.99,
	};

	function defaultGenomeGenerator()
	{
		var randomGenome = [];
		for (var i = 0; i < options.genomeSize; i++)
		{
			if (options.genomeValueType === 'Integer')
				randomGenome[i] = randomInteger(options.genomeMinValue, options.genomeMaxValue + 1);
			else if (options.genomeValueType === 'Double')
				randomGenome[i] = randomDouble(options.genomeMinValue, options.genomeMaxValue + 1);
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


	// Return an array of `populationSize` random individual
	// And individual is modelize this way : 
	// {
	//   genome: array,
	//   fitness: double
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


	// Perform a simple point crossover on two indivudals genomes and return the
	// resulting children.
	function simplePointCrossOver(fatherGenome, motherGenome)
	{
		var pivot = randomInteger(1, fatherGenome.length);
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


	// Clone an individual
	function clone(individual)
	{
		return {
			genome: individual.genome.slice(),
			fitness: individual.fitness
		}
	}


	// Make evoluate a population to the next generation
	function evoluate(population)
	{
		generationNumber++;
		var newPopulation = [];

		// We prepare the population for the selection
		if (options.selectionMode === 'rouletteWheel')
			prepareForRouletteWheel(population);
		else if (options.selectionMode === 'tournament')
			sort(population);

		// We select 2 new individuals for each pass in the loop
		for (var i = 0; i < population.length; i += 2)
		{
			// We select two individuals
			var parents = [];
			if (options.selectionMode === 'rouletteWheel')
			{
				var firstRand = randomDouble(0, 1);
				var secondRand = randomDouble(0, 1);
				parents[0] = dichotomicRouletteWheel(population, firstRand);
				parents[1] = dichotomicRouletteWheel(population, secondRand);
			}
			else if (options.selectionMode === 'tournament')
			{
				parents[0] = tournamentSelection(population);
				parents[1] = tournamentSelection(population);
			}

			// And create two children using the parents genome
			var childrenGenome = simplePointCrossOver(parents[0].genome, parents[1].genome);

			// We make a mutation if the god of proba is okay (for each children)
			for (var j = 0; j < 2; j++)
				if (randomDouble(0, 1) < options.mutationProba)
					options.mutationOperator(childrenGenome[j]);

			// We can construct the children from the final genome
			var children = [{
				genome: childrenGenome[0],
				fitness: options.fitnessCalculator(childrenGenome[0])
			}, {
				genome: childrenGenome[1],
				fitness: options.fitnessCalculator(childrenGenome[1])
			}];

			// If we are not in the keepBestReproduction mode we just
			// add the two children
			if (!options.keepBestReproduction)
			{
				newPopulation[i] = children[0];
				newPopulation[i + 1] = children[1];
			}
			// If we are in the keepBestReproduction mode we need to find
			// the to best individual between the parents and the children
			// to add them.
			else
			{
				if (parents[0].fitness > parents[1].fitness)
				{
					var firstBest = parents[0];
					var secondBest = parents[1];
				}
				else
				{
					var firstBest = parents[1];
					var secondBest = parents[0];
				}
				for (j = 0; j < 2; j++)
				{
					if (children[j].fitness > firstBest.fitness)
						firstBest = children[j];
					else if (children[j].fitness > secondBest.fitness)
						secondBest = children[j];
				}

				newPopulation[i] = firstBest;
				newPopulation[i+1] = secondBest;
			}
		}

		// If we have reach the disaster freauency number, we generate a disaster
		if (generationNumber % options.disasterFrequency == 0)
			newPopulation = disaster(newPopulation);

		return newPopulation;
	}


	// Sort the population using the fitness
	function sort(population)
	{
		return population.sort(function(a, b) { return b.fitness - a.fitness });
	}


	// Simulate a disaster. A proportion (defined by disasterGravity) of the population 
	// (from the weakest to the strongest) is killed and replaced by new random individual.
	function disaster(population)
	{
		population = sort(population);
		for (var i = population.length * (1 - options.disasterGravity); i < population.length; i++)
		{
			var randomGenome = options.genomeGenerator();
			population[i] = {
				genome: randomGenome,
				fitness: options.fitnessCalculator(randomGenome)
			}
		}
		return population;
	}


	return {
		initialize: function(newOptions) {
			extend(options, newOptions);
			population = generateRandomPopulation();
		},
		start: function() {
			for (var i = 0; i < 1000; i++)
				population = evoluate(population);

			if (options.finish !== null)
				options.finish(population);
		},
		nextGeneration: function() {
			population = evoluate(population);
		},
		manualDisaster: function() {
			population = disaster(population);
		},
		getPopulation: function() {
			return sort(population);
		},
		getGenerationNumber: function() {
			return generationNumber;
		}
	};

})();


