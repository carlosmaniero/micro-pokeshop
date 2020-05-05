import {FragmentContentRender} from "../fragments";
import {Injectable} from "../../core/di";

@Injectable([FragmentContentRender.InjectionToken])
export class ServerContentRender implements FragmentContentRender {
    render(html: string): HTMLElement {
        const div = document.createElement('div');
        div.innerHTML = html;
        return div;
    }
}