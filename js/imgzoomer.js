Effect.MoveAndResizeTo = Class.create(Effect.Base, {
    initialize: function(element, toTop, toLeft, toWidth, toHeight) {

        this.element = $(element);
        this.toTop = toTop;
        this.toLeft = toLeft;
        this.toWidth = toWidth;
        this.toHeight = toHeight;

        this.originalTop = parseFloat(Element.getStyle(this.element,'top') || 0);
        this.originalLeft = parseFloat(Element.getStyle(this.element,'left') || 0);
        this.originalWidth = parseFloat(Element.getStyle(this.element,'width') || 0);
        this.originalHeight = parseFloat(Element.getStyle(this.element,'height') || 0);

        this.effectiveTop = this.toTop;

        this.effectiveLeft = this.toLeft;

        this.effectiveWidth = this.toWidth;

        this.effectiveHeight = this.toHeight;

        this.options = arguments[5] || {};

        if (this.effectiveWidth < 0) this.effectiveWidth = 0;
        if (this.effectiveHeight < 0) this.effectiveHeight = 0;

        if (this.originalTop == this.effectiveTop &&
            this.originalLeft == this.effectiveLeft &&
            this.originalWidth == this.effectiveWidth &&
            this.originalHeight == this.effectiveHeight) {

            // no need to start!
            return;
        }

        this.start(this.options);
    },

    update: function(position) {
        topd = this.effectiveTop * (position) + this.originalTop * (1 - position);
        leftd = this.effectiveLeft * (position) + this.originalLeft * (1 - position);
        widthd = this.effectiveWidth * (position) + this.originalWidth * (1 - position);
        heightd = this.effectiveHeight * (position) + this.originalHeight * (1 - position);

        this.setPosition(topd, leftd, widthd, heightd);
    },

    setPosition: function(topd, leftd, widthd, heightd) {
        this.element.style.top = topd+'px';
        this.element.style.left = leftd+'px';
        this.element.style.width = widthd+'px';
        this.element.style.height = heightd+'px';
    }
});

Array.prototype.index = function(val) {
    for (var i = 0, l = this.length; i < l; i++) {
        if (this[i] == val) return i;
    }

    return null;
};

Array.prototype.include = function(val) {
    return this.index(val) !== null;
};

var IMAGE_FORMATS = ["png", "jpg", "jpeg", "gif", "tif", "tiff", "bmp"];

// Shadows numbers
var SHADOW_TOP_LEFT = 1;
var SHADOW_TOP = 2;
var SHADOW_TOP_RIGHT = 3;
var SHADOW_LEFT = 4;
var SHADOW_RIGHT = 5;
var SHADOW_BOTTOM_LEFT = 6;
var SHADOW_BOTTOM = 7;
var SHADOW_BOTTOM_RIGHT = 8;

/*
Image Zoomer Class
------------------
Options available are:
offsetX - X position to display the zoomed image (centers if this is null)
offsetY - Y position to display the zoomed image (centers if this is null)
imagePaths - The path to the zoomer images (ie: shadows, loading spinner and closebox)
closeBox - The image to use as the close box
loadingSpinner - The image to use as the loading animation
duration - The speed the zoom occurs at
fadeDuration - The speed the shadows and widgets fade in and out
toggleDuration - The speed the window zooms when toggling directly to another image
shadows - Whether shadows should be displayed or not
windowTheme - The widget theme, included themes are "classic, graphite, idevice, snow"
spinnerTheme - The loading spinner theme, included themes are "black, white"
shadowTheme - The shadow theme name, included themes are "light, medium or dark"
shadowDepth - The visible portion of shadow file displayed in pixels
shadowThemeSize - The actual shadow imge file dimensions in pixels
imgZoomerClass - The CSS classname applied to the imgZoomer container
zIndex - The topmost zIndex from which all others are derived
*/
var ImgZoomer = Class.create();
ImgZoomer.prototype = {
    initialize: function(linkSelector, options) {
        this.linkElements = new Array();
        this.zoomedImages = new Array();
        this.imageSizes = new Array();

        this.options = options || {};

        // duration defaults
        this.options.duration = this.options.duration || 0.5;
        this.options.fadeDuration = this.options.fadeDuration || (this.options.duration / 2);
        this.options.toggleDuration = this.options.toggleDuration || (this.options.duration / 1.75);

        // path defaults
        this.options.imagePath = this.options.imagePath || "/images/imgzoomer/";

        // theme defaults
        this.options.windowTheme = this.options.windowTheme || "classic";
        this.options.spinnerTheme = this.options.spinnerTheme || "black";
        this.options.shadowTheme = this.options.shadowTheme || "medium";

        // shadow defaults
        this.options.shadowDepth = this.options.shadowDepth || this.options.shadowThemeSize / 2;
        this.options.shadowThemeSize = this.options.shadowThemeSize || 30;

        // filename defaults
        this.options.closeBox = this.options.closeBox || "closebox.png";
        this.options.loadingSpinner = this.options.loadingSpinner || "spinner.gif";

        // styling defaults
        this.options.imgZoomerClass = this.options.imgZoomerClass || "imgZoomer";
        this.options.zIndex = this.options.zIndex || 10000;

        // no fading shadows for IE
        if (navigator.appName == "Microsoft Internet Explorer") {
            this.options.fadeDuration = 0;
        }

        if (this.options.shadows == null) {
            this.options.shadows = true;
        }

        this.imgZoomer = new Element("div");
        this.imgZoomer.addClassName(this.options.imgZoomerClass);

        // create close box
        this.closeBox = new Image();
        this.closeBox.src = this.options.imagePath + "window/" + this.options.windowTheme + "/" + this.options.closeBox;
        this.closeBox.style.position = "absolute";
        this.closeBox.style.cursor = "pointer";
        this.closeBox.style.zIndex = this.options.zIndex;

        // create loading spinner
        this.loadingSpinner = new Image();
        this.loadingSpinner.src = this.options.imagePath + "spinner/" + this.options.spinnerTheme + "/" + this.options.loadingSpinner;
        this.loadingSpinner.style.position = "absolute";
        this.loadingSpinner.style.zIndex = this.options.zIndex;

        // make them prototyp-ed
        Element.extend(this.closeBox);
        Element.extend(this.loadingSpinner);
        Element.extend(this.imgZoomer);
             
        this.closeBox.hide();
        this.loadingSpinner.hide();

        // create and add shadows
        this.shadowHolder = new Element("div");
        this.shadowHolder.style.zIndex = this.options.zIndex - 2;

        if (this.options.shadows) {
            this.shadows = new Array();

            for (var i = 1; i <= 8; i++) {
                this.shadows[i] = new Image();
                Element.extend(this.shadows[i]);

                this.shadows[i].src = this.options.imagePath + "shadow/" + this.options.shadowThemeSize + "/" + this.options.shadowTheme + "/shadow_" + i + ".png";
                this.shadows[i].style.position = "absolute";
                this.shadows[i].hide();

                this.shadowHolder.appendChild(this.shadows[i]);
            }
        }

        // append our elements to the imgZoomer container
        this.imgZoomer.appendChild(this.closeBox);
        this.imgZoomer.appendChild(this.loadingSpinner);
        this.imgZoomer.appendChild(this.shadowHolder);

        document.body.appendChild(this.imgZoomer);

        // grab all links we are converting into a function to zoom its linked image
        $$(linkSelector).each(this.setupPreload.bindAsEventListener(this));
    },

    findLink: function(zoomedImage) {
        return this.linkElements[this.zoomedImages.index(zoomedImage)];
    },

    setupPreload: function(e) {
        e.onmouseover = this.setupImage.bindAsEventListener(this, e);
    },

    setupImage: function(e, link) {
        e = link;

        // if link is linked to an image then...
        if (IMAGE_FORMATS.include(e.href.split('.').last())) {
            // create the zoomed image element
            var zoomedImage = new Image();
            zoomedImage.src = e.href;
            zoomedImage.alt = e.title;
            zoomedImage.title = e.title;

            Element.extend(zoomedImage);

            // store them!
            this.linkElements.push(e);
            this.zoomedImages.push(zoomedImage);

            var firstElement = Element.childElements(this.findLink(zoomedImage)).first();
						if (firstElement == null) firstElement = this.findLink(zoomedImage);
            var absolutePosition = Element.cumulativeOffset(firstElement);

            zoomedImage.style.position = "absolute";
            zoomedImage.style.left = absolutePosition[0] + "px";
            zoomedImage.style.top = absolutePosition[1] + "px";
            zoomedImage.style.cursor = "pointer";
            zoomedImage.style.zIndex = this.options.zIndex - 1;
            zoomedImage.alt = e.title;
            zoomedImage.hide();

            // append it to the imgZoomer container
            this.imgZoomer.appendChild(zoomedImage);

            // add event for activating zoom function
            e.onclick = this.preload.bindAsEventListener(this, zoomedImage);
        }
    },

    resetImage: function(zoomedImage, clickedImage) {
        if (zoomedImage == clickedImage || zoomedImage.style.display == "none") return;

        // toggle any opened images and close them
        this.toggleImage(null, zoomedImage, this.options.toggleDuration);
    },

    openCloseBox: function(e, zoomedImage) {
        // once zoomed make it clickable
        zoomedImage.onclick = this.toggleImage.bindAsEventListener(this, zoomedImage);

        var absolutePosition = Element.cumulativeOffset(zoomedImage);

        // opera required hack so that we can grab the images width and height
        this.closeBox.setOpacity(0);
        this.closeBox.show();

        // position the close box (top left of zoomed image)
        this.closeBox.onclick = this.toggleImage.bindAsEventListener(this, zoomedImage);
        this.closeBox.style.left = (absolutePosition[0] - this.closeBox.width / 2) + "px";
        this.closeBox.style.top = (absolutePosition[1] - this.closeBox.height / 2) + "px";

        var effects = new Array();
        effects.push(new Effect.Appear(this.closeBox, { sync: true }));

        if (this.options.shadows) {
            this.addShadows(zoomedImage);

            Element.childElements(this.shadowHolder).each(function(shadow) {
                    effects.push(new Effect.Appear(shadow, { sync: true }));
                }
            );
        }

        // show close box and shadows
        new Effect.Parallel(effects, {
                duration: this.options.fadeDuration,
                queue: { position: "end", scope: "imgzoomer" }
            }
        );
    },

    showSpinner: function(parentX, parentY, parentWidth, parentHeight) {
        this.loadingSpinner.style.left = (parentX + (parentWidth - this.loadingSpinner.width) / 2) + "px";
        this.loadingSpinner.style.top = (parentY + (parentHeight - this.loadingSpinner.height) / 2) + "px";

        this.loadingSpinner.show();
    },

    addShadows: function(zoomedImage) {
        var absolutePosition = Element.cumulativeOffset(zoomedImage);

        this.positionShadow(SHADOW_TOP_LEFT, absolutePosition[0] - this.options.shadowDepth, absolutePosition[1] - this.options.shadowDepth, this.options.shadowThemeSize, this.options.shadowThemeSize);
        this.positionShadow(SHADOW_TOP, absolutePosition[0] + this.options.shadowThemeSize - this.options.shadowDepth, absolutePosition[1] - this.options.shadowDepth, zoomedImage.width - (this.options.shadowThemeSize * 2) + (this.options.shadowDepth * 2), this.options.shadowThemeSize);
        this.positionShadow(SHADOW_TOP_RIGHT, absolutePosition[0] + zoomedImage.width - this.options.shadowThemeSize + this.options.shadowDepth, absolutePosition[1] - this.options.shadowDepth, this.options.shadowThemeSize, this.options.shadowThemeSize);

        this.positionShadow(SHADOW_LEFT, absolutePosition[0] - this.options.shadowDepth, absolutePosition[1] + this.options.shadowThemeSize - this.options.shadowDepth, this.options.shadowThemeSize, zoomedImage.height - (this.options.shadowThemeSize * 2) + (this.options.shadowDepth * 2));
        this.positionShadow(SHADOW_RIGHT, absolutePosition[0] + zoomedImage.width - this.options.shadowThemeSize + this.options.shadowDepth, absolutePosition[1] + this.options.shadowThemeSize - this.options.shadowDepth, this.options.shadowThemeSize, zoomedImage.height - (this.options.shadowThemeSize * 2) + (this.options.shadowDepth * 2));

        this.positionShadow(SHADOW_BOTTOM_LEFT, absolutePosition[0] - this.options.shadowDepth, absolutePosition[1] + zoomedImage.height - this.options.shadowThemeSize + this.options.shadowDepth, this.options.shadowThemeSize, this.options.shadowThemeSize);
        this.positionShadow(SHADOW_BOTTOM, absolutePosition[0] + this.options.shadowThemeSize - this.options.shadowDepth, absolutePosition[1] - this.options.shadowThemeSize + this.options.shadowDepth + zoomedImage.height, zoomedImage.width - (this.options.shadowThemeSize * 2) + (this.options.shadowDepth * 2), this.options.shadowThemeSize);
        this.positionShadow(SHADOW_BOTTOM_RIGHT, absolutePosition[0] + zoomedImage.width - this.options.shadowThemeSize + this.options.shadowDepth, absolutePosition[1] - this.options.shadowThemeSize + this.options.shadowDepth + zoomedImage.height, this.options.shadowThemeSize, this.options.shadowThemeSize);
    },

    positionShadow: function(shadowNo, x, y, width, height) {
        var shadow = this.shadows[shadowNo];

        shadow.style.left = x + "px";
        shadow.style.top = y + "px";

        if (width != null) shadow.style.width = width + "px";
        if (height != null) shadow.style.height = height + "px";
    },

    preload: function(e, zoomedImage) {
        // only zoom image if none other is currently zooming
        if (Effect.Queues.get('imgzoomer').size() != 0) return false;

        // close any currently zoomed images
        this.zoomedImages.each(this.resetImage.bindAsEventListener(this, zoomedImage));

        if (this.preloader != null) this.preloader.stop();
        this.preloader = new PeriodicalExecuter(this.checkPreloader.bindAsEventListener(this, zoomedImage), 0.1);
        return false;
    },

    checkPreloader:function(e, zoomedImage) {
        if (zoomedImage.complete) {
            this.loadingSpinner.hide();
            this.toggleImage(e, zoomedImage);
            this.preloader.stop();
            this.preloader = null;
        } else {
            if (Effect.Queues.get('imgzoomer').size() == 0) {
                var windowInformation = this.getWindowInformation();
                this.showSpinner(
                    windowInformation.scrollX, windowInformation.scrollY,
                    windowInformation.windowWidth, windowInformation.windowHeight
                );
            }
        }
    },

    toggleImage: function(e, zoomedImage, duration) {
        var duration = duration == null ? this.options.duration : duration;

        // create effects for fading close box and shadow
        var effects = [ new Effect.Fade(this.closeBox, { sync: true }) ];

        // fade shadows too if we have any
        if (this.options.shadows) {
            Element.childElements(this.shadowHolder).each(function(shadow) {
                    effects.push(new Effect.Fade(shadow, { sync: true }));
                }
            );
        }

        // not clickable when during zooming
        zoomedImage.onclick = "";

        // toggle zoom in or out
        if (zoomedImage.style.display != "none") {
            var linkElement = Element.childElements(this.findLink(zoomedImage)).first();
						if (linkElement == null) linkElement = this.findLink(zoomedImage);
            var absolutePosition = Element.cumulativeOffset(linkElement);

            // hide shadows and close box first
            new Effect.Parallel(effects, { 
                duration: this.options.fadeDuration,
                queue: { position: "end", scope: "imgzoomer" }
            });

            // then scale image and fade out to normal
            new Effect.Parallel([
                    new Effect.Fade(zoomedImage, { sync: true }),
                    new Effect.MoveAndResizeTo(
                     zoomedImage,
                     absolutePosition[1], absolutePosition[0],
                     linkElement.offsetWidth, linkElement.offsetHeight, { sync: true }
                    )
                ], {
                    duration: duration,
                    queue: { position: "end", scope: "imgzoomer" }
                }
            );
        } else {
            // always hide close box and shadows first
            new Effect.Parallel(effects, {
                    duration: 0,
                    queue: { position: "end", scope: "imgzoomer" }
                }
            );

            // opera required hack so that we can grab the images width and height
            zoomedImage.setOpacity(0);
            zoomedImage.show();

            var windowInformation = this.getWindowInformation();

            // declare move to and zooming variables
            var moveToX, moveToY;
            var scaleX, scaleY;

            // work out where to zoom the image to
            moveToX = windowInformation.scrollX;
            moveToY = windowInformation.scrollY;

            // scale to full size of the image
            scaleX = zoomedImage.width;
            scaleY = zoomedImage.height;

            // get original size of the image
            var zoomedIndex = this.zoomedImages.index(zoomedImage);

            var firstElement = Element.childElements(this.findLink(zoomedImage)).first();
						if (firstElement == null) firstElement = this.findLink(zoomedImage);
            zoomedImage.style.width = firstElement.offsetWidth + "px";
            zoomedImage.style.height = firstElement.offsetHeight + "px";

            if (this.imageSizes[zoomedIndex] == null) {
                this.imageSizes[zoomedIndex] = [scaleX, scaleY];
            } else {
                scaleX = this.imageSizes[zoomedIndex][0];
                scaleY = this.imageSizes[zoomedIndex][1];
            }

            // option to set own offset to move to
            if (this.options.offsetX == null) {
                moveToX += (windowInformation.windowWidth - scaleX) / 2;
            } else {
                moveToX += this.options.offsetX;
            }

            if (this.options.offsetY == null) {
                moveToY += (windowInformation.windowHeight - scaleY) / 2;
            } else {
                moveToY += this.options.offsetY;
            }

            new Effect.Parallel([
                    new Effect.Appear(zoomedImage, { sync: true }),
                    new Effect.MoveAndResizeTo(zoomedImage, moveToY, moveToX, scaleX, scaleY, { sync: true })
                ], {
                    queue: { position: "end", scope: "imgzoomer" },
                    duration: duration,
                    afterFinish: this.openCloseBox.bindAsEventListener(this, zoomedImage)
            });
        }

        return false;
    },

    getWindowInformation: function() {
        var windowWidth, windowHeight;
        var scrollX, scrollY;

        // get window size
        if(typeof(window.innerWidth ) == 'number') {
            // Non-IE
            windowWidth = window.innerWidth;
            windowHeight = window.innerHeight;
        } else if (document.documentElement && (document.documentElement.clientWidth != null || document.documentElement.clientHeight != null)) {
            // IE 6+ in 'standards compliant mode'
            windowWidth = document.documentElement.clientWidth;
            windowHeight = document.documentElement.clientHeight;
        } else if (document.body && (document.body.clientWidth != null || document.body.clientHeight != null)) {
            // IE 4 compatible
            windowWidth = document.body.clientWidth;
            windowHeight = document.body.clientHeight;
        }

        // get scroll position
        if (typeof( window.pageYOffset ) == 'number') {
            // Netscape compliant
            scrollY = window.pageYOffset;
            scrollX = window.pageXOffset;
        } else if (document.body && ( document.body.scrollLeft != null || document.body.scrollTop != null)) {
            // DOM compliant
            scrollY = document.body.scrollTop;
            scrollX = document.body.scrollLeft;
        } else if (document.documentElement && ( document.documentElement.scrollLeft != null || document.documentElement.scrollTop != null)) {
            // IE6 standards compliant mode
            scrollY = document.documentElement.scrollTop;
            scrollX = document.documentElement.scrollLeft;
        }

        return { scrollX: scrollX, scrollY: scrollY, windowWidth: windowWidth, windowHeight: windowHeight };
    }
}