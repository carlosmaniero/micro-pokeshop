import '@abraham/reflection';
import {Renderable} from "jigjs/template/render";
import {component, disconnectedCallback, html} from "jigjs/components";
import {Subject} from "jigjs/events/subject";
import {observable, observing} from "jigjs/reactive";
import {Route, RouteLinkElement, RouterLink, RouterLinkFactory} from "jigjs/framework/router/router-link";
import {RouterModule} from "jigjs/framework/router/module";
import {Routes} from "jigjs/framework/router/routes";
import {App, AppFactory} from "jigjs/framework/app/app";


@observable()
class TestClass {
    count = 0

    increase() {
        this.count++;
    }
}

@component()
class ActionButton {
    clickSubject: Subject<void>;

    constructor(private readonly label: string) {
        this.clickSubject = new Subject();
    }

    render() {
        return html`<button onclick="${() => this.clickSubject.publish()}">${this.label}</button>`
    }
}

@component()
class ToggleWatchButton {
    public readonly pauseSubject: Subject<void>;
    public readonly resumeSubject: Subject<void>;
    @observing()
    public running = true;
    private readonly pause = new ActionButton('pause');
    private readonly resume = new ActionButton('resume');

    constructor() {
        this.pause = new ActionButton('pause');
        this.resume = new ActionButton('resume');

        this.pauseSubject = this.pause.clickSubject;
        this.resumeSubject = this.resume.clickSubject;

        this.pauseSubject.subscribe(() => {
            this.running = false;
        });

        this.resumeSubject.subscribe(() => {
            this.running = true;
        });
    }

    render() {
        if (this.running) {
            return html`${this.pause}`;
        }

        return html`${this.resume}`;
    }

    markAsRunning() {
        this.running = true;
    }
}

@component()
class Counter {
    @observing()
    private number = 0;
    private interval: any;

    constructor() {
        this.startWatcher();
    }

    render(): Renderable {
        return html`<strong>total:</strong> ${this.number}`;
    }

    public restartWatcher() {
        this.number = 0;
        this.resumeWatcher();
    }

    @disconnectedCallback()
    public pauseWatcher() {
        this.interval = clearInterval(this.interval);
    }

    public resumeWatcher() {
        if (this.interval) {
            return;
        }
        this.startWatcher();
    }

    private startWatcher() {
        this.interval = setInterval(() => {
            this.number++;
        }, 1000);
    }
}

@component()
class CountWatch {
    private readonly toggleWatchButton = new ToggleWatchButton();
    private readonly restartButton = new ActionButton('restart');
    private readonly counterComponent = new Counter();

    constructor() {
        this.toggleWatchButton.pauseSubject.subscribe(() => {
            this.counterComponent.pauseWatcher();
        });

        this.toggleWatchButton.resumeSubject.subscribe(() => {
            this.counterComponent.resumeWatcher();
        });

        this.restartButton.clickSubject.subscribe(() => {
            this.restartWatcher();
        });
    }

    render() {
        return html`
            ${this.restartButton}
            ${this.counterComponent}
            ${this.toggleWatchButton}
        `;
    }

    @disconnectedCallback()
    public x() {
        console.log('asds');
    }

    private restartWatcher() {
        this.counterComponent.restartWatcher();
        this.toggleWatchButton.markAsRunning();
    }
}

@component()
class PureComponentTest {
    @observing()
    private countWatchers = [];
    @observing()
    private input = "";

    render() {
        return html`
            <ul>${
            this.countWatchers.map((watcher) => {
                return html`<li>${watcher}</li>`
            })
        }</ul>
            
            ${this.input}
            
            <input value="${this.input}" oninput="${(event) => {
            this.input = event.target.value;
        }}">
            
            <button onclick="${() => {
            console.log('lalala');
            this.countWatchers = [...this.countWatchers, new CountWatch()]
        }}">Add Watcher</button>
            
            <button onclick="${() => {
            this.countWatchers = []
        }}">Clean All</button>
        `
    }
}

@component()
class Home {
    private readonly pureLink: RouterLink;

    constructor(linkFactory: RouterLinkFactory) {
        this.pureLink = linkFactory.createLink(new Route('pure'), new RouteLinkElement('click me'));
    }

    render() {
        return html`${this.pureLink}`;
    }
}

export const appFactory: AppFactory = (window, platform) => {
    const routerModule = new RouterModule(window, platform, new Routes([
        {
            path: '/pure',
            name: 'pure',
            handler(params, render) {
                render(new PureComponentTest())
            }
        },
        {
            path: '/',
            name: 'home',
            handler(params, render) {
                render(new Home(routerModule.linkFactory))
            }
        }
    ]));

    return new App(routerModule)
}
