//var suite = global.suite;
//var test = global.test;
//var setup = global.setup;
//var teardown = global.teardown;
var assert = typeof require !== 'undefined'
	&& require('chai').assert || chai.assert;
//var sinon = require('sinon');
var dragdrop = typeof require !== 'undefined'
	&& require('../dragdrop') || window.DragDrop;

suite('dragdrop', function() {
	var testDiv = document.getElementById('test');
	var validDrop, invalidDrop, item, sibling;
	dragdrop.sendEvent = sinon.spy();

	setup(function() {
		validDrop = document.createElement('div');
		validDrop.setAttribute('id', 'validDrop');
		validDrop.dataset.drop = 'data: true';

		testDiv.appendChild(validDrop);
		invalidDrop = document.createElement('div');
		validDrop.setAttribute('id', 'validDrop');
		testDiv.appendChild(invalidDrop);

		item = document.createElement('div');
		item.setAttribute('id', 'item');
//		validDrop.appendChild(item);
		dragdrop._item = item;

		sibling = document.createElement('div');
		sibling.setAttribute('id', 'sibling');
		validDrop.appendChild(sibling);

		dragdrop.sendEvent.reset();
	});

	teardown(function() {
		testDiv.innerHTML = '';
	});

	suite('event handlers', function() {
		suite('dragStart', function() {
			setup(function() {
				dragdrop._item = null;
				validDrop.appendChild(item);
			});

			test('sets _item to dragged item', function(done) {
				var e = new Event('dragstart', {bubbles: true});
				item.dispatchEvent(e);
				assert.equal(dragdrop._item, item);
				setTimeout(done);
			});
			test('places blank before dragged item', function(done) {
				var e = new Event('dragstart', {bubbles: true});
				item.dispatchEvent(e);
				setTimeout(function() {
					assert.equal(dragdrop._blank, item.previousSibling);
					done()
				});
			});
			test('sets display of dragged item to \'none\'', function(done) {
				var e = new Event('dragstart', {bubbles: true});
				item.dispatchEvent(e);
				setTimeout(function() {
					assert.equal(item.style.display, 'none');
					done();
				});
			});
		});
		suite('dragOver', function() {
			test('does not allow drop on elements without data-drop', function() {
				var e = new Event('dragover', {bubbles: true});
				var pd = sinon.stub(e, 'preventDefault');
				invalidDrop.dispatchEvent(e);
				sinon.assert.notCalled(pd);
			});
			test('does allow drop on elements with data-drop', function() {
				var e = new Event('dragover', {bubbles: true});
				var pd = sinon.stub(e, 'preventDefault');
				validDrop.dispatchEvent(e);
				sinon.assert.calledOnce(pd);
			});
			test('does allow drop on elements whose parent has data-drop', function() {
				var e = new Event('dragover', {bubbles: true});
				var pd = sinon.stub(e, 'preventDefault');
				sibling.dispatchEvent(e);
				sinon.assert.calledOnce(pd);
			});
		});
		suite('dragEnter', function() {
			test('inserts blank above if sibling', function(done) {
				var e = new Event('dragenter', {bubbles: true});
				sibling.dispatchEvent(e);
				setTimeout(function() {
					assert.equal(sibling.previousSibling, dragdrop._blank);
					done();
				});
			});
			test('appends blank if parent', function(done) {
				var e = new Event('dragenter', {bubbles: true});
				validDrop.dispatchEvent(e);
				setTimeout(function() {
					assert.equal(validDrop.lastChild, dragdrop._blank);
					done();
				});
			});
		});
		suite('dragEnd', function() {
			setup(function(done) {
				validDrop.insertBefore(item, sibling);
				setTimeout(function() {
					var e = new Event('dragstart', {bubbles: true});
					item.dispatchEvent(e);
					setTimeout(done);
				});
			});

			test('removes blank', function(done) {
				assert.isNotNull(item.previousSibling);
				var e = new Event('dragend', {bubbles: true});
				item.dispatchEvent(e);
				setTimeout(function() {
					assert.isNull(item.previousSibling);
					done();
				});
			});
			test('clears display property of dragged item', function(done) {
				var e = new Event('dragend', {bubbles: true});
				item.dispatchEvent(e);
				setTimeout(function() {
					assert.notOk(item.style.display);
					done();
				});
			});
			test('sets _item to null', function(done) {
				var e = new Event('dragend', {bubbles: true});
				item.dispatchEvent(e);
				setTimeout(function() {
					assert.isNull(dragdrop._item);
					done();
				});
			});
			test('sets _blank to null', function(done) {
				validDrop.insertBefore(item, sibling);
				setTimeout(function() {
					var e = new Event('dragstart', {bubbles: true});
					item.dispatchEvent(e);
					setTimeout(function() {
						assert.isNotNull(dragdrop._blank);
						var e = new Event('dragend', {bubbles: true});
						item.dispatchEvent(e);
						setTimeout(function() {
							assert.isNull(dragdrop._blank);
							done();
						});
					});
				});
			});
		});
		suite('drop', function() {
			test('inserts item above if sibling', function(done) {
				var e = new Event('drop', {bubbles: true});
				sibling.dispatchEvent(e);
				setTimeout(function() {
					assert.equal(sibling.previousSibling, item);
					done();
				});
			});
			test('appends item to children if parent', function(done) {
				var e = new Event('drop', {bubbles: true});
				validDrop.dispatchEvent(e);
				setTimeout(function() {
					assert.equal(validDrop.lastChild, item);
					done();
				});
			});
		});
	});
	suite('data-drop', function() {

		suite('accepts', function() {
			test('dragOver does not allow drop on non match', function() {
				invalidDrop.dataset.drop = "accepts: 'valid'";
				var e = new Event('dragover', {bubbles: true});
				var pd = sinon.stub(e, 'preventDefault');
				invalidDrop.dispatchEvent(e);
				sinon.assert.notCalled(pd);
			});
			test('does allow drop on match', function() {
				validDrop.dataset.drop = "accepts: 'valid'";
				item.classList.add('valid');
				var e = new Event('dragover', {bubbles: true});
				var pd = sinon.stub(e, 'preventDefault');
				validDrop.dispatchEvent(e);
				sinon.assert.calledOnce(pd);
			});
		});
		suite('data', function() {
			test('is sent with sendEvent', function(done) {
				var e = new Event('drop', {bubbles: true});
				validDrop.dataset.drop = 'data:{myData:true}';
				validDrop.dispatchEvent(e);

				setTimeout(function() {
					var data = dragdrop.sendEvent.args[0][1];
					assert.deepEqual(data.drop, dragdrop.parseOptions(validDrop.dataset.drop).data);
					done();
				});
			});
		});
	});
	suite('sendEvent', function() {
		test('is called on drop', function(done) {
			var e = new Event('drop', {bubbles: true});
			validDrop.dispatchEvent(e);

			setTimeout(function() {
				sinon.assert.calledOnce(dragdrop.sendEvent);
				done();
			});
		});
		test('sends event', function(done) {
			var e = new Event('drop', {bubbles: true});
			validDrop.dispatchEvent(e);

			setTimeout(function() {
				var event = dragdrop.sendEvent.args[0][0];
				assert.equal(event, e);
				done();
			});
		});
		suite('sends index in eventData', function() {
			setup(function(done) {
				validDrop.insertBefore(item, sibling);
				setTimeout(function(){
					var e = new Event('dragstart', {bubbles: true});
					item.dispatchEvent(e);
					setTimeout(done);
				})
			});

			test('sends index 0 when dropped on first child', function(done) {
				var e = new Event('drop', {bubbles: true});
				item.dispatchEvent(e);
				setTimeout(function() {
					var index = dragdrop.sendEvent.args[0][1].index;
					assert.equal(index, 0);
					done();
				});
			});
			test('sends index 0 when dropped on blank', function(done) {
				var e = new Event('drop', {bubbles: true});
				dragdrop._blank.dispatchEvent(e);
				setTimeout(function() {
					var index = dragdrop.sendEvent.args[0][1].index;
					assert.equal(index, 0);
					done();
				});
			});
			test('sends index 1 when dropped on parent', function(done) {
				var e = new Event('drop', {bubbles: true});
				validDrop.dispatchEvent(e);
				setTimeout(function() {
					var index = dragdrop.sendEvent.args[0][1].index;
					assert.equal(index, 0);
					done();
				});
			});
		});
	});
	suite('data-drag', function() {
		suite('handle', function() {
			test('not implemented');
		});
		suite('container', function() {
			test('not implemented');
		});
		suite('data', function() {
			test('is sent with sendEvent', function(done) {
				var e = new Event('drop', {bubbles: true});
				item.dataset.drag = 'data:{myData:true}';
				validDrop.dispatchEvent(e);

				setTimeout(function() {
					var data = dragdrop.sendEvent.args[0][1];
					assert.deepEqual(data.drag, dragdrop.parseOptions(item.dataset.drag).data);
					done();
				});
			});
		})
	});
});