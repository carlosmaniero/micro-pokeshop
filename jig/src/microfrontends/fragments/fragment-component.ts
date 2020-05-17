import {FragmentContentRender, FragmentOptions, FragmentResolver, FragmentResponse} from "./fragments";
import {constructor, GlobalInjectable, Inject, Injectable} from "../../core/di";
import {Component, OnMount, RenderResult, State} from "../../components/component";

interface FragmentStateComponent {
    response?: FragmentResponse;
    error?: Error;
}

@Injectable()
export abstract class FragmentComponent implements OnMount {
    @State()
    state: FragmentStateComponent = {}
    abstract readonly options: FragmentOptions;

    constructor(@Inject(FragmentResolver.InjectionToken) protected readonly fragmentResolver: FragmentResolver,
                @Inject(FragmentContentRender.InjectionToken) protected readonly fragmentContentRender: FragmentContentRender,) {
    }

    async mount(): Promise<void> {
        try {
            this.state.response = await this.fragmentResolver.resolve(this.options);
        } catch (e) {
            this.state.error = e;
        }
    }

    render(): RenderResult {
        if (this.state.error) {
            return this.onErrorRender(this.state.error);
        }
        if (this.state.response) {
            return this.fragmentContentRender.render(this.state.response.html);
        }
        return FragmentComponent.pendingFragment();
    }

    static readonly FragmentPlaceholderClass = 'jig-joy-fragment-placeholder';

    private static pendingFragment() {
        const htmlDivElement = document.createElement('div');
        htmlDivElement.className = this.FragmentPlaceholderClass
        return htmlDivElement;
    }

    shouldUpdate({from}) {
        if (from.childNodes.length > 0) {
            return from.childNodes[0].className === 'jig-joy-fragment-placeholder';
        }
        return true;
    }

    protected onErrorRender(error: Error): RenderResult {
        return document.createElement('div');
    }
}


interface FragmentComponentFactoryProps {
    selector: string;
    options: FragmentOptions;
    onErrorRender?: (error: Error) => RenderResult;
}

@GlobalInjectable()
export class FragmentComponentFactory {
    createFragment({selector, options, onErrorRender}: FragmentComponentFactoryProps): constructor<FragmentComponent> {

        @Component(selector)
        class DynamicallyCreatedFragment extends FragmentComponent {
            readonly selector: string = selector;
            readonly options: FragmentOptions = options;

            protected onErrorRender(error: Error): RenderResult {
                if (!onErrorRender) {
                    return super.onErrorRender(error);
                }
                return onErrorRender(error);
            }
        }

        return DynamicallyCreatedFragment;
    }
}
