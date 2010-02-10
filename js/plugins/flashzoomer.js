Object.extend(Themes.Default, {
    videoPath: "/videos/",
    videoPlayerName: "FLVPlayer_Progressive.swf",
    videoSkinName: "Halo_Skin_3",
    videoFlashVersion: "8,0,0,0",
    videoAutoPlay: false
});

Object.extend(ImgZoomer.plugins, {
    flvPlayer: {
        // setup is used to analyse the anchor element and produce a special content div
        setup: function(zoomer, anchor, zoomedImage) {
            zoomer.srcs = zoomer.srcs || [];
            
            var zoomIndex = zoomer.zoomedImages.index(zoomedImage);
            
            // No src by default
            var src = null;
            
            var regex = new RegExp("^.+\.(flv)");
            if (regex.test(anchor.rel)) {
                // Grab the flv url and size from the href
                var hrefSplit = anchor.rel.split('?');
                
                var flvSrc = hrefSplit[0];
                var queryStringData = hrefSplit[1];
                
                src = { videoStreamName: flvSrc };
                
                // Find the 'd' value in the query string
                if (queryStringData != null) {
                    queryStringData.split('&').each(function(keyValue) {
                        var keyValueSplit = keyValue.split('=');
                        var key = keyValueSplit[0];
                        if (key.toLowerCase() == 'd') {
                            var value = keyValueSplit[1];
                            var size = value.split(',');
                            src.width = size[0];
                            src.height = size[1];
                            
                            zoomer.imageSizes[zoomIndex] = [ src.width, src.height ];
                        }
                    });   
                }
            }
            
            if (src !== null) {
                var contentDiv = new Element("div");

                contentDiv.style.position = "absolute";
                contentDiv.style.cursor = "pointer";
                contentDiv.style.zIndex = zoomer.options.zIndex - 1;
                contentDiv.hide();
                
                zoomer.srcs[zoomIndex] = src;
                
                return contentDiv;
            }
        },
        
        removeContent: function(zoomer, zoomedImage) {
            zoomer.srcs = zoomer.srcs || [];
            
            var index = zoomer.zoomedImages.index(zoomedImage);
            var contentDiv = zoomer.contentDivs[index];
            var src = zoomer.srcs[index];
            
            if (src) {
                contentDiv.childElements().each(function(el) {
                    if (el.parentNode != null) $(el.parentNode).removeChild(el); 
                });
                
                contentDiv.innerHTML = "";
            }
        },
        
        setContent: function(zoomer, element, zoomedImage) {
            if (!zoomer.srcs) return;
            
            var zoomIndex = zoomer.zoomedImages.index(zoomedImage);
            
            // Grab the flv path and size we stored before
            var src = zoomer.srcs[zoomIndex];
            if (src == null) return;
            
            var videoStreamName = src.videoStreamName;
            
            if (videoStreamName) {
                var size = src;
                
                // If no sized specified grab it from the element
                if (size.width === undefined || size.height == undefined) { 
                    size.width = element.getWidth();
                    size.height = element.getHeight();
                } else {
                    zoomedImage.setStyle({
                        width: size.width + 'px',
                        height: size.height + 'px'
                    });   
                }
                
                var videoObject =
                '<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" codebase="http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=' + zoomer.options.theme.videoFlashVersion + '" width="' + size.width + '" height="' + size.height + '" id="FLVPlayer">' +
                '<param name="movie" value="' + zoomer.options.theme.videoPath + zoomer.options.theme.videoPlayerName + '" />' +
                '<param name="salign" value="lt" />' +
                '<param name="quality" value="high" />' +
                '<param name="wmode" value="transparent" />' +
                '<param name="flashvars" value="&amp;MM_ComponentVersion=1&amp;skinName=' + zoomer.options.theme.videoPath + zoomer.options.theme.videoSkinName + '&amp;streamName=' + videoStreamName + '&amp;autoPlay=' + zoomer.options.theme.videoAutoPlay + '&amp;autoRewind=false" />' +
                '<embed src="' + zoomer.options.theme.videoPath + zoomer.options.theme.videoPlayerName + '" flashvars="&amp;MM_ComponentVersion=1&amp;skinName=' + zoomer.options.theme.videoPath + zoomer.options.theme.videoSkinName + '&amp;streamName=' + videoStreamName + '&amp;autoPlay=' + zoomer.options.theme.videoAutoPlay + '&amp;autoRewind=false" quality="high" width="' + size.width + '" height="' + size.height + '" name="FLVPlayer" salign="LT" type="application/x-shockwave-flash" pluginspage="http://www.macromedia.com/go/getflashplayer" wmode="transparent" />' +
                '</embed>' +
                '</object>';

                 element.innerHTML = videoObject;
             }
        }
    }
});