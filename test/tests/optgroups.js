describe('optgroups', function () {
	const options = [
		{ optgroup: 'mammal', value: 'dog' },
		{ optgroup: 'mammal', value: 'cat' },
		{ optgroup: 'bird', value: 'duck' },
		{ optgroup: 'bird', value: 'chicken' },
		{ optgroup: 'reptile', value: 'snake' },
		{ optgroup: 'reptile', value: 'lizard' },
	];

	const groups = [
		{ value: 'tetrapods', label: 'Tetrapods' },
		{ value: 'mammal', label: 'Mammal' },
		{ value: 'bird', label: 'Bird' },
		{ value: 'reptile', label: 'Reptile' },
	];

	const clone = (a) => JSON.parse(JSON.stringify(a));

	it_n('init', function () {
		const test = setup_test('<input>', {
			labelField: 'value',
			searchField: ['value'],
			options: clone(options),
			optgroups: clone(groups),
		});

		assert.equal(Object.keys(test.instance.options).length, 6);
		assert.equal(Object.keys(test.instance.optgroups).length, 4);
	});

	it_n('load optgroups', function (done) {
		const test = setup_test('<input>', {
			labelField: 'value',
			searchField: ['value'],
			preload: true,
			load(query, loadcb) {
				loadcb(clone(options), groups);

				assert.equal(Object.keys(test.instance.options).length, 6);
				assert.equal(Object.keys(test.instance.optgroups).length, 4);
				done();
			},
		});
	});

	it_n('duplicates & mode=single', async function () {
		const test = setup_test('<select>', {
			labelField: 'value',
			searchField: ['value'],
			options: clone(options),
			optgroups: clone(groups),
			duplicates: true,
			items: ['dog'],
			lockOptgroupOrder: true,
			closeAfterSelect: true,
		});

		async function TestGroupValue(group, value) {
			assert.isTrue(test.instance.isOpen, 'should be open to start');
			// eslint-disable-next-line no-shadow
			const clone = test.instance.dropdown_content
				.querySelector(`[data-group="${group}"]`)
				.querySelector(`[data-value="${value}"]`);
			await asyncClick(clone);

			assert.isFalse(
				test.instance.isOpen,
				'should be closed after select'
			);
			await asyncClick(test.instance.control);

			assert.isTrue(test.instance.isOpen, 'should be open after click');
			assert.equal(test.instance.activeOption.dataset.value, value);
			assert.isOk(
				test.instance.activeOption.closest(`[data-group="${group}"]`),
				`activeOption should be in ${group} group`
			);
		}

		await asyncClick(test.instance.control);

		assert.equal(Object.keys(test.instance.options).length, 6);
		assert.equal(Object.keys(test.instance.optgroups).length, 4);
		assert.equal(
			test.instance.dropdown_content.querySelectorAll('.option').length,
			6
		);
		assert.equal(
			test.instance.dropdown_content
				.querySelector('[data-group="mammal"]')
				.querySelectorAll('.active').length,
			1,
			'active option should be in mammal group'
		);

		test.instance.options.dog.optgroup = ['mammal', 'tetrapods'];
		test.instance.refreshOptions(false);

		assert.equal(Object.keys(test.instance.options).length, 6);
		assert.equal(
			test.instance.dropdown_content.querySelectorAll('.option').length,
			7
		);
		assert.equal(
			test.instance.dropdown_content
				.querySelector('[data-group="mammal"]')
				.querySelectorAll('.active').length,
			1,
			'active option should still be in mammal group'
		);

		test.instance.options.cat.optgroup = ['mammal', 'tetrapods'];
		test.instance.refreshOptions(false);

		// clicking on duplicates: dog
		await TestGroupValue('mammal', 'dog');
		await TestGroupValue('tetrapods', 'dog');

		await TestGroupValue('mammal', 'cat');
		await TestGroupValue('tetrapods', 'cat');
	});

	it_n('searching', async function () {
		// eslint-disable-next-line no-shadow
		const options = [
			{ optgroup: 'bird', value: 'chicken' },
			{ optgroup: 'mammal', value: 'cat' },
		];

		// eslint-disable-next-line no-shadow
		const groups = [
			{ value: 'bird', label: 'Bird' },
			{ value: 'mammal', label: 'Mammal' },
		];

		const test = setup_test('<select multiple>', {
			labelField: 'value',
			searchField: ['value'],
			options,
			optgroups: groups,
			duplicates: true,
			items: [],
			closeAfterSelect: false,
		});

		await asyncClick(test.instance.control);
		assert.isTrue(test.instance.isOpen, 'should be open to start');
		assert.equal(test.instance.activeOption.dataset.value, 'chicken');

		await asyncType('c');
		assert.equal(test.instance.activeOption.dataset.value, 'cat');
	});
});
