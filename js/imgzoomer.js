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
    activeClass: "active",
    closeBox: "closebox.png",
    closeBoxClass: null,
    spinner: "spinner.gif",
    blankPixel: "blank.gif",
    duration: 0.5,
    fadeDuration: 0.25,
    toggleDuration: 0.3,
    
    // Configure lightbox here
    lightboxColor: '#000000',
    lightboxOpacity: 0.5,
    lightboxZIndex: 100,
    lightboxAnimationDuration: 0.2,
    lightboxSequence: "before" // after, parallel, or before
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

var IMAGE_FORMATS = /^.+\.((jpg)|(gif)|(jpeg)|(png)|(tif)|(tiff)|(bmp))$/;
var FLASH_FORMATS = /^.+\.((flv)|(swf))$/;

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
    closeOnBlur: true,
    closeOnEscape: true,
    zoomRects: false,
    zoomRectsClass: null,
    onOpen: function () {},
    onClose: function () {}
};

ImgZoomer.prototype = {
    getPageSize: function() {
    	var xScroll, yScroll;

    	if (window.innerHeight && window.scrollMaxY) {	
    		xScroll = document.body.scrollWidth;
    		yScroll = window.innerHeight + window.scrollMaxY;
    	} else if (document.body.scrollHeight > document.body.offsetHeight) { // all but Explorer Mac
    		xScroll = document.body.scrollWidth;
    		yScroll = document.body.scrollHeight;
    	} else { // Explorer Mac...would also work in Explorer 6 Strict, Mozilla and Safari
    		xScroll = document.body.offsetWidth;
    		yScroll = document.body.offsetHeight;
    	}

    	var windowWidth, windowHeight;
    	if (self.innerHeight) {	// all except Explorer
    		windowWidth = self.innerWidth;
    		windowHeight = self.innerHeight;
    	} else if (document.documentElement && document.documentElement.clientHeight) { // Explorer 6 Strict Mode
    		windowWidth = document.documentElement.clientWidth;
    		windowHeight = document.documentElement.clientHeight;
    	} else if (document.body) { // other Explorers
    		windowWidth = document.body.clientWidth;
    		windowHeight = document.body.clientHeight;
    	}	

    	// for small pages with total height less then height of the viewport
    	if(yScroll < windowHeight) {
    		pageHeight = windowHeight;
    	} else { 
    		pageHeight = yScroll;
    	}

    	// for small pages with total width less then width of the viewport
    	if(xScroll < windowWidth) {	
    		pageWidth = windowWidth;
    	} else {
    		pageWidth = xScroll;
    	}
    	
    	arrayPageSize = new Array(pageWidth,pageHeight,windowWidth,windowHeight);
    	return arrayPageSize;
    },
    
    setupLightBox: function() {
        if (!this.options.useLightbox) return;
        
        this.lightbox = new Element("div");
        
        this.lightbox.setStyle({
            position: 'absolute',
            top: '0', left: '0',
            width: '100%', height: this.getPageSize()[1] + 'px',
            backgroundColor: this.options.theme.lightboxColor,
            zIndex: this.options.theme.lightboxZIndex,
            display: 'none'
        });
        
        $(document.body).insert(this.lightbox);
    },
    
    showLightBox: function() {
        if (!this.options.useLightbox) return;
        
        this.lightbox.setStyle({
            height: this.getPageSize()[1] + 'px'
        });
        
        new Effect.Appear(this.lightbox, { 
            to: this.options.theme.lightboxOpacity,
            duration: this.options.theme.lightboxAnimationDuration
        });
    },
    
    hideLightBox: function() {
        if (!this.options.useLightbox) return;
                
        new Effect.Fade(this.lightbox, {
            duration: this.options.theme.lightboxAnimationDuration
        });
    },
    
    initialize: function(linkSelector, options) {        
        this.linkElements = new Array();
        this.zoomedImages = new Array();
        this.imageSizes   = new Array();
        this.contentDivs  = new Array();
        
        this.options = Object.extend(Object.extend({ }, ImgZoomer.DefaultOptions), options || { });        
        this.options.theme = Object.extend({ }, Themes.Default);
        
        if (!Object.isUndefined(options) && !Object.isUndefined(options.theme)) {
            Object.extend(this.options.theme, options.theme || {});
        }
        
        Object.extend(this.options.theme, this.options || {});

        // no fading shadows for IE
        if (hasNoAlphaAnimationSupport) {
            this.options.theme.fadeDuration = 0;
        }
        
        // if no shadow theme then disable shadows
        if (this.options.theme.shadowTheme == null) {
            this.options.theme.shadows = false;
        }
        
        this.setupLightBox();

        this.imgZoomer = new Element("div");
        this.imgZoomer.addClassName(this.options.imgZoomerClass);

        // create close box
        this.closeBox = new Image();
        this.closeBox.src = this.options.theme.imagePath + "window/" + this.options.theme.windowTheme + "/" + this.options.theme.closeBox;

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
        
        var tempCloseBoxDiv = new Element("div");
        tempCloseBoxDiv.appendChild(this.closeBox);
        this.closeBox = tempCloseBoxDiv;
        
        this.closeBox.style.position = "absolute";
        this.closeBox.style.cursor = "pointer";
        this.closeBox.style.zIndex = this.options.zIndex;
        
        if (this.options.theme.closeBoxClass != null) this.closeBox.className = this.options.theme.closeBoxClass;

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
        var isAnchor = (e.href.lastIndexOf("#") != -1);
        if (IMAGE_FORMATS.test(e.href.toLowerCase()) || isAnchor) {
            if (isAnchor) {
                var element = $(e.href.substring(e.href.lastIndexOf("#") + 1));
                element.hide();
            }
        }
        
        e.onmouseover = this.setupImage.bindAsEventListener(this, e);
    },

    setupImage: function(e, link) {
        e = link;
        
        if (e.onclick != null) return;

        var isAnchor = (e.href.lastIndexOf("#") != -1);
        
        if (true) {
            // create the zoomed image element
            var zoomedImage;
            var useImage = IMAGE_FORMATS.test(e.href.toLowerCase());
            
            if (useImage) {
                zoomedImage = new Image();
                zoomedImage.src = e.href;
                zoomedImage.alt = e.title;
                zoomedImage.title = e.title;  
            } else {
                zoomedImage = new Element("div");
                
                if (this.options.zoomRects) {
                    if (this.options.zoomRectsClass) {
                        zoomedImage.classNames().add(this.options.zoomRectsClass);
                    } else {
                        zoomedImage.style.borderColor = "#333333";
                        zoomedImage.style.borderStyle = "dotted";
                        zoomedImage.style.borderTopWidth = "1px";
                        zoomedImage.style.borderLeftWidth = "1px";
                        zoomedImage.style.borderRightWidth = "1px";
                        zoomedImage.style.borderBottomWidth = "1px";
                    }
                }
            }

            if (isAnchor) {
                var element = $(e.href.substring(e.href.lastIndexOf("#") + 1));

                var hidden = [];
                var el = element;
                while (true) {
                    if (el == null) break;

                    if (el.style && el.style.display == "none") {
                        hidden.push(el);
                        el.show();
                    }
                    el = $(el.parentNode);
                }

                if (!this.options.zoomRects) {
                    ["backgroundRepeat", "backgroundColor",
                    "borderLeftWidth", "borderRightWidth", 
                    "borderTopWidth", "borderBottomWidth", "borderLeftColor",
                    "borderRightColor", "borderTopColor", "borderBottomColor",
                    "borderLeftStyle", "borderRightStyle", "borderTopStyle", "borderBottomStyle"].each(function(style) {
                        var data = {};
                        data[style] = element.getStyle(style);
                        zoomedImage.setStyle(data);
                    });
                }
                
                var borderLeft = parseInt(zoomedImage.getStyle('borderLeftWidth'));
                borderLeft = isNaN(borderLeft) ? 0 : borderLeft;
                
                var borderRight = parseInt(zoomedImage.getStyle('borderRightWidth'));
                borderRight = isNaN(borderRight) ? 0 : borderRight;
                
                var borderTop = parseInt(zoomedImage.getStyle('borderTopWidth'));
                borderTop = isNaN(borderTop) ? 0 : borderTop;
                
                var borderBottom = parseInt(zoomedImage.getStyle('borderBottomWidth'));
                borderBottom = isNaN(borderBottom) ? 0 : borderBottom;
                
                zoomedImage.width = element.getWidth() - borderLeft - borderRight;
                zoomedImage.height = element.getHeight() - borderBottom - borderTop;
                
                hidden.each(function (el) {
                    el.hide();
                });
            }
            
            if (zoomedImage == null) return;

            Element.extend(zoomedImage); 
            
            // store them!
            this.linkElements.push(e);
            this.zoomedImages.push(zoomedImage);

            var contentDiv;

            // intialise and setup all plugins
            for (pluginName in ImgZoomer.plugins) {
                var contentDiv = ImgZoomer.plugins[pluginName].setup(this, e, zoomedImage);
                if (contentDiv != null) break;
            }
            
            if (contentDiv == null && !useImage) {
                this.linkElements.pop();
                this.zoomedImages.pop();
                return;
            }
            
            // if no content div then create a blank one
            if (contentDiv == null) {
                contentDiv = new Element("div");
                contentDiv.style.position = "absolute";
                contentDiv.style.cursor = "pointer";
                contentDiv.style.zIndex = this.options.zIndex - 1;
                contentDiv.hide();
            }
            
            // add the content div to the img zoomer
            var zoomIndex = this.zoomedImages.index(zoomedImage);
            this.contentDivs[zoomIndex] = contentDiv;
            this.imgZoomer.appendChild(contentDiv);

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

        // If no class specified for close box, then point it at the top left
        if (this.options.theme.closeBoxClass == null) {
            // position the close box (top left of zoomed image)
            this.closeBox.style.left = -this.closeBox.getWidth() / 2 + "px";
            this.closeBox.style.top = -this.closeBox.getHeight() / 2 + "px";
        }
    },

    openCloseBox: function(e, zoomedImage) {                
        // once zoomed make it clickable
        zoomedImage.onclick = this.toggleImage.bindAsEventListener(this, zoomedImage);

        var absolutePosition = zoomedImage.cumulativeOffset();
        
        var contentDiv = this.contentDivs[this.zoomedImages.index(zoomedImage)];
        if (contentDiv != null) {
            // If content div is blank, then make it clickable to close (ie. make it invisible)
            if (contentDiv.innerHTML == "") {
                contentDiv.onclick = this.toggleImage.bindAsEventListener(this, zoomedImage);
            }
            
            contentDiv.appendChild(this.closeBox);
        
            contentDiv.style.left = absolutePosition[0] + "px";
            contentDiv.style.top = absolutePosition[1] + "px";
            contentDiv.show();

            if (this.options.zoomRects)
                zoomedImage.setOpacity(0);
            
            // hide zoomed image if there is a content div overlayed on top
            //zoomedImage.setOpacity(0);
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
            // do blur close
            this.closerFunction = this.toggleImage.bindAsEventListener(this, zoomedImage);
            if (this.options.closeOnBlur) $(document).observe('click', this.closerFunction);
            
            // do escape close
            this.escapeFunction = function(event, zoomedImage) {
                // ESC key
                if (event.keyCode == 27) this.toggleImage(this, zoomedImage);
            }.bindAsEventListener(this, zoomedImage);
            
            if (this.options.closeOnEscape) {
                $(document).observe('keypress', this.escapeFunction);
            }
        }
        
        // Show light box after zooming out
        if (this.options.useLightbox && this.options.theme.lightboxSequence == 'after') {
            this.showLightBox();
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

            var imgZoomerShown = this.imgZoomer.style.display != "none";
            this.imgZoomer.hide();
            
            var position = this.options.centerOf.cumulativeOffset();
            
            if (imgZoomerShown) this.imgZoomer.show();
            
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
        this.shadowMe.applyTo(zoomedImage);
    },

    preload: function(e, zoomedImage) {
        // if img zoomer has been disabled then don't zoom anything
        if (this.disabled) return;

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
                
                // run the plugins only if there is no content in the content divs
                if (contentDiv.innerHTML == "") {
                   for (pluginName in ImgZoomer.plugins) {
                       ImgZoomer.plugins[pluginName].setContent(this, contentDiv, zoomedImage);
                   }
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
    
    closeContent: function(zoomedImage, effects) {
        var contentDiv = this.contentDivs[this.zoomedImages.index(zoomedImage)];
        if (contentDiv != null) {
            effects.push(new Effect.Fade(contentDiv, { sync: true }));
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
    
    removeActives: function() {
        // make all images not active
        this.linkElements.each(function(l) {
            l.classNames().remove(this.options.theme.activeClass);
        }.bind(this));
    },

    toggleImage: function(e, zoomedImage, duration) {        
        this.removeActives();        
        
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
            // Work out delay, if hiding after lightbox
            var delay = 0;
            if (this.options.useLightbox && this.options.theme.lightboxSequence == 'after') {
                delay = this.options.theme.lightboxAnimationDuration;
            }
            
            this.options.onClose();
            
            if (this.closing == zoomedImage) return;
            this.closing = zoomedImage;
            
            if (this.repositionEvent) {
                Event.stopObserving(window, "scroll", this.repositionEvent);
                Event.stopObserving(window, "resize", this.repositionEvent);                    
            }
            
            this.closeContent(zoomedImage, effects);
                
            var linkElement = this.findLink(zoomedImage).childElements().first();
            if (linkElement == null) linkElement = this.findLink(zoomedImage);
            var absolutePosition = this.screenPosition(linkElement);

            // hide shadows and close box first
            new Effect.Parallel(effects, {
                delay: delay,
                duration: this.options.theme.fadeDuration,
                queue: { position: "end", scope: "imgzoomer" }
            });
            
            $(document.body).setStyle({ overflowX: "hidden" });

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
                    afterFinish: function(e, zoomedImage) {
                        this.closing = null;
                        $(document.body).style.overflowX = "auto";
                        
                        // Run remove content for each plugin (some plugins may not want to remove)
                        for (pluginName in ImgZoomer.plugins) {
                           ImgZoomer.plugins[pluginName].removeContent(this, zoomedImage);
                        }
                        
                        // Hide light box after zooming out
                        if (this.options.useLightbox && this.options.theme.lightboxSequence == 'before') {
                            this.hideLightBox();
                        }
                    }.bindAsEventListener(this, zoomedImage)
                }
            );
            
            if (this.options.closeOnBlur) {
                $(document).stopObserving('click', this.closerFunction);            
                this.closerFunction = null;
            }
            
            if (this.options.closeOnEscape) {
                $(document).stopObserving('keypress', this.escapeFunction);            
                this.escapeFunction = null;
            }
            
            // Hide light box in parallel
            if (this.options.useLightbox && this.options.theme.lightboxSequence != 'before') {
                this.hideLightBox();
            }
        } else {
            // Work out delay, if showing after lightbox
            var delay = 0;
            if (this.options.useLightbox && this.options.theme.lightboxSequence == 'before') {
                delay = this.options.theme.lightboxAnimationDuration;
            }
            
            this.options.onOpen();
            
            if (this.options.updatePosition) {
//                if (this.repositioner != null) this.repositioner.stop();
//                this.repositioner = new PeriodicalExecuter(this.reposition.bind(this, zoomedImage), 0.1);

                if (this.repositionEvent) {
                    Event.stopObserving(window, "scroll", this.repositionEvent);
                    Event.stopObserving(window, "resize", this.repositionEvent);                    
                }
                
                this.repositionEvent = this.reposition.bind(this, zoomedImage);
                
                Event.observe(window, "scroll", this.repositionEvent);
                Event.observe(window, "resize", this.repositionEvent);
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
                    delay: delay,
                    queue: { position: "end", scope: "imgzoomer" },
                    duration: duration,
                    afterFinish: this.openCloseBox.bindAsEventListener(this, zoomedImage)
            });
            
            this.findLink(zoomedImage).classNames().add(this.options.theme.activeClass);
            
            // Hide light box in parallel
            if (this.options.useLightbox && this.options.theme.lightboxSequence != 'after') {
                this.showLightBox();
            }
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
