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
function randomIntegerWithout(min, max, without)
{
	var random = Math.floor(Math.random() * (max - min - 1)) + min;
	if (random >= without)
		return random + 1;
	return random;
}


// Choose a random double between `min` (inclusice) and `max` (exclusive)
// and preventing number between `withoutMin` and `withoutMax to be selected.
function randomDoubleWithout(min, max, withoutMin, withoutMax)
{
	var random = Math.random() * (max - min - withoutMax + withoutMin) + min;
	if (random >= withoutMin)
		return random + withoutMax - withoutMin;
	return random;
}