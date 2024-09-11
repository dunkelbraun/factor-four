/**
 * Returns the current mono environment from the `MONO_ENV` environment variable.
 *
 * @default local
 */
export function monoEnv() {
	return process.env.MONO_ENV || "local";
}
