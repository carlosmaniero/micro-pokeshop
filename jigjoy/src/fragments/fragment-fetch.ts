import {FragmentOptions, FragmentResolverError, FragmentResponse} from "./fragments";
import {Injectable} from "../core/di";

@Injectable()
export class FragmentFetch {
    private static parseDependencies(eventDependencies: string) {
        return eventDependencies.split(',')
            .map((dep) => dep.trim())
            .filter((dep) => !!dep);
    }

    async fetch(options: FragmentOptions): Promise<FragmentResponse> {
        const url = options.url;
        const headers = options.headers || {};

        let res;
        try {
            res = await fetch(new Request(url, {
                method: 'GET',
                headers: new Headers(headers),
                mode: 'cors',
                cache: 'default'
            }));
        } catch (e) {
            throw new FragmentResolverError(options, e);
        }

        return await this.handleResponse(res, options);
    }

    private async handleResponse(res: Response, options: FragmentOptions) {
        if (res.status > 299) {
            return Promise.reject(
                new FragmentResolverError(options, res)
            )
        }

        const html = await res.text();
        const eventDependencies = res.headers.get('X-Event-Dependency') || '';

        return {
            html,
            dependencies: FragmentFetch.parseDependencies(eventDependencies)
        };
    }

}
