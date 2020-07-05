import {App} from "../../pure-app/app";
import {RouterModule} from "../../pure-router/module";
import {Routes} from "../../pure-router/routes";
import {html, pureComponent} from "../../pure-components/pure-component";
import {waitForPromises} from "../../testing/wait-for-promises";
import {Renderable} from "../../template/render";
import {ServerSideRendering} from "../../pure-server/ssr";
import {JSDOM} from "jsdom";
import {Response} from "../response";

describe('Server side rendering', () => {
    @pureComponent()
    class HomeComponent {
        render(): Renderable {
            return html`Hello, world!`;
        }
    }

    it('renders the given template', async () => {
        const appFactory = (window): App => new App(new RouterModule(window, new Routes([
            {
                path: '/home',
                name: 'home',
                async handler(params, render) {
                    await waitForPromises();
                    render(new HomeComponent());
                }
            }
        ])));

        const ssr = new ServerSideRendering(appFactory, `
            <html lang="pt-br">
                <head>
                    <title>Hello!</title>                    
                </head>
                <body>
                    <div id="root"></div>
                </body>
            </html>
        `, '#root')

        const renderResult: Response = await ssr.renderRouteAsString('/home');
        const renderDom = new JSDOM(renderResult.responseText);

        expect(renderResult.status).toBe(200);
        expect(renderDom.window.document.querySelector('html').getAttribute('lang')).toBe('pt-br');
        expect(renderDom.window.document.getElementById('root').querySelector('homecomponent').textContent).toBe('Hello, world!');
    });
});