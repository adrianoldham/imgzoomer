// precheck if IE
var isIE = (/MSIE (5\.5|6\.)/.test(navigator.userAgent) && navigator.platform == "Win32");

Element.addMethods({ 
    iePNGFix: function(element) {}
});

// Quick helper function to apply shadow to an element
// returns the div holding the shadow elements
Element.addMethods({ 
    applyShadow: function(element, theme) {
        return (new ShadowMe(theme)).applyTo(element).appendToDom().show().shadowHolder;
    },
    
    iePNGFix: function(element, blankPixel) {
        if (element.src == blankPixel) return;        
        if (!isIE) return;
        
        // wait till image is preloaded
        if (!element.complete) {
            setTimeout(function(_element, _blankPixel) {
                _element.iePNGFix(_blankPixel);
            }.bind(this, element, blankPixel), 100);
            
            return;
        }
        
        element.style.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(src='" + element.src + "',sizingMethod='scale')";
        element.style.width = element.width + "px";
        element.style.height = element.height + "px";
        element.src = blankPixel || "/images/blank.gif";
    }
});

// A themes object that stores all our themes
var Themes = new Object();
Themes.Default = {
    windowTheme: "classic",
    spinnerTheme: "black",
    imagePath: "/images/imgzoomer/",
    shadowTheme: "light",
    shadowThemeSize: 30,
    shadowDepth: 15,
    shadowClass: "shadowMe",
    shadows: true,
    closeBox: "closebox.png",
    spinner: "spinner.gif",
    blankPixel: "blank.gif",
    duration: 0.5,
    fadeDuration: 0.25,
    toggleDuration: 0.3
};

Themes.idevice = {
    windowTheme: "idevice",
    shadowTheme: "dark",
    shadowThemeSize: 60,
    shadowDepth: 30,
    duration: 0.35,
    fadeDuration: 0.2,
    toggleDuration: 0.3
};

// ShadowMe class that applies shadows to elements
var ShadowMe = Class.create();

// Default ShadowMe options to use
ShadowMe.DefaultOptions = {
    zIndex: 100,
    overlay: "bottom"
};

ShadowMe.totalShadows = 0;

ShadowMe.prototype = {
    initialize: function(options) {        
        this.options = Object.extend(Object.extend({ }, ShadowMe.DefaultOptions), options || { });        
        this.options.theme = Object.extend({ }, Themes.Default);
        
        if (this.options.zIndex == null) {
            this.options.zIndex = ShadowMe.DefaultOptions.zIndex + ShadowMe.totalShadows;
        }
        
        if (!Object.isUndefined(options) && !Object.isUndefined(options.theme)) {
            Object.extend(this.options.theme, options.theme || {});
        }
        
        Object.extend(this.options.theme, this.options || {});

        this.shadowHolder = new Element("div");
        this.shadowHolder.addClassName(this.options.theme.shadowClass);

        for (var i = 1; i <= 8; i++) {
            var shadow = Element.extend(new Image());
            shadow.src = this.options.theme.imagePath + "shadow/" + this.options.theme.shadowThemeSize + "/" + this.options.theme.shadowTheme + "/shadow_" + i + ".png";
            shadow.style.position = "absolute";
            shadow.style.zIndex = this.options.zIndex;
            shadow.iePNGFix(this.options.theme.imagePath + "extras/" + this.options.theme.blankPixel);
            shadow.hide();

            this.shadowHolder.appendChild(shadow);
        }
        
        this.shadowHolder.style.zIndex = this.options.zIndex;
        ShadowMe.totalShadows++;

        return this;
    },

    applyTo: function(element) {
        if (element.complete != null) {
            if (!element.complete) {
                // if applying image to shadow and image width not know yet then wait until it is
                setTimeout(this.applyTo.bind(this, element), 100);
                return this;
            }
        }
        
        var absolutePosition = element.cumulativeOffset();
        var shadows = this.shadowHolder.childElements();        
        
        if (element.getStyle("position") != "absolute") {
            element.style.position = "relative";
        }
        
        if (element.getStyle("zIndex") != "") {
            if (this.options.overlay == "top") 
                this.shadowHolder.style.zIndex = parseInt(element.getStyle("zIndex")) + 1;
            else
                this.shadowHolder.style.zIndex = parseInt(element.getStyle("zIndex")) - 1;
                
            shadows.each(function(s) {
               s.style.zIndex = this.shadowHolder.getStyle("zIndex");
            }.bind(this));
        } else {
            if (this.options.overlay == "top") 
                element.style.zIndex = parseInt(this.options.zIndex) - 1;
            else
                element.style.zIndex = parseInt(this.options.zIndex) + 1;
        }

        var size = { width: element.getWidth(), height: element.getHeight() };

        this.positionShadow(shadows[0], absolutePosition[0] - this.options.theme.shadowDepth, absolutePosition[1] - this.options.theme.shadowDepth, this.options.theme.shadowThemeSize, this.options.theme.shadowThemeSize);
        this.positionShadow(shadows[1], absolutePosition[0] + this.options.theme.shadowThemeSize - this.options.theme.shadowDepth, absolutePosition[1] - this.options.theme.shadowDepth, size.width - (this.options.theme.shadowThemeSize * 2) + (this.options.theme.shadowDepth * 2), this.options.theme.shadowThemeSize);
        this.positionShadow(shadows[2], absolutePosition[0] + size.width - this.options.theme.shadowThemeSize + this.options.theme.shadowDepth, absolutePosition[1] - this.options.theme.shadowDepth, this.options.theme.shadowThemeSize, this.options.theme.shadowThemeSize);

        this.positionShadow(shadows[3], absolutePosition[0] - this.options.theme.shadowDepth, absolutePosition[1] + this.options.theme.shadowThemeSize - this.options.theme.shadowDepth, this.options.theme.shadowThemeSize, size.height - (this.options.theme.shadowThemeSize * 2) + (this.options.theme.shadowDepth * 2));
        this.positionShadow(shadows[4], absolutePosition[0] + size.width - this.options.theme.shadowThemeSize + this.options.theme.shadowDepth, absolutePosition[1] + this.options.theme.shadowThemeSize - this.options.theme.shadowDepth, this.options.theme.shadowThemeSize, size.height - (this.options.theme.shadowThemeSize * 2) + (this.options.theme.shadowDepth * 2));

        this.positionShadow(shadows[5], absolutePosition[0] - this.options.theme.shadowDepth, absolutePosition[1] + size.height - this.options.theme.shadowThemeSize + this.options.theme.shadowDepth, this.options.theme.shadowThemeSize, this.options.theme.shadowThemeSize);
        this.positionShadow(shadows[6], absolutePosition[0] + this.options.theme.shadowThemeSize - this.options.theme.shadowDepth, absolutePosition[1] - this.options.theme.shadowThemeSize + this.options.theme.shadowDepth + size.height, size.width - (this.options.theme.shadowThemeSize * 2) + (this.options.theme.shadowDepth * 2), this.options.theme.shadowThemeSize);
        this.positionShadow(shadows[7], absolutePosition[0] + size.width - this.options.theme.shadowThemeSize + this.options.theme.shadowDepth, absolutePosition[1] - this.options.theme.shadowThemeSize + this.options.theme.shadowDepth + size.height, this.options.theme.shadowThemeSize, this.options.theme.shadowThemeSize);

        this.canShow = true;

        //if (!isNaN(element.style.zIndex))
        //    this.shadowHolder.style.zIndex = element.style.zIndex - 3;
            
        if (this.element != element) {
            if (this.timer) this.timer.stop();
            this.timer = new PeriodicalExecuter(this.applyTo.bind(this, element), 0.1);
        }
        
        this.element = element;

        return this;
    },

    positionShadow: function(shadow, x, y, width, height) {
        shadow.style.left = x + "px";
        shadow.style.top = y + "px";

        if (width != null && width > 0) shadow.style.width = width + "px";
        if (height != null && height > 0) shadow.style.height = height + "px";
    },

    appendToDom: function(appendTo) {
        (appendTo || $(document.body)).appendChild(this.shadowHolder);
        return this;
    },

    show: function() {
        // only show when we can
        if (!this.canShow) {
            setTimeout(this.show.bind(this), 100);
            return this;
        }

        this.shadowHolder.childElements().each(function(shadow) {
           shadow.show();
        });

        return this;
    }
};

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

String.prototype.trim = function() { return this.replace(/^\s+|\s+$/, ''); };

var IMAGE_FORMATS = ["png", "jpg", "jpeg", "gif", "tif", "tiff", "bmp"];
var FLASH_FORMATS = ["flv", "swf"];

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
shadowThemeSize - The actual shadow image file dimensions in pixels
imgZoomerClass - The CSS classname applied to the imgZoomer container
zIndex - The topmost zIndex from which all others are derived
*/

var ImgZoomer = Class.create();

ImgZoomer.DefaultOptions = {
    theme: null,
    imgZoomerClass: 'imgZoomer',
    zIndex: 10000,
    updatePosition: true,
    closeOnBlur: true
};

ImgZoomer.prototype = {
    initialize: function(linkSelector, options) {
        this.linkElements = new Array();
        this.zoomedImages = new Array();
        this.imageSizes   = new Array();
        this.contentDivs    = new Array();
        
        this.options = Object.extend(Object.extend({ }, ImgZoomer.DefaultOptions), options || { });        
        this.options.theme = Object.extend({ }, Themes.Default);
        
        if (!Object.isUndefined(options) && !Object.isUndefined(options.theme)) {
            Object.extend(this.options.theme, options.theme || {});
        }
        
        Object.extend(this.options.theme, this.options || {});

        // no fading shadows for IE
        if (navigator.appName == "Microsoft Internet Explorer") {
            this.options.theme.fadeDuration = 0;
        }
        
        // if no shadow theme then disable shadows
        if (this.options.theme.shadowTheme == null) {
            this.options.theme.shadows = false;
        }

        this.imgZoomer = new Element("div");
        this.imgZoomer.addClassName(this.options.imgZoomerClass);

        // create close box
        this.closeBox = new Image();
        this.closeBox.src = this.options.theme.imagePath + "window/" + this.options.theme.windowTheme + "/" + this.options.theme.closeBox;
        this.closeBox.style.position = "absolute";
        this.closeBox.style.cursor = "pointer";
        this.closeBox.style.zIndex = this.options.zIndex;

        // create loading spinner
        this.loadingSpinner = new Image();
        this.loadingSpinner.src = this.options.theme.imagePath + "spinner/" + this.options.theme.spinnerTheme + "/" + this.options.theme.spinner;
        this.loadingSpinner.style.position = "absolute";
        this.loadingSpinner.style.zIndex = this.options.zIndex;

        // make them prototyp-ed
        Element.extend(this.closeBox);
        Element.extend(this.loadingSpinner);
        Element.extend(this.imgZoomer);
        
        this.closeBox.iePNGFix(this.options.theme.imagePath + "extras/" + this.options.theme.blankPixel);

        this.closeBox.hide();
        this.loadingSpinner.hide();

        // create and add shadows
        this.shadowMe = new ShadowMe({ theme: this.options.theme, zIndex: this.options.zIndex - 3 });
        this.shadowHolder = this.shadowMe.shadowHolder;

        // append our elements to the imgZoomer container
        this.imgZoomer.appendChild(this.closeBox);
        this.imgZoomer.appendChild(this.loadingSpinner);
        this.imgZoomer.appendChild(this.shadowHolder);

        $(document.body).appendChild(this.imgZoomer);

        // grab all links we are converting into a function to zoom its linked image
        $$(linkSelector || "a").each(this.setupPreload.bindAsEventListener(this));
    },

    findLink: function(zoomedImage) {
        return this.linkElements[this.zoomedImages.index(zoomedImage)];
    },

    setupPreload: function(e) {
        e.onmouseover = this.setupImage.bindAsEventListener(this, e);
    },

    setupImage: function(e, link) {
        e = link;
        
        if (e.onclick != null) return;

        var isAnchor = (e.href.lastIndexOf("#") != -1);
        
        // if link is linked to an image then...
        if (IMAGE_FORMATS.include(e.href.split('.').last()) || isAnchor) {
            // create the zoomed image element
            var zoomedImage;

            if (isAnchor) {
                var element = $(e.href.substring(e.href.lastIndexOf("#") + 1));
                
                if (element.style.display != "none") return;
                
                zoomedImage = new Element("div");
                
                // use the elements background for the zoomer element
                for (var p in element.getStyles()) {
                    if (p.indexOf("background") != -1) {
                        var styles = {};
                        styles[p] = element.getStyle(p);
                        
                        if (p != "backgroundPosition") zoomedImage.setStyle(styles);
                    }
                }
                
                zoomedImage.width = element.getWidth();
                zoomedImage.height = element.getHeight();
            } else {
                zoomedImage = new Image();
                zoomedImage.src = e.href;
                zoomedImage.alt = e.title;
                zoomedImage.title = e.title;
            }

            Element.extend(zoomedImage); 
            
            // store them!
            this.linkElements.push(e);
            this.zoomedImages.push(zoomedImage);
            
            // intialise and setup all plugins
            for (pluginName in ImgZoomer.plugins) {
                var contentDiv = ImgZoomer.plugins[pluginName].setup(this, e, zoomedImage);
                if (contentDiv != null) {
                    var zoomIndex = this.zoomedImages.index(zoomedImage);
                    this.contentDivs[zoomIndex] = contentDiv;
                    this.imgZoomer.appendChild(contentDiv);
                }
            }

            var firstElement = this.findLink(zoomedImage).childElements().first();
            if (firstElement == null) firstElement = this.findLink(zoomedImage);
            var absolutePosition = this.screenPosition(firstElement);

            zoomedImage.style.position = "absolute";
            zoomedImage.style.left = absolutePosition[0] + "px";
            zoomedImage.style.top = absolutePosition[1] + "px";
            zoomedImage.style.cursor = "pointer";
            zoomedImage.style.zIndex = this.options.zIndex - 2;
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
        this.toggleImage(null, zoomedImage, this.options.theme.toggleDuration);
    },
    
    positionCloseBox: function(zoomedImage) {
        var absolutePosition = zoomedImage.cumulativeOffset();

        // position the close box (top left of zoomed image)
        this.closeBox.style.left = (absolutePosition[0] - this.closeBox.width / 2) + "px";
        this.closeBox.style.top = (absolutePosition[1] - this.closeBox.height / 2) + "px";  
    },

    openCloseBox: function(e, zoomedImage) {        
        // once zoomed make it clickable
        zoomedImage.onclick = this.toggleImage.bindAsEventListener(this, zoomedImage);

        var absolutePosition = zoomedImage.cumulativeOffset();
        
        var contentDiv = this.contentDivs[this.zoomedImages.index(zoomedImage)];
        if (contentDiv != null) {
            contentDiv.style.left = absolutePosition[0] + "px";
            contentDiv.style.top = absolutePosition[1] + "px";
            contentDiv.show();
        }
        
        // opera required hack so that we can grab the images width and height
        this.closeBox.setOpacity(0);
        this.closeBox.show();

        // position the close box (top left of zoomed image)
        this.closeBox.onclick = this.toggleImage.bindAsEventListener(this, zoomedImage);
        this.positionCloseBox(zoomedImage);

        var effects = new Array();
        effects.push(new Effect.Appear(this.closeBox, { sync: true }));

        if (this.options.theme.shadows) {
            this.shadowMe.applyTo(zoomedImage);

            this.shadowHolder.childElements().each(function(shadow) {
                    effects.push(new Effect.Appear(shadow, { sync: true }));
                }
            );
        }

        // show close box and shadows
        new Effect.Parallel(effects, {
                duration: this.options.theme.fadeDuration,
                queue: { position: "end", scope: "imgzoomer" }
            }
        );

        if (contentDiv == null || contentDiv.getElementsBySelector("object").length == 0) {
            this.closerFunction = this.toggleImage.bindAsEventListener(this, zoomedImage);
            if (this.options.closeOnBlur) $(document.body).observe('click', this.closerFunction);
        }
    },

    showSpinner: function(parentX, parentY, parentWidth, parentHeight) {
        this.loadingSpinner.style.left = (parentX + (parentWidth - this.loadingSpinner.width) / 2) + "px";
        this.loadingSpinner.style.top = (parentY + (parentHeight - this.loadingSpinner.height) / 2) + "px";

        this.loadingSpinner.show();
    },
    
    centerInfo: function(zoomedImage) {
        var windowInformation;
        
        if (this.options.centerOf) {
            this.options.centerOf = $(this.options.centerOf);
            var position = this.options.centerOf.cumulativeOffset();
            
            windowInformation = {};
            
            windowInformation.scrollX = position[0];
            windowInformation.scrollY = position[1];
            
            windowInformation.windowWidth = this.options.centerOf.getWidth();
            windowInformation.windowHeight = this.options.centerOf.getHeight();    
        } else {
            windowInformation = this.getWindowInformation();
        }

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

        var firstElement = this.findLink(zoomedImage).childElements().first();
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
        
        return { width: scaleX, height: scaleY, left: moveToX, top: moveToY };
    },
    
    reposition: function(zoomedImage) {
        if (Effect.Queues.get('imgzoomer').size() != 0) return;
        var centerInformation = this.centerInfo(zoomedImage);
        
        zoomedImage.style.left = centerInformation.left + "px";
        zoomedImage.style.top = centerInformation.top + "px";
        zoomedImage.style.width = centerInformation.width + "px";
        zoomedImage.style.height = centerInformation.height + "px";
        
        var zoomIndex = this.zoomedImages.index(zoomedImage);
        
        var contentDiv = this.contentDivs[zoomIndex];
        if (contentDiv != null) {
            contentDiv.style.left = centerInformation.left + "px";
            contentDiv.style.top = centerInformation.top + "px";
            contentDiv.style.width = centerInformation.width + "px";
            contentDiv.style.height = centerInformation.height + "px";
        }
        
        // this.shadowMe.applyTo(zoomedImage);
        this.positionCloseBox(zoomedImage);
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
        if (zoomedImage.complete || zoomedImage.complete == undefined) {
            this.loadingSpinner.hide();
            this.toggleImage(e, zoomedImage);
            if (this.preloader != null) this.preloader.stop();
            this.preloader = null;
            
            // add flash
            var zoomedIndex = this.zoomedImages.index(zoomedImage);
            var contentDiv = this.contentDivs[this.zoomedImages.index(zoomedImage)];

            if (contentDiv != null) {
                var contentSize = { width: this.imageSizes[zoomedIndex][0], height: this.imageSizes[zoomedIndex][1] };
                
                contentDiv.style.width = contentSize.width + "px";
                contentDiv.style.height = contentSize.height + "px";
                
                // run the plugins
                for (pluginName in ImgZoomer.plugins) {
                    ImgZoomer.plugins[pluginName].setContent(this, contentDiv, zoomedImage);
                }
            }
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
    
    closeContent: function(zoomedImage) {
        var contentDiv = this.contentDivs[this.zoomedImages.index(zoomedImage)];
        if (contentDiv != null) {
            contentDiv.hide();
            contentDiv.childElements().each(function(el) {
               $(el.parentNode).removeChild(el); 
            });
        }
    },
    
    screenPosition: function(element) {
        var absolutePosition = element.cumulativeOffset();
            
        var element = element.parentNode;
        
        while (element) {
            if (element == document.body) break;
            
            if (element.scrollTop) absolutePosition[1] -= element.scrollTop;
            if (element.scrollLeft) absolutePosition[0] -= element.scrollLeft;
            
            element = element.parentNode;
        }
        
        return absolutePosition;
    },

    toggleImage: function(e, zoomedImage, duration) {
        var duration = duration == null ? this.options.theme.duration : duration;

        // create effects for fading close box and shadow
        var effects = [ new Effect.Fade(this.closeBox, { sync: true }) ];

        // fade shadows too if we have any
        if (this.options.theme.shadows) {
            this.shadowHolder.childElements().each(function(shadow) {
                    effects.push(new Effect.Fade(shadow, { sync: true }));
                }
            );
        }

        // not clickable when during zooming
        zoomedImage.onclick = "";

        // toggle zoom in or out
        if (zoomedImage.style.display != "none") {
            if (this.closing == zoomedImage) return;
            this.closing = zoomedImage;
            
            if (this.repositioner != null) this.repositioner.stop();
            this.closeContent(zoomedImage);
                    
            var linkElement = this.findLink(zoomedImage).childElements().first();
            if (linkElement == null) linkElement = this.findLink(zoomedImage);
            var absolutePosition = this.screenPosition(linkElement);

            // hide shadows and close box first
            new Effect.Parallel(effects, {
                duration: this.options.theme.fadeDuration,
                queue: { position: "end", scope: "imgzoomer" }
            });
            
            $(document.body).style.overflowX = "hidden";

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
                    queue: { position: "end", scope: "imgzoomer" }, 
                    afterFinish: function(e) {
                        this.closing = null;
                        $(document.body).style.overflowX = "auto";
                    }.bind(this)
                }
            );
            
            if (this.options.closeOnBlur) {
                $(document.body).stopObserving('click', this.closerFunction);            
                this.closerFunction = null;
            }
        } else {
            if (this.options.updatePosition) {
                if (this.repositioner != null) this.repositioner.stop();
                this.repositioner = new PeriodicalExecuter(this.reposition.bind(this, zoomedImage), 0.1);
            }
               
            // always hide close box and shadows first
            new Effect.Parallel(effects, {
                    duration: 0,
                    queue: { position: "end", scope: "imgzoomer" }
                }
            );

            // opera required hack so that we can grab the images width and height
            zoomedImage.setOpacity(0);
            zoomedImage.show();

            var center = this.centerInfo(zoomedImage);
            
            var linkElement = this.findLink(zoomedImage).childElements().first();
            if (linkElement == null) linkElement = this.findLink(zoomedImage);
            var absolutePosition = this.screenPosition(linkElement);
            
            zoomedImage.style.left = absolutePosition[0] + "px";
            zoomedImage.style.top = absolutePosition[1] + "px";

            new Effect.Parallel([
                    new Effect.Appear(zoomedImage, { sync: true }),
                    new Effect.MoveAndResizeTo(zoomedImage, center.top, center.left, center.width, center.height, { sync: true })
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
        } else if (!Object.isUndefined(document.documentElement) && (!Object.isUndefined(document.documentElement.clientWidth) || !Object.isUndefined(document.documentElement.clientHeight))) {
            // IE 6+ in 'standards compliant mode'
            windowWidth = document.documentElement.clientWidth;
            windowHeight = document.documentElement.clientHeight;
        } else if (!Object.isUndefined(document.body) && (!Object.isUndefined(document.body.clientWidth) || !Object.isUndefined(document.body.clientHeight))) {
            // IE 4 compatible
            windowWidth = document.body.clientWidth;
            windowHeight = document.body.clientHeight;
        }
        
        // get scroll position
        if (typeof( window.pageYOffset ) == 'number') {
            // Netscape compliant
            scrollY = window.pageYOffset;
            scrollX = window.pageXOffset;
        } else if (!Object.isUndefined(document.documentElement) && (!Object.isUndefined(document.documentElement.scrollLeft) || !Object.isUndefined(document.documentElement.scrollTop))) {
            // IE6 standards compliant mode
            scrollY = document.documentElement.scrollTop;
            scrollX = document.documentElement.scrollLeft;
        } else if (!Object.isUndefined(document.body) && (!Object.isUndefined(document.body.scrollLeft) || !Object.isUndefined(document.body.scrollTop))) {
            // DOM compliant
            scrollY = document.body.scrollTop;
            scrollX = document.body.scrollLeft;
        }

        return { scrollX: scrollX, scrollY: scrollY, windowWidth: windowWidth, windowHeight: windowHeight };
    }
};

ImgZoomer.plugins = {};
