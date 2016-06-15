/// \file expression-plugin.js
/// \author Ken Keenan, <ken@kaia.ie>
/// \brief Adds a button alongside a control that evaluates the control's value 
/// as an arithmetic expression
if (!$.fn.jqExpression) {
	$.fn.jqExpression = function () {
		$(this).each(function (globalOptions) {
			var $self = $(this),
				options = $.extend({ }, globalOptions),
				evalfn = function() {
					try {
						$self.val(Numeric.evaluateExpression(
							$self.val(),
							options
						))
						.trigger("change");
					}
					catch (e) {
						alert("Invalid expression");
					}
				},
			    $btn = $("<button>=</button>")
					.attr("type", "button")
					.attr("title", "Calculate")
					.addClass("jqexpr-button")
					.off("click.jqexpr")
					.on("click.jqexpr", evalfn);
			// Add key handler (ALT+=)
			$self
				.off("keyup.jqexpr")
				.on("keyup.jqexpr", function(e) {
					if (e.altKey && e.which == 61) {
						evalfn();
						return false;
					}
				})
				.after($btn);
			// Add submit handler to parent form
			$self
				.closest("form")
				.off("submit.jqexpr")
				.on("submit.jqexpr", evalfn);
				
			// Read data elements, override global defaults
			if ($(this).data("jqexprDecimalSeparator")) {
				options.decimalSeparator = $(this).data("jqexprDecimalSeparator");
			}
			if ($(this).data("jqexprRadixSeparator")) {
				options.radixSeparator = $(this).data("jqexprRadixSeparator");
			}
			if ($(this).data("jqexprDecimalPlaces")) {
				options.decimalPlaces = $(this).data("jqexprDecimalPlaces");
			}
			if ($(this).data("jqexprMaxDecimalPlaces")) {
				options.maxDecimalPlaces = $(this).data("jqexprMaxDecimalPlaces");
			}
		});
		return this;
	};
}
// :folding=indent:
