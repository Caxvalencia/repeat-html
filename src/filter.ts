import { patterns } from './patterns';

export class Filter {
    protected repeatAttributeName: string;

    constructor(repeatAttributeName: string) {
        this.repeatAttributeName = repeatAttributeName;
        this.findFilters();
    }

    private findFilters() {
        let queryFilters: NodeListOf<Element> = document.querySelectorAll(
            '[data-filter]'
        );

        let element: any;
        let queryRepeat: string;

        for (let i = 0; (element = queryFilters[i]); i++) {
            queryRepeat = element.dataset[this.repeatAttributeName].split(
                patterns.splitQuery
            );
            element.dataset.filter
                .split(patterns.splitQueryVars)
                .forEach(filter => {
                    this.filter(queryRepeat[1], filter, element);
                });
        }
    }

    /**
     * @param {any} variableName
     * @param {any} filterValue
     * @param {any} element
     * @returns
     */
    filter(variableName: string, filterValue: string, element: HTMLElement) {
        filterValue = filterValue.trim();

        if (this.validate(variableName, filterValue)) {
            return false;
        }

        let _filter = filterValue.split(patterns.filters.as);

        let prop = _filter[0];
        let selector = _filter[1];

        if (!selector) {
            selector = prop;
            prop = null;
        }

        let elem: any = document.getElementById(
            selector.replace(/#|^%|%$/g, '')
        );

        if (!elem) {
            return this;
        }

        let hasPercentInit = /^%/g.test(selector) ? '^' : '';
        let hasPercentEnd = /%$/g.test(selector) ? '$' : '';

        filterValue = elem.value; //para llamarlo una primera vez

        elem.addEventListener('keyup', event => {
            let value = event.target.value;

            this._scope[variableName].data = this._scope[
                variableName
            ].originalData.filter(data => {
                let pattern = new RegExp(
                    hasPercentInit + value + hasPercentEnd,
                    'gi'
                );

                if (prop) {
                    return pattern.test(data[prop]);
                }

                for (const _prop in data) {
                    if (pattern.test(data[_prop])) {
                        return true;
                    }
                }
            });

            this.refresh(variableName, element);
        });

        return this;
    }

    /**
     * @param variableName
     * @param filterValue
     */
    validate(variableName: string, filterValue: string): boolean {
        if (variableName === undefined) {
            return false;
        }

        if (
            !patterns.filters.as.test(filterValue) &&
            !patterns.hasSelectorCss.test(filterValue.replace(/^%|%$/g, ''))
        ) {
            return false;
        }
    }
}
