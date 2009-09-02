// precheck if IE
var isIE = (/MSIE (5\.5|6\.)/.test(navigator.userAgent) && navigator.platform == "Win32");

Element.addMethods({ 
    iePNGFix: function(element) {}
});

// Quick helper function to apply shadow to an element
// returns the div holding the shadow elements
Element.addMethods({ 
    applyShadow: function(element, theme) {
        var shadowMe = element.shadowMe;
        if (shadowMe == null) shadowMe = new ShadowMe(theme);
        shadowMe.applyTo(element).appendToDom().show();
        element.shadowMe = shadowMe;
        return shadowMe.shadowHolder;
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

// ShadowMe class that applies shadows to elements
var ShadowMe = Class.create();

// Default ShadowMe options to use
ShadowMe.DefaultOptions = {
    wrapElement: false,
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

    applyTo: function(element, doNotReapply) {
        if (element.complete != null) {
            if (!element.complete) {
                // if applying image to shadow and image width not know yet then wait until it is
                setTimeout(this.applyTo.bind(this, element), 100);
                return this;
            }
        }
        
        var actualElement = element;
        
        // Wrap the target element if required
        // Quite tricky has we have to handle reappling of the shadow 
        // So we don't create a wrapper every time
        if (this.options.wrapElement) {
            var wrapperElement = $(element.parentNode);
            
            if (wrapperElement != null && wrapperElement.hasClassName("shadowMeWrapper")) {
                element = element.remove();
                wrapperElement.insert({ after: element });
                wrapperElement.remove();
            }
            
            wrapperElement = new Element("div", { "class": "shadowMeWrapper" });
            element.wrap(wrapperElement);
            
            element = wrapperElement;
        }
        
        var absolutePosition = element.cumulativeOffset();
        var shadows = this.shadowHolder.childElements();        
        
        if (element.getStyle("position") != "absolute") {
            element.style.position = "relative";
        }
        
        if (element.getStyle("zIndex") != "" && element.getStyle("zIndex") != null) {
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
            
        if (this.element != actualElement && !doNotReapply) {
//          if (this.timer) this.timer.stop();
//          this.timer = new PeriodicalExecuter(this.applyTo.bind(this, element), 0.1);
            if (this.applier) {
                Event.stopObserving(window, "scroll", this.applier);
                Event.stopObserving(window, "resize", this.applier);   
            }
            
            this.applier = this.applyTo.bind(this, actualElement, true);
            
            Event.observe(window, "scroll", this.applier);
            Event.observe(window, "resize", this.applier);
        }
        
        this.element = actualElement;

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