describe('plugin: remove_button', function () {
	it_n('should remove item when remove button is clicked', function (done) {
		const test = setup_test('AB_Multi', { plugins: ['remove_button'] });

		test.instance.addItem('a');
		test.instance.addItem('b');
		assert.equal(test.instance.items.length, 2);

		const itema = test.instance.getItem('b');
		const remove_button = itema.querySelector('.remove');

		syn.click(remove_button, function () {
			assert.equal(test.instance.items.length, 1);
			assert.equal(test.instance.items[0], 'a');
			done();
		});
	});

	it_n('option should reappear in dropdown when removed', function (done) {
		const test = setup_test('AB_Multi', { plugins: ['remove_button'] });

		test.instance.addItem('a');
		test.instance.addItem('b');
		assert.equal(test.instance.items.length, 2);

		syn.click(test.instance.control_input, function () {
			assert.equal(
				test.instance.dropdown_content.querySelectorAll('.option')
					.length,
				1
			);

			const itema = test.instance.getItem('b');
			const remove_button = itema.querySelector('.remove');

			syn.click(remove_button, function () {
				assert.equal(
					test.instance.dropdown_content.querySelectorAll('.option')
						.length,
					2
				);
				done();
			});
		});
	});

	it_n(
		'rendering item a second time should not add a remove button a second time',
		function () {
			const test = setup_test('AB_Multi', { plugins: ['remove_button'] });

			let item = test.instance.render('item', test.instance.options.a);
			item = test.instance.render('item', test.instance.options.a);

			assert.equal(item.querySelectorAll('.remove').length, 1);
		}
	);

	it_n('should not remove item if locked', function (done) {
		const test = setup_test('AB_Multi', { plugins: ['remove_button'] });

		test.instance.addItem('a');
		test.instance.addItem('b');
		test.instance.lock();
		assert.equal(test.instance.items.length, 2);

		const itema = test.instance.getItem('b');
		const remove_button = itema.querySelector('.remove');

		syn.click(remove_button, function () {
			assert.equal(test.instance.items.length, 2);
			done();
		});
	});

	it_n('remove_button options', function (done) {
		const config = {
			plugins: {
				remove_button: {
					className: 'customclass',
				},
			},
		};

		const test = setup_test(
			'<select><option selected value="a">a</option><option>b</option></select>',
			config
		);
		const itema = test.instance.getItem('a');
		const remove_button = itema.querySelector('.customclass');

		assert.equal(test.instance.items.length, 1);

		syn.click(remove_button, function () {
			assert.equal(test.instance.items.length, 0);
			done();
		});
	});

	it_n('should not remove item when onDelete returns false', async () => {
		const test = setup_test('AB_Multi', {
			plugins: ['remove_button'],
			onDelete: () => false,
		});

		test.instance.addItem('a');
		test.instance.addItem('b');
		test.instance.lock();
		assert.equal(test.instance.items.length, 2);

		const itema = test.instance.getItem('b');
		const remove_button = itema.querySelector('.remove');

		await asyncClick(remove_button);
		await waitFor(100);
		assert.equal(test.instance.items.length, 2);
	});
});
