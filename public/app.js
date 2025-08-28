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
                this._api("left");
            }
            else {
                this._api("right");
            }

        }
        else {

            if (0 < yDiff) {
                this._api("top");
            }
            else {
                this._api("down");
            }

        }

        /* reset values */
        this._xDown = null;
        this._yDown = null;

    }

    _api (direction) {

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

        return this;

    }

}

new Swipper().init();
