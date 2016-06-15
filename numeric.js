/// \file Numeric.js
/// \author Ken Keenan <ken@kaia.ie>
/// \brief JavaScript library for representing arbitrary-precision numbers and 
/// the basic arithmetic operations on them. Also, a method for evaluating 
/// arbitrary arithmetic expressions using the library.
var Numeric = {
	DECIMAL_SEPARATOR : ".",
	RADIX_SEPARATOR : ",",
	DEFAULT_DECIMAL_PLACES : 2,
	MAX_DECIMAL_PLACES : 8, 
	
	getOptions : function () {
		var options = {
			decimalSeparator : Numeric.DECIMAL_SEPARATOR,
			radixSeparator : Numeric.RADIX_SEPARATOR,
			decimalPlaces : Numeric.DEFAULT_DECIMAL_PLACES,
			maxDecimalPlaces : Numeric.MAX_DECIMAL_PLACES
		};		
		if (arguments.length > 0) {
			var newOptions = arguments[0];
			if (newOptions) {
				if (newOptions.decimalSeparator) {
					options.decimalSeparator = newOptions.decimalSeparator;
				}
				if (newOptions.radixSeparator) {
					options.radixSeparator = newOptions.radixSeparator;
				}
				if (newOptions.decimalPlaces) {
					options.decimalPlaces = newOptions.decimalPlaces;
				}
				if (newOptions.maxDecimalPlaces) {
					options.maxDecimalPlaces = newOptions.maxDecimalPlaces;
				}
			}
		}
		return options;
	},
	
	Decimal : function () {
		this.options = Numeric.getOptions(arguments.length > 1 ? 
			arguments[1] : null);
		
		if (arguments.length > 0) {
			var arg = arguments[0];
						
			if (typeof arg === "number") {
				arg = arg.toString();
				// We assume we're dealing with "localized" numbers
				if (this.options.decimalSeparator !== ".") {
					arg = arg.replace(".", this.options.decimalSeparator);
				}
			}
			else if (typeof arg !== "string") {
				throw new Error("Invalid argument type");
			}
			if (arg.length === 0) arg = "0" + this.options.decimalSeparator + "0";
			// Strip whitespace and radix separators
			arg = arg.replace(/\s/g, "");
			arg = arg.replace(new RegExp(this.options.radixSeparator, "g"), "");
			if ("+-".indexOf(arg.charAt(0)) >= 0) {
				this.positive = (arg.charAt(0) === "+");
				arg = arg.substring(1);
			}
			else {
				this.positive = true;
			}
			if (arg.charAt(0) === this.options.decimalSeparator) {
				arg = "0" + arg;
			}
			if (arg.charAt(arg.length - 1) === this.options.decimalSeparator) {
				arg += "0";
			}
			if (arg.indexOf(this.options.decimalSeparator) < 0) {
				arg += this.options.decimalSeparator + "0";
			}
			var parts = arg.split(this.options.decimalSeparator);
			if (parts.length != 2) {
				throw new Error("Invalid argument: argument contains multiple decimal separators");
			}
			if (!parts.every(function (item) {
					return (item.search(/^\d+$/) === 0);
				})
			) {
				throw new Error("Invalid argument: argument contains non-digits");
			}
			this.decimalPos = parts[0].length;
			if (parts[1].length < this.options.decimalPlaces) {
				parts[1] += "0".repeat(this.options.decimalPlaces - parts[1].length);
			}
			this.figures = parts.join("");
		}
		else {
			this.positive = true;
			this.figures = "0".repeat(this.options.decimalPlaces + 1);
			this.decimalPos = 1;
		}
	},
	
	parseExpression : function (expr) {
		var ws = " \t\u00a0",
			special = "+-*/()",
			idx = 0,
			currState = 0,
			currToken = "",
			endOfToken = false,
			result = [];
			
		if (expr.length === 0) return result;
			
		for (;;) {
			var currChar = expr.charAt(idx);
			
			switch(currState) {
			case 0: /* Initial state */
				if (ws.indexOf(currChar) >= 0) {
					currState = 1;
				}
				else if (special.indexOf(currChar) >= 0) {
					currState = 2;
				}
				else {
					currState = 3;
				}
				continue;
			case 1: /* Eat whitespace */
				if (ws.indexOf(currChar) < 0) {
					currState = 0;
					continue;
				}
				break;
			case 2: /* Get operator */
				if (special.indexOf(currChar) >= 0) {
					currToken += currChar;
				}
				else {
					endOfToken = true;
				}
				break;
			case 3: /* Get literal */
				if ((ws + special).indexOf(currChar) < 0) {
					currToken += currChar;
				}
				else {
					endOfToken = true;
				}
				break;
			}
			if (endOfToken) {
				endOfToken = false;
				result.push(currToken);
				currToken = "";
				currState = 0;
				continue;
			}
			idx++;
			if (idx == expr.length) break;
		}
		if (currToken.length > 0) {
			result.push(currToken);
		}
		
		return result;
	},
	
	// Returns the value of the supplied arithmetic expression
	evaluateExpression : function () {
		if (arguments.length === 0) {
			throw new Error("No expression given");
		}
		var expr = arguments[0];
		var options = Numeric.getOptions(arguments.length > 1 ? 
			arguments[1] : null);
		
		var tokens,
			currToken,
			isAddOp = function (token) {
				return (["+", "-"].indexOf(token) >= 0);
			},
		
			isMultOp = function (token) {
				return (["*", "/"].indexOf(token) >= 0);
			},
		
			getExpression = function () {
				var result;
				// Handle unary plus/minus
				if (isAddOp(currToken)) {
					result = new Numeric.Decimal(0, options); 
				}
				else {
					result = getTerm();
				}
				while (isAddOp(currToken)) {
					switch (currToken) {
					case "+":
						matchToken("+");
						result = result.plus((getTerm()));
						break;
					case "-":
						matchToken("-");
						result = result.minus(getTerm());
						break;
					}
				}
				return result;
			},

			getTerm = function () {
				var result = getFactor();
				while (isMultOp(currToken)) {
					switch (currToken) {
					case "*":
						matchToken("*");
						result = result.multipliedBy(getFactor());
						break;
					case "/":
						matchToken("/");
						result = result.dividedBy(getFactor());
						break;
					}
				}
				return result;
			},
		
			getFactor = function () {
				var result;
			
				if (currToken === "(") {
					matchToken("(");
					result = getExpression();
					matchToken(")");
				}
				else {
					result = getNumber();
				}
				return result;
			},
		
			getNumber = function () {
				var result = new Numeric.Decimal(currToken, options);
				getNextToken();
				return result;
			},
		
			matchToken = function (token) {
				if (token === currToken) {
					getNextToken();
				}
				else {
					throw new Error("Expected token: " + token);
				}
			},
		
			getNextToken = function () {
				if (tokens.length > 0) {
					currToken = tokens.shift();
				}
				else {
					currToken = "X"; // Force parse error
				}
			};
		
		tokens = Numeric.parseExpression(expr);
		if (tokens.length === 0) return "";

		// Initialize parser
		currToken = tokens.shift();

		return getExpression().toString(true);
	}
};

/// Returns the string representation of the stored number
/// \arg format If true, format the number according to the separator settings.
/// If false or omitted, dump the value of the number including leading, 
/// trailing zeroes, etc.
/// \arg formatted if supplied and true, format according to the set number of 
/// decimal places. Otherwise, dump value with minimal formatting
Numeric.Decimal.prototype.toString = function () {
	var formatted = (arguments.length > 0) ? arguments[0] : false,
		tmp = this;
	
	if (formatted) {
		tmp = this.clone()
			.times10(this.options.decimalPlaces)
			.trunc()
			.by10(this.options.decimalPlaces)
			.normalize();
	}
	
	return (tmp.positive ? "" : "-") +
		tmp.figures.substring(0, tmp.decimalPos) + 
		(formatted ?
			"." + tmp.figures.substring(tmp.decimalPos, tmp.decimalPos + tmp.options.decimalPlaces) :
			(tmp.isInteger() ? "" : "." + tmp.figures.substring(tmp.decimalPos))
		);
};


/// Returns a copy of the number
Numeric.Decimal.prototype.clone = function () {
	return new Numeric.Decimal(this.toString(), this.options);
};


/// Returns true if the stored value is zero, false otherwise
Numeric.Decimal.prototype.isZero = function () {
	return this.figures.replace(/0/g, "").length === 0;
}


/// Returns the number of digits before the decimal point including leading 
/// zeroes
Numeric.Decimal.prototype.digitsBefore = function () {
	return this.decimalPos;
};


/// Returns the number of digits after the decimal point including trailing 
/// zeroes
Numeric.Decimal.prototype.digitsAfter = function () {
	return this.figures.length - this.decimalPos;
};


/// Pads out the number with a leading zero
Numeric.Decimal.prototype.addLeadingZero = function () {
	this.figures = "0" + this.figures;
	this.decimalPos++;
}


/// Pads out the number with a trailing zero
Numeric.Decimal.prototype.addTrailingZero = function () {
	this.figures += "0";
}


/// Removes a leading zero if one is present
/// \note If the integer value of the number is zero, it will keep a leading 
/// zero to reduce the number of special cases when handling the decimal point
Numeric.Decimal.prototype.removeLeadingZero = function () {
	if (this.figures.length > (this.options.decimalPlaces + 1) && 
		this.decimalPos > 1 && 
		this.figures.charAt(0) === '0'
	) {
		this.figures = this.figures.substring(1);
		this.decimalPos--;
		return true;
	}
	return false;
}


/// Removes a trailing zero if one is present
/// \note If the fractional value of the number is zero, it will keep a number 
/// of trailing zeroes equal to the value of the decimalPlaces option to 
/// reduce the number of special cases when handling the decimal point
Numeric.Decimal.prototype.removeTrailingZero = function () {
	var l1 = this.figures.length - 1,
		p = this.figures.length - this.options.decimalPlaces;
	if ((this.decimalPos != p) && this.figures.charAt(l1) === '0') {
		this.figures = this.figures.substring(0, l1);
		return true;
	}
	return false;
}


// FIXME: Optimize!
/// Adds the necesaary number of leading or trailing zeroes so the number has 
/// the supplied number of digits before and after the decimal point
/// \arg leading Number of leading zeroes to add
/// \arg trailing Number of trailing zeroes to add
Numeric.Decimal.prototype.normalize = function () {
	var leading = arguments.length > 0 ? arguments[0] : -1;
	var trailing = arguments.length > 1 ? arguments[1] : -1;
	
	if (leading !== 0) {
		if (leading === -1) {
			while (this.removeLeadingZero());
		}
		else {
			while (leading > this.digitsBefore()) {
				this.addLeadingZero();
			}
		}
	}
	if (trailing !== 0) {
		if (trailing === -1) {
			while (this.removeTrailingZero());
		}
		else {
			while (trailing > this.digitsAfter()) {
				this.addTrailingZero();
			}
		}
	}
	return this;
}


/// Given another object of type Numeric.Decimal, add leading and trailing 
/// zeroes as necessary to ensure both have the same number of digits before 
/// and after the decimal point
Numeric.Decimal.prototype.normalizeBoth = function (arg) {
	if (typeof arg !== "object" || Object.getPrototypeOf(this) !== Object.getPrototypeOf(arg)) {
		throw new Error("Invalid argument type");
	}
	var leading = Math.max(this.digitsBefore(), arg.digitsBefore()),
	trailing = Math.max(this.digitsAfter(), arg.digitsAfter());
	this.normalize(leading, trailing);
	arg.normalize(leading, trailing);
	return this;
}


/// Changes the sign of the number
Numeric.Decimal.prototype.neg = function () {
	if (!this.isZero()) this.positive = !this.positive;
	return this;
}


/// Converts the number to its absolute value
Numeric.Decimal.prototype.abs = function () {
	this.positive = true;
	return this;
}


/// Returns true if a whole number
Numeric.Decimal.prototype.isInteger = function () {
	return this.figures.endsWith("0".repeat(this.digitsAfter()));
}


/// Multiplies the number by 10 the specified number of times
Numeric.Decimal.prototype.times10 = function () {
	var times = (arguments.length == 0) ? 1 : arguments[0];
	
	for (var i = 0; i < times; ++i) {
		if (this.digitsAfter() === this.options.decimalPlaces) this.addTrailingZero();
		this.decimalPos++;
	}
	return this;
}


/// Divides the number by 10 the specified number of times
Numeric.Decimal.prototype.by10 = function () {
	var times = (arguments.length == 0) ? 1 : arguments[0];
	
	for (var i = 0; i < times; ++i) {
		if (this.decimalPos === 1) this.addLeadingZero();
		this.decimalPos--;
	}
	return this;
}


/// Compares the number with the supplied value. If both numbers are equal, 
/// returns 0. If the supplied number is bigger, returns -1. If the supplied 
/// number is smaller, returns 1.
Numeric.Decimal.prototype.compare = function (arg) {
	if (typeof arg === "number" || typeof arg === "string") {
		arg = new Numeric.Decimal(arg);
	}
	else if (typeof arg === "object") {
		if (Object.getPrototypeOf(this) !== Object.getPrototypeOf(arg)) {
			throw new Error("Invalid argument: object is not of the expected type");
		}
	}
	else {
		throw new Error("Invalid argument type");
	}

	// Quickies
	if (this.isZero() && arg.isZero()) {
		return 0;
	}
	else if (this.positive && !arg.positive) {
		return 1;
	}
	else if (!this.positive && arg.positive) {
		return -1;
	}
	
	arg = arg.clone();
	var tmp = this.clone().normalizeBoth(arg);
	
	return (arg.figures === tmp.figures ? 
		0 : (
			arg.figures > tmp.figures ? 
			-1 : 
			1)
		) * (
			tmp.positive ? 1 : -1
		);
}


/// Returns true if the number is equal to the supplied value, false otherwise
Numeric.Decimal.prototype.equals = function (arg) {
	return (this.compare(arg) === 0);
}

/// Returns true if the number is less than the supplied value, false otherwise
Numeric.Decimal.prototype.lessThan = function (arg) {
	return (this.compare(arg) === -1);
}


/// Adds the supplied value to the current value, returning the result as a new 
/// object
Numeric.Decimal.prototype.plus = function (arg) {
	if (typeof arg === "number" || typeof arg === "string") {
		arg = new Numeric.Decimal(arg);
	}
	else if (typeof arg === "object") {
		if (Object.getPrototypeOf(this) !== Object.getPrototypeOf(arg)) {
			throw new Error("Invalid argument: object is not of the expected type");
		}
	}
	else {
		throw new Error("Invalid argument type");
	}
	
	var result = this.clone();

	if (arg.isZero()) {
		return result;
	}
	arg = arg.clone();
	result.normalizeBoth(arg);
	
	if (!result.positive && !arg.positive) {
		return result.abs().plus(arg.abs()).neg();
	}
	else if (result.positive && !arg.positive) {
		var absArg = arg.clone().abs(),
			cmp = result.compare(absArg);
		switch (cmp) {
		case -1: return absArg.minus(result).neg();
		case 0: return new Numeric.Decimal();
		case 1: return result.minus(absArg);
		default: throw new Error("Can't happen!");
		}		
	}	
	else if (!result.positive && arg.positive) {
		var absResult = result.clone().abs(),
			cmp = absResult.compare(arg);
		switch (cmp) {
		case -1: return arg.minus(absResult).neg();
		case 0: return new Numeric.Decimal();
		case 1: return absResult.minus(arg).neg();
		default: throw new Error("Can't happen!");
		}		
	}	
	
	var i = result.figures.length - 1,
	c = 0,
	f = "";
	
	for (;;) {
		var digit1 = result.figures.charCodeAt(i) - 48,
			digit2 = arg.figures.charCodeAt(i) - 48,
			sum = digit1 + digit2 + c,
			lo = sum % 10;
		f = String.fromCharCode(lo + 48) + f;
		c = (sum > 9) ? 1 : 0;
		if (i == 0) break;
		i--;
	}
	result.figures = f;
	if (c > 0) {
		result.figures = String.fromCharCode(c + 48) + result.figures;
		result.decimalPos++;
	}	
	return result.normalize();
}

/// Subtracts the supplied value from the current value, returning the result 
/// as a new object
Numeric.Decimal.prototype.minus = function (arg) {
	if (typeof arg === "number" || typeof arg === "string") {
		arg = new Numeric.Decimal(arg);
	}
	else if (typeof arg === "object") {
		if (Object.getPrototypeOf(this) !== Object.getPrototypeOf(arg)) {
			throw new Error("Invalid argument: object is not of the expected type");
		}
	}
	else {
		throw new Error("Invalid argument type");
	}
	var result = this.clone();
	if (arg.isZero()) {
		return result;
	}
	arg = arg.clone();
	result.normalizeBoth(arg);

	if (result.positive && !arg.positive) {
		return result.plus(arg.abs());
	}
	else if (!result.positive && arg.positive) {
		return result.abs().plus(arg).neg();
	}
	else if (!result.positive && !arg.positive) {
		return result.abs().minus(arg.abs()).neg();
	}
	
	var i = result.figures.length - 1,
	c = 0,
	f = "";
	
	for (;;) {
		var digit1 = result.figures.charCodeAt(i) - 48,
			digit2 = arg.figures.charCodeAt(i) - 48,
			borrow = !((digit1 - c) >= digit2),
			diff = borrow ? (10 + digit1) - (c + digit2) : digit1 - c - digit2,
			lo = diff % 10;
		f = String.fromCharCode(lo + 48) + f;
		c = borrow ? 1 : 0;
		if (i == 0) break;
		i--;
	}
	result.figures = f;
	result.normalize();
	if (c > 0) {
		result.figures = String.fromCharCode(c + 48) + result.figures;
		result.decimalPos++;
	}
	
	return result;
}


/// Multiplies the current value by the supplied value, returning the result as 
/// a new object
Numeric.Decimal.prototype.multipliedBy = function (arg) {
	if (typeof arg === "number" || typeof arg === "string") {
		arg = new Numeric.Decimal(arg);
	}
	else if (typeof arg === "object") {
		if (Object.getPrototypeOf(this) !== Object.getPrototypeOf(arg)) {
			throw new Error("Invalid argument: object is not of the expected type");
		}
	}
	else {
		throw new Error("Invalid argument type");
	}
	if (arg.isZero()) {
		return new Numeric.Decimal();
	}
	else if (arg.equals(new Numeric.Decimal(1))) {
		return this.clone();
	}
	var result = new Numeric.Decimal(0, this.options),
		i = arg.figures.length - 1,
		cnt = 0;
	
	for (;;) {
		var j = this.figures.length - 1,
			c = 0,
			f = "";
		for (;;) {
			var digit1 = arg.figures.charCodeAt(i) - 48,
				digit2 = this.figures.charCodeAt(j) - 48,
				product = c + (digit1 * digit2),
				lo = product % 10,
				c = Math.floor(product / 10);
			f = String.fromCharCode(lo + 48) + f;
			if (j == 0) break;
			j--;
		}
		if (c != 0) f = String.fromCharCode(c + 48) + f;
		result = result.plus((new Numeric.Decimal(f, this.options)).times10(cnt));
		if (i == 0) break;
		cnt++;
		i--;
	}
	result.positive = (this.positive === arg.positive);
	result.decimalPos = result.figures.length - this.options.decimalPlaces - 
		(this.digitsAfter() + arg.digitsAfter());
	return result.normalize();
}


/// Returns a new value whose value is the integral part of the current value
Numeric.Decimal.prototype.trunc = function() {
	return new Numeric.Decimal(this.figures.substring(0, this.decimalPos));
}


/// Divides the current value by the supplied value, returning the result as 
/// a new value
/// \note Uses the standard school long division method, not very efficient!
Numeric.Decimal.prototype.dividedBy = function (arg) {
	if (typeof arg === "number" || typeof arg === "string") {
		arg = new Numeric.Decimal(arg);
	}
	else if (typeof arg === "object") {
		if (Object.getPrototypeOf(this) !== Object.getPrototypeOf(arg)) {
			throw new Error("Invalid argument: object is not of the expected type");
		}
	}
	else {
		throw new Error("Invalid argument type");
	}
	if (arg.isZero()) {
		throw new Error("Division by zero");
	}
	else if (arg.equals(new Numeric.Decimal(1))) {
		return this.clone();
	}
	else if (this.equals(arg)) {
		return new Numeric.Decimal(1);
	}
	// Scale until divisor is whole number
	var dividend = this.clone(),
		divisor = arg.clone();
	while (!divisor.isInteger()) {
		divisor.times10().normalize();
		dividend.times10().normalize();
	}
	// Ensure dividend is greater than divisor (will correct at the end)
	var shiftCount = 0;
	while (dividend.lessThan(divisor)) {
		dividend.times10();
		shiftCount++;
	}
	var carryIndex = divisor.digitsBefore(),
		resultDecimalPos = (dividend.decimalPos - divisor.decimalPos),
		resultDigits = "", 
		remainder = dividend.trunc(),
		digitsAfter = 0,
		exactResult = false,
		stopAfter = this.options.maxDecimalPlaces; 
	do {
		for (j = 0; j < 10; ++j) {
			var tryRemainder = remainder.minus(divisor.multipliedBy(j));
			if (tryRemainder.lessThan(divisor)) {
				resultDigits += String.fromCharCode(48 + j);
				if (tryRemainder.isZero()) {
					exactResult = true;
					break;
				}
				carryIndex++;
				var carryDigit = (carryIndex > dividend.figures.length - 1) ?
					0 : (dividend.figures.charCodeAt(carryIndex) - 48);
				remainder = tryRemainder
					.times10()
					.plus(carryDigit);
				break;
			}
		}
		if (resultDigits.length > resultDecimalPos) digitsAfter++;
	} while (!exactResult && digitsAfter <= stopAfter);
	var result = new Numeric.Decimal(0, this.options);
	result.figures = resultDigits;
	result.decimalPos = resultDecimalPos; 
	result.positive = (this.positive === arg.positive);
	return result.by10(shiftCount).normalize();
}