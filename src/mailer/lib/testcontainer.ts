import type { PortWithBinding } from "testcontainers";

export interface TestContainer<T> {
	testContainer: (options?: any) => Promise<T>;
}

export interface TestContainerOptions {
	imageTag?: string;
	exposedPorts?: PortWithBinding[];
}
