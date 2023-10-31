describe('plugin: clear_button', function () {
	it_n('should remove all item when button is clicked', function (done) {
		let on_change_calls = 0;
		const test = setup_test('AB_Multi', {
			plugins: ['clear_button'],
			onChange() {
				on_change_calls++;
			},
		});

		test.instance.addItem('a');
		test.instance.addItem('b');

		on_change_calls = 0;
		assert.equal(test.instance.items.length, 2);

		const button = test.instance.control.querySelector('.clear-button');

		syn.click(button, function () {
			assert.equal(
				test.instance.items.length,
				0,
				'should clear items array'
			);
			assert.equal(on_change_calls, 1, 'should only call onChange once');
			done();
		});
	});

	it_n('single with empty option', async () => {
		const test = setup_test(
			'<select required><option value="">empty</option><option value="a">a</option><option value="b">b</option><option value="c">c</option></select>',
			{
				allowEmptyOption: true,
				plugins: ['clear_button'],
			}
		);

		const button = test.instance.control.querySelector('.clear-button');

		// initialize with empty option
		const empty_item = test.instance.getItem('');
		assert.isNotOk(
			empty_item.querySelector('.remove'),
			'empty option should not have remove button'
		);
		assert.isFalse(test.instance.isValid, 'should start out as invalid');
		assert.equal(test.instance.items.length, 1);
		assert.equal(test.instance.items[0], '');

		// select "a"
		await asyncClick(test.instance.control);
		const option =
			test.instance.dropdown_content.querySelector('[data-value="a"]');
		await asyncClick(option);
		const itema = test.instance.getItem('a');
		assert.isOk(itema, 'should have item "a"');
		assert.equal(test.instance.items.length, 1);
		assert.equal(test.instance.items[0], ['a']);
		assert.isTrue(test.instance.isValid, 'should be valid');

		// remove item "a"
		await asyncClick(button);
		assert.equal(test.instance.items.length, 1);
		assert.equal(test.instance.items[0], '');
		assert.isFalse(test.instance.isValid, 'should not be valid');
	});

	it_n('should not clear if disabled', async () => {
		const test = setup_test(
			'<input type="text" value="neat,cool,wow" disabled>',
			{
				plugins: ['clear_button'],
			}
		);

		const button = test.instance.control.querySelector('.clear-button');

		await asyncClick(button);
		assert.equal(test.instance.items.length, 3);
	});
});
