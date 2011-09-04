/**
 * @class Utility functions. Does a few handy
 * jobs for us. Automatically instantiated to <strong>A3.Utility</strong>
 */
A3.Core.Utility = function() {
	
	/**
	 * Checks if a value is null or undefined rather
	 * than just a falsy value like 0 or []. If it
	 * is null or undefined we provide a default
	 * value for it to use instead.
	 * 
	 * @param {Mixed} value The value to check
	 * @param {Mixed} defaultValue The value to return if it isn't just a falsy value
	 */
	this.checkValue = function(value, defaultValue) {
		
		var returnValue = value;
		
		if(value === undefined || value === null) {
			returnValue = defaultValue;
		}
		
		return returnValue;
	};
	
};

// shortcut
A3.Utility = new A3.Core.Utility();
