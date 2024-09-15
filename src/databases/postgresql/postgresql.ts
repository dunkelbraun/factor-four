import { snakeCase } from "case-anything";
import { PostgreSQLContainer } from "~/databases/postgresql/container.js";

/**
 * PostgreSQL Database.
 *
 */
export class PostgreSQLDatabase {
	container: PostgreSQLContainer;

	constructor(public id: string) {
		this.container = new PostgreSQLContainer({
			resourceId: id,
			connectionStringEnvVarName: this.credentialsEnvVar,
		});
	}
	/**
	 * Returns the environment variable name that should contain the STMP connection URL.
	 */
	get credentialsEnvVar() {
		return `DATABASE_${snakeCase(this.id).toUpperCase()}_URL`;
	}
}

export function definePostgreSQLDatabase(id: string) {
	return new PostgreSQLDatabase(id);
}
