/**
 * Plugin: "restore_on_backspace" (Tom Select)
 * Copyright (c) contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this
 * file except in compliance with the License. You may obtain a copy of the License at:
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF
 * ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 *
 */

import TomSelect from '../../tom-select';
import { TomOption } from '../../types/index';
import { addClasses } from '../../vanilla';

export default function (this: TomSelect) {
	const self = this;
	const orig_canLoad = self.canLoad;
	const orig_clearActiveOption = self.clearActiveOption;
	const orig_loadCallback = self.loadCallback;

	let pagination: { [key: string]: any } = {};
	let dropdown_content: HTMLElement;
	let loading_more = false;
	let load_more_opt: HTMLElement;
	let default_values: string[] = [];

	if (!self.settings.shouldLoadMore) {
		// return true if additional results should be loaded
		self.settings.shouldLoadMore = (): boolean => {
			const scroll_percent =
				dropdown_content.clientHeight /
				(dropdown_content.scrollHeight - dropdown_content.scrollTop);
			if (scroll_percent > 0.9) {
				return true;
			}

			if (self.activeOption) {
				const selectable = self.selectable();
				const index = Array.from(selectable).indexOf(self.activeOption);
				if (index >= selectable.length - 2) {
					return true;
				}
			}

			return false;
		};
	}

	if (!self.settings.firstUrl) {
		throw 'virtual_scroll plugin requires a firstUrl() method';
	}

	// in order for virtual scrolling to work,
	// options need to be ordered the same way they're returned from the remote data source
	self.settings.sortField = [{ field: '$order' }, { field: '$score' }];

	// can we load more results for given query?
	const canLoadMore = (query: string): boolean => {
		if (
			typeof self.settings.maxOptions === 'number' &&
			dropdown_content.children.length >= self.settings.maxOptions
		) {
			return false;
		}

		if (query in pagination && pagination[query]) {
			return true;
		}

		return false;
	};

	const clearFilter = (option: TomOption, value: string): boolean => {
		if (
			self.items.indexOf(value) >= 0 ||
			default_values.indexOf(value) >= 0
		) {
			return true;
		}
		return false;
	};

	// set the next url that will be
	self.setNextUrl = (value: string, next_url: any): void => {
		pagination[value] = next_url;
	};

	// getUrl() to be used in settings.load()
	self.getUrl = (query: string): any => {
		if (query in pagination) {
			const next_url = pagination[query];
			pagination[query] = false;
			return next_url;
		}

		// if the user goes back to a previous query
		// we need to load the first page again
		pagination = {};

		return self.settings.firstUrl.call(self, query);
	};

	// don't clear the active option (and cause unwanted dropdown scroll)
	// while loading more results
	self.hook('instead', 'clearActiveOption', () => {
		if (loading_more) {
			return;
		}

		return orig_clearActiveOption.call(self);
	});

	// override the canLoad method
	self.hook('instead', 'canLoad', (query: string) => {
		// first time the query has been seen
		if (!(query in pagination)) {
			return orig_canLoad.call(self, query);
		}

		return canLoadMore(query);
	});

	// wrap the load
	self.hook(
		'instead',
		'loadCallback',
		(options: TomOption[], optgroups: TomOption[]) => {
			if (!loading_more) {
				self.clearOptions(clearFilter);
			} else if (load_more_opt) {
				const first_option = options[0];
				if (first_option !== undefined) {
					load_more_opt.dataset.value =
						first_option[self.settings.valueField];
				}
			}

			orig_loadCallback.call(self, options, optgroups);

			loading_more = false;
		}
	);

	// add templates to dropdown
	//	loading_more if we have another url in the queue
	//	no_more_results if we don't have another url in the queue
	self.hook('after', 'refreshOptions', () => {
		const query = self.lastValue;
		let option;

		if (canLoadMore(query)) {
			option = self.render('loading_more', { query });
			if (option) {
				option.setAttribute('data-selectable', ''); // so that navigating dropdown with [down] keypresses can navigate to this node
				load_more_opt = option;
			}
		} else if (
			query in pagination &&
			!dropdown_content.querySelector('.no-results')
		) {
			option = self.render('no_more_results', { query });
		}

		if (option) {
			addClasses(option, self.settings.optionClass);
			dropdown_content.append(option);
		}
	});

	// add scroll listener and default templates
	self.on('initialize', () => {
		default_values = Object.keys(self.options);
		dropdown_content = self.dropdown_content;

		// default templates
		self.settings.render = Object.assign(
			{},
			{
				loading_more: () => {
					return `<div class="loading-more-results">Loading more results ... </div>`;
				},
				no_more_results: () => {
					return `<div class="no-more-results">No more results</div>`;
				},
			},
			self.settings.render
		);

		// watch dropdown content scroll position
		dropdown_content.addEventListener('scroll', () => {
			if (!self.settings.shouldLoadMore.call(self)) {
				return;
			}

			// !important: this will get checked again in load() but we still need to check here otherwise loading_more will be set to true
			if (!canLoadMore(self.lastValue)) {
				return;
			}

			// don't call load() too much
			if (loading_more) {
				return;
			}

			// Save scroll position.
			const scrollTop = dropdown_content.scrollTop;

			loading_more = true;
			self.load.call(self, self.lastValue);

			// We use a MutationObserver here to wait until new DOM nodes (i.e., additional results) are inserted into the dropdown before restoring the scroll position.
			// This helps avoid the jarring UX of the scroll jumping to the top or not reflecting the user's previous position when infinite scrolling is triggered.
			// The `+10` adjustment is a small buffer to simulate a smooth transition and prevent a perceived "stickiness" at the bottom of the scroll area.
			// Note: If performance issues arise in the future, we would need to revisit.
			// Disconnecting the observer immediately after restoring scroll ensures minimal overhead.
			const observer = new MutationObserver(() => {
				dropdown_content.scrollTop = scrollTop + 10;
				observer.disconnect();
			});

			observer.observe(dropdown_content, { childList: true, subtree: true });
		});
	});
}
