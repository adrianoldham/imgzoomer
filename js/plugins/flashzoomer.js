Object.extend(Themes.Default, {
    videoPath: "/video/",
    videoPlayerName: "FLVPlayer_Progressive.swf",
    videoSkinName: "Halo_Skin_3",
    videoAutoPlay: false
});

Object.extend(ImgZoomer.plugins, {
    flvPlayer: {
        // setup is used to analyse the anchor element and produce a special content div
        setup: function(zoomer, anchor, zoomedImage) {
            zoomer.srcs = zoomer.srcs || [];
            
            if (["flv"].include(anchor.rel.toLowerCase().split('.').last())) {
                var contentDiv = new Element("div");

                contentDiv.style.position = "absolute";
                contentDiv.style.cursor = "pointer";
                contentDiv.style.zIndex = zoomer.options.zIndex - 1;
                contentDiv.hide();
                
                var zoomIndex = zoomer.zoomedImages.index(zoomedImage);
                zoomer.srcs[zoomIndex] = anchor.rel;
                
                return contentDiv;
            }
        },
        
        setContent: function(zoomer, element, zoomedImage) {
            var zoomIndex = zoomer.zoomedImages.index(zoomedImage);
            var videoStreamName = zoomer.srcs[zoomIndex];
            var size = { width: element.getWidth(), height: element.getHeight() };

            var videoObject =
            '<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" codebase="http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=8,0,0,0" width="' + size.width + '" height="' + size.height + '" id="FLVPlayer">' +
            '<param name="movie" value="' + zoomer.options.theme.videoPath + zoomer.options.theme.videoPlayerName + '" />' +
            '<param name="salign" value="lt" />' +
            '<param name="quality" value="high" />' +
            '<param name="wmode" value="transparent" />' +
            '<param name="flashvars" value="&MM_ComponentVersion=1&skinName=' + zoomer.options.theme.videoPath + zoomer.options.theme.videoSkinName + '&streamName=' + videoStreamName + '&autoPlay=' + zoomer.options.theme.videoAutoPlay + '&autoRewind=false" />' +
            '<embed src="' + zoomer.options.theme.videoPath + zoomer.options.theme.videoPlayerName + '" flashvars="&MM_ComponentVersion=1&skinName=' + zoomer.options.theme.videoPath + zoomer.options.theme.videoSkinName + '&streamName=' + videoStreamName + '&autoPlay=' + zoomer.options.theme.videoAutoPlay + '&autoRewind=false" quality="high" width="' + size.width + '" height="' + size.height + '" name="FLVPlayer" salign="LT" type="application/x-shockwave-flash" pluginspage="http://www.macromedia.com/go/getflashplayer" wmode="transparent" />' +
            '</embed>' +
            '</object>';

             element.innerHTML = videoObject;
        }
    }
});