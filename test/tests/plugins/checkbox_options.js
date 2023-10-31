describe('plugin: checkbox_options', function () {
	it_n('active items should be checked on load', function (done) {
		const test = setup_test('<input value="a,b">', {
			plugins: ['checkbox_options'],
		});

		click(test.instance.control, function () {
			const checked =
				test.instance.dropdown.querySelectorAll('input:checked');
			assert.equal(checked.length, 2);
			done();
		});
	});

	it_n('checkbox should be updated after option is clicked', function (done) {
		const test = setup_test('AB_Multi', { plugins: ['checkbox_options'] });
		click(test.instance.control_input, function () {
			const option = test.instance.getOption('a');
			const checkbox = option.querySelector('input');

			// check/active
			click(option, function () {
				assert.deepEqual(test.instance.items, ['a']);
				assert.equal(checkbox.checked, true, 'checkbox not checked');

				// uncheck
				click(option, function () {
					assert.deepEqual(test.instance.items, []);
					assert.equal(checkbox.checked, false, 'checkbox checked');
					done();
				});
			});
		});
	});

	it_n(
		'checkbox should be checked after checkbox is clicked',
		function (done) {
			const test = setup_test('AB_Multi', {
				plugins: ['checkbox_options'],
			});
			click(test.instance.control_input, function () {
				const option = test.instance.getOption('a');
				const checkbox = option.querySelector('input');

				// check/active
				click(checkbox, function () {
					assert.deepEqual(test.instance.items, ['a']);
					assert.equal(
						checkbox.checked,
						true,
						'checkbox not checked'
					);

					// uncheck
					click(checkbox, function () {
						assert.deepEqual(test.instance.items, []);
						assert.equal(
							checkbox.checked,
							false,
							'checkbox checked'
						);
						done();
					});
				});
			});
		}
	);

	it_n(
		'removing item before dropdown open should not check option',
		function (done) {
			const test = setup_test('<input value="a">', {
				plugins: ['checkbox_options'],
			});
			test.instance.removeItem('a');

			click(test.instance.control_input, function () {
				const option = test.instance.getOption('a');
				const checkbox = option.querySelector('input');
				assert.equal(checkbox.checked, false, 'checkbox checked');
				done();
			});
		}
	);

	it_n('adding item after dropdown open should check option', async () => {
		const test = setup_test('AB_Multi', { plugins: ['checkbox_options'] });

		await asyncClick(test.instance.control);

		const option = test.instance.getOption('a');
		const checkbox = option.querySelector('input');
		assert.equal(checkbox.checked, false, 'checkbox should not be checked');

		test.instance.addItem('a');

		await waitFor(100); // setTimeout in UpdateCheckbox

		//var option = test.instance.getOption('a');
		//var checkbox = option.querySelector('input');

		assert.equal(checkbox.checked, true, 'checkbox should be checked');
	});

	it_n('creating item should check option', async () => {
		const test = setup_test('AB_Multi', {
			create: true,
			plugins: ['checkbox_options'],
		});

		await asyncClick(test.instance.control);
		await asyncType('new-value');
		await asyncType('[enter]');

		await waitFor(100); // setTimeout in UpdateCheckbox

		const option = test.instance.getOption('new-value');
		const checkbox = option.querySelector('input');
		assert.equal(checkbox.checked, true, 'checkbox should be checked');
	});
});
