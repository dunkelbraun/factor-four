import type { GenericContainer, PortWithBinding } from "testcontainers";

export type TestContainer<
	TClass extends TestContainerImplementation & { new (...args: any): any },
> = InstanceType<TClass & TestContainerImplementation>;

interface TestContainerImplementation {
	testContainer: (options?: any) => GenericContainer;
}

export interface TestContainerOptions {
	imageTag?: string;
	exposedPorts?: PortWithBinding[];
}
