Object.extend(ImgZoomer.plugins, {
    html: {
        setup: function(zoomer, anchor, zoomedImage) {
            zoomer.elements = zoomer.elements || [];
            var element = $(anchor.href.substring(anchor.href.lastIndexOf("#") + 1));
            
            if (element) {            
                var contentDiv = new Element("div");
                
                contentDiv.style.position = "absolute";
                contentDiv.style.top = "0px";
                contentDiv.style.zIndex = zoomer.options.zIndex - 1;
                contentDiv.hide();
                
                var zoomIndex = zoomer.zoomedImages.index(zoomedImage);
                zoomer.elements[zoomIndex] = element;
                
                return contentDiv;
            }
        },
        
        removeContent: function(zoomer, zoomedImage) {
        },
        
        setContent: function(zoomer, element, zoomedImage) {
            var zoomIndex = zoomer.zoomedImages.index(zoomedImage);
            var htmlElement = zoomer.elements[zoomIndex];
            
            if (htmlElement) {
                element.appendChild(htmlElement);
                
                htmlElement.style.overflow = "auto";
                htmlElement.style.display = "block";
            }
        }
    }
});