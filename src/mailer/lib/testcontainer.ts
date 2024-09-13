import type { PortWithBinding } from "testcontainers";

export interface TestContainer<T> {
	container: (options?: any) => Promise<T>;
}

export interface TestContainerOptions {
	imageTag?: string;
	exposedPorts?: PortWithBinding[];
}
