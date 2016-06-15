var arithmeticTests = {
	_name : "arithmeticTests",
	
	testCreate : function () {
		// Arrange
		var sut = new Numeric.Decimal();
		
		// Assert
		Test.assertTrue(sut.isZero());
	},
	
	testDigitsBefore : function () {
		// Arrange
		var sut = new Numeric.Decimal();
		
		// Assert
		Test.assertEqual(1, sut.digitsBefore());
	},
	
	testDigitsAfter : function () {
		// Arrange
		var sut = new Numeric.Decimal();
		
		// Assert
		Test.assertEqual(Numeric.DEFAULT_DECIMAL_PLACES, sut.digitsAfter());
	},
	
	testPadLeading : function () {
		// Arrange
		var sut = new Numeric.Decimal();
		
		// Act
		sut.addLeadingZero();
		
		// Assert
		Test.assertEqual(2, sut.digitsBefore());
	},

	testPadTrailing : function () {
		// Arrange
		var sut = new Numeric.Decimal();
		
		// Act
		sut.addTrailingZero();
		
		// Assert
		Test.assertEqual(Numeric.DEFAULT_DECIMAL_PLACES + 1, sut.digitsAfter());
	},
	
	testNormalize : function () {
		// Arrange
		var sut = new Numeric.Decimal();
		
		// Act
		sut.addTrailingZero();
		sut.addTrailingZero();
		sut.addLeadingZero();
		sut.normalize();
		
		// Assert
		Test.assertEqual(1, sut.digitsBefore());
		Test.assertEqual(Numeric.DEFAULT_DECIMAL_PLACES, sut.digitsAfter());
	},	

	testNumericArgument : function () {
		// Arrange
		var sut = new Numeric.Decimal(0.5);
		
		// Assert
		Test.assertEqual("0.50", sut.toString());
	},
	
	testSignedNumericArgument : function () {
		// Arrange
		var sut = new Numeric.Decimal(-0.5);
		
		// Assert
		Test.assertFalse(sut.positive);
	},
	
	testStringArgument : function () {
		// Arrange
		var sut = new Numeric.Decimal("123.456");
		
		// Assert
		Test.assertTrue(sut.toString());
	},
	
	testStringBadArgument : function () {
		try {
			// Arrange
			var sut = new Numeric.Decimal("123.45.6");
		} catch (e) {
			return;
		}
		Test.assertFail();
	},				
	
	testStringNonDigits : function () {
		try {
			// Arrange
			var sut = new Numeric.Decimal("12z3.45");
		} catch (e) {
			return;
		}
		Test.assertFail();
	},
	
	testEmptyStringArgumentIsZero : function () {
		// Arrange
		var sut = new Numeric.Decimal("");
		
		// Assert
		Test.assertTrue(sut.isZero());
	},
	
	testStringArgumentWithRadixSeparatorsIsOK : function () {
		// Arrange
		var sut = new Numeric.Decimal("1,234.56");
		
		// Assert
		Test.assertFalse(sut.isZero());
	},
	
	testNegativeZeroIsNotAThing : function () {
		// Arrange
		var sut = new Numeric.Decimal();
		
		// Act
		sut.neg();
		
		// Assert
		Test.assertTrue(sut.isZero());
	},
	
	testZeroNumbersCompareEqual : function () {
		// Arrange
		var sut1 = new Numeric.Decimal(),
			sut2 = new Numeric.Decimal();
		
		// Assert
		Test.assertTrue(sut1.equals(sut2));
	},
	
	
	testCompareBigToSmall : function () {
		// Arrange
		var sut1 = new Numeric.Decimal("100"),
			sut2 = new Numeric.Decimal("12.3");
		
		// Assert
		Test.assertTrue(sut1.compare(sut2) === 1);
	},	

	testCompareNegativeToPositive : function () {
		// Arrange
		var sut1 = new Numeric.Decimal("-100"),
			sut2 = new Numeric.Decimal("12.3");
		
		// Assert
		Test.assertTrue(sut1.compare(sut2) === -1);
	},
	
	testComparePositiveToNegative : function () {
		// Arrange
		var sut1 = new Numeric.Decimal("100"),
			sut2 = new Numeric.Decimal("-12.3");
		
		// Assert
		Test.assertTrue(sut1.compare(sut2) === 1);
	},		
	
	testCompareNegativeToNegative : function () {
		// Arrange
		var sut1 = new Numeric.Decimal("-100"),
			sut2 = new Numeric.Decimal("-12.3");
		
		// Assert
		Test.assertTrue(sut1.compare(sut2) === -1);
	},
	
	testAddZeroGivesTheSame : function () {
		// Arrange
		var sut = new Numeric.Decimal(1);
		
		// Act
		var result = sut.plus(0);
		
		// Assert
		Test.assertTrue(result.equals(sut));
	},
	
	testAddOnePlusOneEqualsTwo : function () {
		// Arrange
		var sut = new Numeric.Decimal(1);
		
		// Act
		var result = sut.plus(1);
		
		// Assert
		Test.assertEqual("2", result.toString());
	},	
	
	testAdditionIsCommutative : function () {
		// Arrange
		var sut1 = new Numeric.Decimal(1.7),
			sut2 = new Numeric.Decimal(1.3);
		
		// Act
		var result1 = sut1.plus(sut2)
			result2 = sut2.plus(sut1);
		
		// Assert
		Test.assertTrue(result1.equals(result2));
		Test.assertEqual("3", result1.toString());
	},
	
	testAdditionCarriesCorrectly : function () {
		// Arrange
		var sut1 = new Numeric.Decimal(9.9),
			sut2 = new Numeric.Decimal(0.1);
		
		// Act
		var result = sut1.plus(sut2);
		
		// Assert
		Test.assertEqual("10", result.toString());
	},
	
	testSubtraction : function () {
		// Arrange
		var sut1 = new Numeric.Decimal(9.9),
			sut2 = new Numeric.Decimal(0.1);
		
		// Act
		var result = sut1.minus(sut2);
		
		// Assert
		Test.assertEqual("9.80", result.toString());
	},
	
	testSubtractionBorrowsCorrectly : function () {
		// Arrange
		var sut1 = new Numeric.Decimal(9.4),
			sut2 = new Numeric.Decimal(0.6);
		
		// Act
		var result = sut1.minus(sut2);
		
		// Assert
		Test.assertEqual("8.80", result.toString());
	},
	
	testAddingNegativeNumbersGivesNegativeAnswer : function () {
		// Arrange
		var sut1 = new Numeric.Decimal("-100"),
			sut2 = new Numeric.Decimal("-12.3");
		
		// Act
		var result = sut1.plus(sut2);
			
		// Assert
		Test.assertEqual("-112.30", result);		
	},
	
	testAddingNegativeNumberToPositive : function () {
		// Arrange
		var sut1 = new Numeric.Decimal("100"),
			sut2 = new Numeric.Decimal("-12.3");
		
		// Act
		var result = sut1.plus(sut2);
			
		// Assert
		Test.assertEqual("87.70", result);		
	},
	
	testAddingNegativeNumberToPositive : function () {
		// Arrange
		var sut1 = new Numeric.Decimal("-100"),
			sut2 = new Numeric.Decimal("12.3");
		
		// Act
		var result = sut1.plus(sut2);
			
		// Assert
		Test.assertEqual("-87.70", result);		
	},
	
	testSubtractingANegativeIsAddition : function () {
		// Arrange
		var sut1 = new Numeric.Decimal("19.1"),
			sut2 = new Numeric.Decimal("4.7");
		
		// Act
		var result1 = sut1.minus(sut2),
			result2 = sut1.plus(sut2.neg());
			
		// Assert
		Test.assertTrue(result1.equals(result2));		
	},
	
	testSubtractingFromANegativeMakesItSmaller : function () {
		// Arrange
		var sut1 = new Numeric.Decimal("-19.1"),
			sut2 = new Numeric.Decimal("4.7");
		
		// Act
		var result = sut1.minus(sut2);
			
		// Assert
		Test.assertTrue(result.compare(sut1) === -1);		
	},
	
	testSubtractingANegativeFromANegativeMakesItBigger : function () {
		// Arrange
		var sut1 = new Numeric.Decimal("-19.1"),
			sut2 = new Numeric.Decimal("-4.7");
		
		// Act
		var result = sut1.minus(sut2);
			
		// Assert
		Test.assertTrue(result.compare(sut1) === 1);		
	},
	
	testMultiplyingByZeroIsZero : function () {
		// Arrange
		var sut1 = new Numeric.Decimal("-19.1"),
			sut2 = new Numeric.Decimal(0);
		
		// Act
		var result = sut1.multipliedBy(sut2);
			
		// Assert
		Test.assertTrue(result.isZero());		
	},	

	testMultiplyingByOneIsSelf : function () {
		// Arrange
		var sut1 = new Numeric.Decimal("-19.1"),
			sut2 = new Numeric.Decimal(1);
		
		// Act
		var result = sut1.multipliedBy(sut2);
			
		// Assert
		Test.assertTrue(result.equals(sut1));		
	},	
	
	testMultiplyingTwoNumbersIsCorrect : function () {
		// Arrange
		var sut1 = new Numeric.Decimal("3.14"),
			sut2 = new Numeric.Decimal("1.414");
		
		// Act
		var result = sut1.multipliedBy(sut2);
			
		// Assert
		Test.assertEqual("4.43996", result.toString());		
	},
	
	testMultiplyingTwoNegativeNumbersIsPositive : function () {
		// Arrange
		var sut1 = new Numeric.Decimal("-7"),
			sut2 = new Numeric.Decimal("-8");
		
		// Act
		var result = sut1.multipliedBy(sut2);
			
		// Assert
		Test.assertEqual("56", result.toString());		
	},
	
	testDividingByZeroIsAnError : function () {
		// Arrange
		var sut = new Numeric.Decimal("1995");
		
		// Act
		try {
			var result = sut.DividedBy(0);
		}
		catch (e) { return; }
		// Assert
		Test.assertFail();		
	},	

	testDividingByOneIsSelf : function () {
		// Arrange
		var sut = new Numeric.Decimal("40.1");
		
		// Act
		var result = sut.dividedBy(1);
			
		// Assert
		Test.assertTrue(result.equals(sut));		
	},
	
	testDividingIsExact : function () {
		// Arrange
		var sut = new Numeric.Decimal(10);
		
		// Act
		var result = sut.dividedBy(4);
			
		// Assert
		Test.assertEqual("2.5", result.toString());		
	},
	
	testInexactDivisionAccurateToSomeDecimalPlaces : function () {
		// Arrange
		var sut = new Numeric.Decimal(1);
		
		// Act
		var result = sut.dividedBy(3);
			
		// Assert
		Test.assertTrue(result.toString().startsWith("0.3333"));		
	},
	
	testInexactDivisionWithLargeDividendIsCorrect : function () {
		// Arrange
		var sut = new Numeric.Decimal(10);
		
		// Act
		var result = sut.dividedBy(3);
			
		// Assert
		Test.assertTrue(result.toString().startsWith("3.3333"));		
	},					
};


var parserTests = {
	_name : "parserTests",
	
	testEmptyExpressionEmptyResult : function () {
		// Act
		var result = Numeric.parseExpression("");
		
		// Assert
		Test.assertTrue(typeof result === "object");
		Test.assertEqual(0, result.length);		
	},
	
	testTokensAndLiterals : function () {
		// Act
		var result = Numeric.parseExpression("1 + 0");
		
		// Assert
		Test.assertTrue(typeof result === "object");
		Test.assertEqual(3, result.length);		
	},
	
	testParserEmptyExpression : function () {
		// Act
		var result = Numeric.evaluateExpression("");
		
		// Assert
		Test.assertEqual("", result);
	},
	
	testNumberEvaluatesToSelf : function () {
		// Act
		var result = Numeric.evaluateExpression("2");
		
		// Assert
		Test.assertEqual("2.00", result);				
	},

	testParserBasicExpression : function () {
		// Act
		var result = Numeric.evaluateExpression("1 + 1");
		
		// Assert
		Test.assertEqual("2.00", result);				
	},
	
	testParserPrecedence : function () {
		// Act
		var result = Numeric.evaluateExpression("1 + 2 * 3");
		
		// Assert
		Test.assertEqual("7.00", result);
	},
	
	testParserParentheses : function () {
		// Act
		var result = Numeric.evaluateExpression("(1 + 2) * 3");
		
		// Assert
		Test.assertEqual("9.00", result);
	},
	
	testParserInexact : function () {
		// Act
		var result = Numeric.evaluateExpression("22 / 7");
		
		// Assert
		Test.assertTrue(result.startsWith("3.14"));
	},
	
	testParserBadExpressionThrowsException : function () {
		// Act
		try {
			var result = Numeric.evaluateExpression("1%$%T");
		}
		catch (e) { return; }
		// Assert
		Test.assertFail();
	}
};