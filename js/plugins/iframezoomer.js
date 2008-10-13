Object.extend(ImgZoomer.DefaultOptions, {
    width: 320,
    height: 240,
    suffix: "iframe"
});

Object.extend(ImgZoomer.plugins, {
    iframe: {
        // setup is used to analyse the anchor element and produce a special content div
        setup: function(zoomer, anchor, zoomedImage) {
            zoomer.iframeSrcs = zoomer.iframeSrcs || [];

            if (anchor.href.indexOf(zoomer.options.suffix + "=" + 1) != -1) {
                var contentDiv = new Element("div");

                contentDiv.style.position = "absolute";
                contentDiv.style.cursor = "pointer";
                contentDiv.style.zIndex = zoomer.options.zIndex - 1;
                contentDiv.hide();
                
                setTimeout(function(zoomer, zoomedImage) {
                    var borderLeft = parseInt(zoomedImage.getStyle('borderLeftWidth'));

                    borderLeft = isNaN(borderLeft) ? 0 : borderLeft;

                    var borderRight = parseInt(zoomedImage.getStyle('borderRightWidth'));
                    borderRight = isNaN(borderRight) ? 0 : borderRight;

                    var borderTop = parseInt(zoomedImage.getStyle('borderTopWidth'));
                    borderTop = isNaN(borderTop) ? 0 : borderTop;

                    var borderBottom = parseInt(zoomedImage.getStyle('borderBottomWidth'));
                    borderBottom = isNaN(borderBottom) ? 0 : borderBottom;

                    zoomedImage.width = zoomer.options.width - borderLeft - borderRight;
                    zoomedImage.height = zoomer.options.height - borderBottom - borderTop;

                    var zoomIndex = zoomer.zoomedImages.index(zoomedImage);
                    zoomer.iframeSrcs[zoomIndex] = anchor.href;  
                }.bind(this, zoomer, zoomedImage), 1);
                
                return contentDiv;
            }
        },
        
        removeContent: function(zoomer, zoomedImage) {
            zoomer.iframeSrcs = zoomer.iframeSrcs || [];
            
            var index = zoomer.zoomedImages.index(zoomedImage);
            var contentDiv = zoomer.contentDivs[index];
            var src = zoomer.iframeSrcs[index];
            
            if (src) {
                contentDiv.childElements().each(function(el) {
                    if (el.parentNode != null) $(el.parentNode).removeChild(el); 
                });
                
                contentDiv.innerHTML = "";
            }
        },
        
        setContent: function(zoomer, element, zoomedImage) {
            if (!zoomer.iframeSrcs) return;
            
            var zoomIndex = zoomer.zoomedImages.index(zoomedImage);
            var iframeSrc = zoomer.iframeSrcs[zoomIndex];

            if (iframeSrc) {
                element.show();
            
                var size = { width: zoomer.options.width, height: zoomer.options.height };
                var iframeObject =
                '<iframe width="' + size.width + '" height="' + size.height + '" frameborder="0" scrolling="no" marginheight="0" marginwidth="0" src="' + iframeSrc + '"></iframe>';

                 element.innerHTML = iframeObject;
             }
        }
    }
});