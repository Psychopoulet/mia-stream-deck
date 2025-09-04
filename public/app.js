class Swipper {

    constructor () {

        this._xDown = null;
        this._yDown = null;

    }

    _getTouches (evt) {

        return evt.touches ||             // browser API
                evt.originalEvent.touches; // jQuery

    }

    _handleTouchStart (evt) {

        const firstTouch = this._getTouches(evt)[0];

        this._xDown = firstTouch.clientX;
        this._yDown = firstTouch.clientY;

    }

    _handleTouchMove (evt) {

        if (!this._xDown || !this._yDown) {
            return;
        }

        const xDiff = this._xDown - evt.touches[0].clientX;
        const yDiff = this._yDown - evt.touches[0].clientY;

        if (Math.abs(xDiff) > Math.abs(yDiff)) { /*most significant*/

            if (0 < xDiff) {
                this._swipe("left");
            }
            else {
                this._swipe("right");
            }

        }
        else {

            if (0 < yDiff) {
                this._swipe("top");
            }
            else {
                this._swipe("down");
            }

        }

        /* reset values */
        this._xDown = null;
        this._yDown = null;

    }

    _swipe (direction) {

        fetch("/{{plugin.name}}/api/swipe/" + direction, {
            "method": "put"
        }).catch((err) => {

            console.error(err);

            alert(err.message);

        });

    }

    init () {

        document.addEventListener("touchstart", this._handleTouchStart.bind(this), false);
        document.addEventListener("touchmove", this._handleTouchMove.bind(this), false);

        fetch("/{{plugin.name}}/api/table", {
            "method": "get"
        }).then((res) => {

            if (res.ok) {
                return res.json();
            }
            else {
                return Promise.reject(new Error("Problem with request getTable has status '" + res.status + "' (" + res.statusText + ")"));
            }

        }).then((lines) => {

            console.log(lines);

            const elementTable = document.getElementById("table");

            lines.forEach((line) => {

                const elementLine = document.createElement("tr");

                    line.forEach((row) => {

                        const elementRow = document.createElement("td");

                            if ("empty" !== row.action.type) {

                                if (row.icon) {
                                    elementRow.classList = row.icon;
                                }

                                elementRow.innerText = JSON.stringify(row);

                            }

                        elementLine.appendChild(elementRow);

                    });

                elementTable.appendChild(elementLine);

            });

        }).catch((err) => {

            console.error(err);

            alert(err.message);

        });

        return this;

    }

}

new Swipper().init();
