type PatternMatcher = (title: string) => boolean;

export interface CompiledPatterns {
	includeMatchers: PatternMatcher[];
	excludeMatchers: PatternMatcher[];
}

/**
 * Compiles and validates include and exclude patterns.
 * @param includePatterns Optional array of patterns to include when matching titles.
 * @param excludePatterns Optional array of patterns to exclude when matching titles.
 * @returns An object containing precompiled include and exclude pattern matchers.
 */
export const compilePatterns = (includePatterns?: string[], excludePatterns?: string[]): CompiledPatterns => {
	const compilePattern = (pattern: string): PatternMatcher => {
		const normalized = pattern.trim().toLowerCase();

		// Literal match
		if (!normalized.includes("*")) {
			return (title) => title.includes(normalized);
		}

		// Wildcard pattern conversion to regex
		const regexPattern = normalized.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*");

		const regex = new RegExp(`^${regexPattern}$`);
		return (title) => regex.test(title);
	};

	return {
		includeMatchers: (includePatterns || []).map(compilePattern),
		excludeMatchers: (excludePatterns || []).map(compilePattern),
	};
};

/**
 * Checks if a title matches the compiled include and exclude patterns.
 * @param title The video title to check against the patterns.
 * @param compiled An object containing precompiled include and exclude pattern matchers.
 * @returns true if the video title is valid, false if it should be excluded.
 */
export const matchesPatterns = (title: string, compiled: CompiledPatterns): boolean => {
	const lowerTitle = title.toLowerCase();

	if (compiled.excludeMatchers.length > 0 && compiled.excludeMatchers.some((matcher) => matcher(lowerTitle))) {
		console.log(`Excluding video "${title}".`);
        return false;
	}

	// If no include patterns, include anything
	if (compiled.includeMatchers.length === 0) {
		return true;
	}

	// Log included videos for validation
	const match = compiled.includeMatchers.some((matcher) => matcher(lowerTitle));
	if (match) console.log(`Including video "${title}".`);
	return match;
};
