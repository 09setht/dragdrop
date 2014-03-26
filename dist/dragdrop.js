/**
 * Created by tolles on 3/25/14.
 */

!function (window) {
	if (typeof module !== 'undefined' && module.exports) {
		module.exports = DragDrop;
	}
	else if (window) {
		window.DragDrop = new DragDrop(window);
		var e = new Event('myEvent');
		window.document.addEventListener('myEvent', handleEvent);
		window.document.dispatchEvent(e);
	}

	function handleEvent(event) {
		args = arguments;
		this.last = this.last || {};
		var last = this.last[event.type] || {};
//        if (last.offsetX !== event.offsetX || last.offsetY !== event.offsetY)
		console.log(event.type);
		this.last[event.type] = event;
	}

	function turnRed(ev) {
		ev.target.style.color = 'red';
	}

	function turnBlack(ev) {
		ev.target.style.color = 'black';
	}

	function DragDrop(window) {
		var self = this;

		self._blank;
		self._item;

		self._getBlank = function () {
			if (!self._blank) {
				self._blank = self._item.cloneNode(true);
				self._blank.style.opacity = 0;
			}
			return self._blank;
		};

		self._dragStart = function (event) {
			console.log('start');
			self._item = event.target;
			var parent = self._item.parentElement;
			setTimeout(function () {
				parent.insertBefore(self._getBlank(), self._item);
//            self._item.style.visibility = 'hidden';
				self._item.style.display = 'none';
			});
			event.target = self._item;
		};

		self._dragEnd = function (event) {
			console.log('end');
			setTimeout(function () {
				self.getBlank().remove();
//            self._item.style.visibility = null;
				self._item.style.display = null;
				self._item = {};
			});
		};

		self._dragOver = function (event) {
			var dataDrop = event.target.dataset.drop;

			dataDrop = dataDrop || (event.target.parentElement && event.target.parentElement.dataset.drop);

			if (dataDrop) {
				dataDrop = self.parseOptions(dataDrop);
				var canDrop = !dataDrop.accepts || self._item.className.indexOf(dataDrop.accepts) !== -1;

				if (canDrop) {
					event.preventDefault();
				}
			}
		};

		this._dragEnter = function (event) {
			var dropData, isSibling, parent;
			if (dropData = event.target.dataset.drop) {
				isSibling = false
				parent = event.target;
			}
			else if (dropData =
				(event.target.parentElement
					&& event.target.parentElement.dataset.drop)) {
				isSibling = true;
				parent = event.target.parentElement;
			}
			else {
				return event.preventDefault();
			}

			if (!isSibling) {
				setTimeout(function () {
					parent.appendChild(self._getBlank());
				});
			}
			else {
				var sibling = event.target;
				setTimeout(function () {
					parent.insertBefore(self._getBlank(), sibling);
				});
			}
		};

		self._dragLeave = function (event) {

		};

		this._drop = function (event) {
			var dropData, isSibling, parent;
			if (dropData = event.target.dataset.drop) {
				isSibling = false
				parent = event.target;
			}
			else if (dropData =
				(event.target.parentElement
					&& event.target.parentElement.dataset.drop)) {
				isSibling = true;
				parent = event.target.parentElement;
			}
			else {
				return;
			}

			var dropData = self.parseOptions(dropData);
			dropData = dropData && dropData.data;
			var dragData = self._item.dataset.drag && self.parseOptions(self._item.dataset.drag);
			dragData = dragData && dragData.data;

			if (!isSibling) {
				parent = event.target;
				setTimeout(function () {
					parent.appendChild(self._item);
					self.sendEvent(event,{drop:dropData,drag:dragData});
				});
			}
			else {
				parent = event.target.parentElement;
				var sibling = event.target;
				setTimeout(function () {
					parent.insertBefore(self._item, sibling);
					self.sendEvent(event,{drop:dropData,drag:dragData});
				});
			}
			event.preventDefault();
		};

		self.sendEvent = function (name, event) {

		};

		function setListeners(window) {
			window.document.ondragstart = self._dragStart;
			window.document.ondragend = self._dragEnd;
			window.document.ondragover = self._dragOver;
			//	window.document.addEventListener('dragover',handleEvent);
			window.document.ondragenter = self._dragEnter;
			window.document.ondrop = self._drop;
		}

		setListeners(window);
	}

	DragDrop.prototype.parseOptions = function (opts) {
		return Function('return {' + opts + '}')();
	};
}(typeof window !== 'undefined' && window);