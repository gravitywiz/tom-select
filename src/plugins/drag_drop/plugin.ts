/// <reference types="jquery" />

/**
 * Plugin: "drag_drop" (Tom Select)
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

// @ts-ignore
const $ = window.jQuery;

interface JQuerySortableUIArg {
	helper: JQuery;
	item: JQuery;
	offst: { top: number; left: number };
	position: { top: number; left: number };
	originalPosition: { top: number; left: number };
	sender: JQuery;
	placeholder: JQuery;
}

export default function (this: TomSelect) {
	const self = this;
	if (!$.fn.sortable) {
		throw new Error(
			'The "drag_drop" plugin requires jQuery UI "sortable".'
		);
	}
	if (self.settings.mode !== 'multi') {
		return;
	}

	const orig_lock = self.lock;
	const orig_unlock = self.unlock;

	self.hook('instead', 'lock', () => {
		const sortable = $(self.control).data('sortable');
		if (sortable) {
			sortable.disable();
		}
		return orig_lock.call(self);
	});

	self.hook('instead', 'unlock', () => {
		const sortable = $(self.control).data('sortable');
		if (sortable) {
			sortable.enable();
		}
		return orig_unlock.call(self);
	});

	self.on('initialize', () => {
		const $control = $(self.control).sortable({
			items: '[data-value]',
			forcePlaceholderSize: true,
			disabled: self.isLocked,
			start: (e: JQuery.Event, ui: JQuerySortableUIArg) => {
				ui.placeholder.css('width', ui.helper.css('width'));
				$control.css({ overflow: 'visible' });
			},
			stop: () => {
				$control.css({ overflow: 'hidden' });

				const values: string[] = [];
				$control.children('[data-value]').each(function (
					this: HTMLElement
				) {
					if (this.dataset.value) {
						values.push(this.dataset.value);
					}
				});

				self.setValue(values);
			},
		});
	});
}
