import {JigModule} from "../module";
import {globalContainer} from "../di";
import {ServerRehydrateService} from "../../components/server/server-rehydrate-service";
import {Component, html, RehydrateService, RenderResult} from "../../components/component";
import {Platform} from "../platform";

describe('Module', () => {
    beforeEach(() => {
        globalContainer.register(RehydrateService.InjectionToken, ServerRehydrateService);
        globalContainer.register(Platform, {useValue: new Platform(false)});
    })

    it('registers providers', function () {
        const container = globalContainer.createChildContainer();

        new JigModule({
            providers: [
                {provide: "abc", useValue: "cba"},
                {provide: "def", useValue: "fed"},
            ]
        }).register(window, container);

        expect(container.resolve("abc")).toBe("cba");
        expect(container.resolve("def")).toBe("fed");
    });

    it('registers modules', function () {
        const container = globalContainer.createChildContainer();

        new JigModule({
            modules: [
                new JigModule({
                    providers: [
                        {provide: "abc", useValue: "cba"},
                        {provide: "def", useValue: "fed"}
                    ]
                })
            ]
        }).register(window, container);

        expect(container.resolve("abc")).toBe("cba");
        expect(container.resolve("def")).toBe("fed");
    });

    it('registers components', function () {
        const container = globalContainer.createChildContainer();

        @Component('my-component')
        class MyComponent {
            render(): RenderResult {
                return html`Hello, World!`;
            }

        }

        new JigModule({
            components: [
                MyComponent
            ]
        }).register(window, container);

        document.body.appendChild(document.createElement('my-component'));

        expect(document.body.innerHTML).toContain('Hello, World!');
    });

    it('registers sub modules', function () {
        const container = globalContainer.createChildContainer();

        new JigModule({
            providers: [
                {provide: "abc", useValue: "cba"},
            ]
        }).withContainer((container) => {
            const value = container.resolve("abc");

            return new JigModule({
                providers: [{
                    provide: "def",
                    useValue: value + "!"
                }]
            });
        }).register(window, container);

        expect(container.resolve("def")).toBe("cba!");
    });
});