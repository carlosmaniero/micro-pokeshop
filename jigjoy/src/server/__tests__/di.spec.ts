import {PerRequestContainer, Request, Response} from "../di";
import {DIContainer, Inject, Injectable, Singleton} from "../../core/di";
import {RequestWaitMiddleware} from "../middlewares";

describe('Server Dependency Injection', () => {
    describe('RequestScopeInjectable', () => {
        it('decorates the class without changing its instance', () => {
            @Injectable()
            class MyClass {
                constructor(public readonly i: number) {
                }
            }

            expect(new MyClass(1).i).toEqual(1);
        });
    })

    it('registers a token in a request context', () => {
        @Injectable()
        class MyClass {
            constructor(
                @Inject(Request.InjectionToken) public readonly request: Request,
                @Inject(Response.InjectionToken) public readonly response: Response) {
            }
        }

        const request = jest.fn();
        const response = jest.fn();

        const requestContainer = new PerRequestContainer().createRequestContainer(request as any, response as any);

        expect(requestContainer.resolve(MyClass).request).toEqual(request);
        expect(requestContainer.resolve(MyClass).response).toEqual(response);
    });

    it('throws an exception when trying to resolve a request scope class using global container', () => {
        @Injectable()
        class MyClass {
            constructor(
                @Inject(Request.InjectionToken) public readonly request: Request,
                @Inject(Response.InjectionToken) public readonly response: Response) {
            }
        }

        const request = jest.fn();
        const response = jest.fn();

        new PerRequestContainer().createRequestContainer(request as any, response as any);

        expect(() => DIContainer.resolve(MyClass))
            .toThrow()
    });

    it('Request Scope Singleton returns always the same instance', () => {
        @Singleton([RequestWaitMiddleware.InjectionToken])
        class MyClass {
            constructor(
                @Inject(Request.InjectionToken) public readonly request: Request,
                @Inject(Response.InjectionToken) public readonly response: Response) {
            }
        }

        const request = jest.fn();
        const response = jest.fn();

        const container = new PerRequestContainer().createRequestContainer(request as any, response as any);

        expect(container.resolve(MyClass)).toBe(container.resolve(MyClass));
    });
});