/**
 * Plugin: "remove_button" (Tom Select)
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
import { getDom } from '../../vanilla';
import { escape_html, preventDefault, addEvent } from '../../utils';
import { TomOption, TomItem } from '../../types/index';
import { RBOptions } from './types';

export default function (this: TomSelect, userOptions: RBOptions) {
	const options = Object.assign(
		{
			label: '&times;',
			title: 'Remove',
			className: 'remove',
			append: true,
			tabindex: '0',
		},
		userOptions
	);

	//options.className = 'remove-single';
	const self = this;

	// override the render method to add remove button to each item
	if (!options.append) {
		return;
	}

	const html =
		'<a href="javascript:void(0)" class="' +
		options.className +
		'" tabindex="' +
		(options.tabindex !== undefined ? options.tabindex : '-1') +  // Use custom tabindex or default to -1.
		'" title="' +
		escape_html(options.title) +
		'">' +
		options.label +
		'</a>';

	self.hook('after', 'setupTemplates', () => {
		const orig_render_item = self.settings.render.item;

		self.settings.render.item = (
			data: TomOption,
			escape: typeof escape_html
		) => {
			const item = getDom(
				orig_render_item.call(self, data, escape)
			) as TomItem;

			const close_button = getDom(html);
			item.appendChild(close_button);

			addEvent(close_button, 'mousedown', (evt) => {
				preventDefault(evt, true);
			});

			addEvent(close_button, 'click', (evt) => {
				// propagating will trigger the dropdown to show for single mode
				preventDefault(evt, true);

				if (self.isLocked) {
					return;
				}
				if (!self.shouldDelete([item], evt as MouseEvent)) {
					return;
				}

				self.removeItem(item);
				self.refreshOptions(false);
				self.inputState();
			});

			return item;
		};
	});
}
