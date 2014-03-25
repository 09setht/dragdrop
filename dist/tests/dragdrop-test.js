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
		validDrop.dataset.drop = 'data: true';

		testDiv.appendChild(validDrop);
		invalidDrop = document.createElement('div');
		testDiv.appendChild(invalidDrop);

		item = document.createElement('div');
		validDrop.appendChild(item);
		dragdrop._item = item;

		sibling = document.createElement('div');
		validDrop.appendChild(sibling);

		dragdrop.sendEvent.reset();
	});

	teardown(function() {
		testDiv.innerHTML = '';
	});

	suite('event handlers', function() {
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
		suite('sendEvent', function() {
			test('is called on drop', function(done) {
				var e = new Event('drop', {bubbles: true});
				validDrop.dispatchEvent(e);

				setTimeout(function() {
					sinon.assert.calledOnce(dragdrop.sendEvent);
					done();
				});
			});
			test('sends ?');
		});
	});
	suite('data-drag', function() {
		suite('handle', function() {
			test('not stubbed');
		});
		suite('container', function() {
			test('not stubbed');
		});
	});
});