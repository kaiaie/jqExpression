var Test = {
	Runner : function (writeFn) {
		this.write = writeFn;
	},
	
	assertEqual : function (val1, val2) {
		if (val1 != val2) {
			throw new Error("Assertion failed: " + val1 + " is not equal to " + val2);
		}
	},
	
	assertFail : function () {
		throw new Error("Assertion failed");
	},
	
	assertTrue : function (val) {
		if (!val) {
			throw new Error("Assertion failed: Expected true, was false");
		}
	},
	
	assertFalse : function (val) {
		if (val) {
			throw new Error("Assertion failed: Expected false, was true");
		}
	}
};

Test.Runner.prototype.run = function () {
	var testsSuccessful = 0, testsFailed = 0, startTime = Date.now();
	for (var i = 0; i < arguments.length; ++i) {
		var suite = arguments[i];
		var name = suite["_name"] ? suite["_name"] : "TestSuite" + i;
		for (var item in suite) {
			if (
				suite.hasOwnProperty(item) && 
				item.substring(0, 4) === "test" && 
				typeof suite[item] === "function"
			) {
				try {
					if (suite["setUp"] && typeof suite["setUp"] === "function") {
						suite["setUp"]();
					}
					suite[item]();
					if (suite["tearDown"] && typeof suite["tearDown"] === "function") {
						suite["tearDown"]();
					}
					testsSuccessful++;
					this.write("Test " + name + "::" + item + " OK", true);
				}
				catch (e) {
					if (e.stack && console && console.log) console.log(e.stack);
					testsFailed++;
					this.write("Test " + item + " failed: " + e.toString(), false);
				}
			}
		}
		this.write("\u00a0", true);
	}
	var endTime = Date.now();
	this.write(
		(testsSuccessful + testsFailed) + " test(s) run, " + 
		testsSuccessful + " test(s) passed, " +
		testsFailed + " test(s) failed, " +
		(endTime - startTime) + "ms elapsed", 
		true
	);
}