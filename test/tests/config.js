describe('Configuration settings', function () {
	describe('hideSelected', function () {
		it_n('option should still be shown when selected', function (done) {
			const test = setup_test('AB_Multi', {
				hideSelected: false,
				closeAfterSelect: true,
			});

			click(test.instance.control, function () {
				let options =
					test.instance.dropdown.querySelectorAll('.option');
				expect(options.length).to.be.equal(3);
				expect(test.instance.items.length).to.be.equal(0);

				const option_a =
					test.instance.dropdown_content.querySelector(
						'[data-value="a"]'
					);

				click(option_a, function () {
					options =
						test.instance.dropdown.querySelectorAll('.option');
					expect(options.length).to.be.equal(3);
					expect(test.instance.items.length).to.be.equal(1);

					assert.isFalse(
						test.instance.isOpen,
						'should be closed after selected'
					);
					assert.equal(
						option_a,
						test.instance.activeOption,
						'active option should be set after closing'
					);

					done();
				});
			});
		});

		it_n('option should not be shown when selected', function (done) {
			const test = setup_test('<input>', {
				hideSelected: true,
				options: [{ value: 'a' }, { value: 'b' }, { value: 'c' }],
			});

			click(test.instance.control, function () {
				let options =
					test.instance.dropdown.querySelectorAll('.option');
				expect(options.length).to.be.equal(3);
				expect(test.instance.items.length).to.be.equal(0);

				click(
					test.instance.dropdown_content.querySelector(
						'[data-value="a"]'
					),
					function () {
						options =
							test.instance.dropdown.querySelectorAll('.option');
						expect(options.length).to.be.equal(2);
						expect(test.instance.items.length).to.be.equal(1);

						done();
					}
				);
			});
		});

		it_n(
			'should allow duplicate options when hideSelected=false and duplicates=true',
			function (done) {
				const test = setup_test('AB_Multi', {
					hideSelected: false,
					duplicates: true,
				});

				click(test.instance.control, function () {
					let options =
						test.instance.dropdown.querySelectorAll('.option');
					expect(options.length).to.be.equal(3);
					expect(test.instance.items.length).to.be.equal(0);

					click(
						test.instance.dropdown_content.querySelector(
							'[data-value="a"]'
						),
						function () {
							click(
								test.instance.dropdown_content.querySelector(
									'[data-value="a"]'
								),
								function () {
									options =
										test.instance.dropdown.querySelectorAll(
											'.option'
										);
									expect(options.length).to.be.equal(3);
									expect(
										test.instance.items.length
									).to.be.equal(2);

									done();
								}
							);
						}
					);
				});
			}
		);
	});

	describe('copyClassesToDropdown', function () {
		it_n('class should be copied', function () {
			const test = setup_test('<input class="classA classB">', {
				copyClassesToDropdown: true,
			});
			// eslint-disable-next-line no-unused-expressions
			expect(test.instance.dropdown.classList.contains('classA')).to.be
				.true;
		});

		it_n('class should not be copied', function () {
			const test = setup_test('<input class="classA classB">', {
				copyClassesToDropdown: false,
			});
			// eslint-disable-next-line no-unused-expressions
			expect(test.instance.dropdown.classList.contains('classA')).to.be
				.false;
		});
	});

	describe('onInitialize', function () {
		it_n('onInitialize should be called', function (done) {
			setup_test('<input>', {
				onInitialize() {
					// eslint-disable-next-line no-unused-expressions
					expect(true).to.be.true;
					done();
				},
			});
		});
	});

	it_n('allowEmptyOption', async () => {
		const test = setup_test(
			`<select multiple>
				<option value="">None</option>
				<option value="4">Thomas Edison</option>
				<option value="1">Nikola</option>
			</select>`,
			{ allowEmptyOption: true }
		);

		assert.equal(Object.keys(test.instance.options).length, 3);
		assert.equal(test.instance.items.length, 0);

		await asyncClick(test.instance.control);
		assert.isTrue(test.instance.isOpen);
		const opt = test.instance.getOption('');
		await asyncClick(opt);
		assert.equal(test.instance.items.length, 1);
	});
});
