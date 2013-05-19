var genetic = (function() {

	var EPSILON = 0.0000001;


	// *********************************
	// ***** DEFAULT CONFIGURATION *****
	// *********************************

	var options = {
		populationSize: 1000,

		genomeSize: 10,
		genomeMinValue: 0, // Inclusive
		genomeMaxValue: 10, // Inclusive
		genomeValueType: 'Integer', // Can be 'Integer', 'Double', 'Character'
		genomeGenerator: defaultGenomeGenerator,

		fitnessCalculator: defaultFitnessCalculator 
	};

	function defaultGenomeGenerator()
	{
		var randomGenome = [];
		for (var i = 0; i < options.genomeSize; i++)
		{
			if (options.genomeValueType === 'Integer')
				randomGenome[i] = Math.floor(Math.random() * (options.genomeMaxValue - options.genomeMinValue + 1)) + options.genomeMinValue;
			else if (options.genomeValueType === 'Double')
				randomGenome[i] = Math.random() * (options.genomeMaxValue - options.genomeMinValue) + options.genomeMinValue;
			else if (options.genomeValueType === 'Character')
				randomGenome[i] = String.fromCharCode(97 + Math.floor(Math.random() * 26));
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





	function extend(defaultValues, newValues)
	{
		if (typeof newValues === 'undefined') return;
		for (prop in defaultValues)
			if (prop in newValues)
		  	defaultValues[prop] = newValues[prop];
	}

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

	function getBestInPopulation(population)
	{
		var best = population[0];
		for (var i = 1; i < population.length; i++)
			if (population[i].fitness > best.fitness)
				best = population[i];
		return best;
	}

	return {
		initialize: function(newOptions) {
			extend(options, newOptions);
		},
		start: function() {
			var population = generateRandomPopulation();
			console.log(getBestInPopulation(population));
		}
	};

})();


