	
	var render = function(page, data){
		var img = "";
		for (var i = 0; i < data.length; i++) {
			img += '<li><div class="img-box">' + '<a class="img-bg " rel="example_group" data-fancybox="images" href="http://7xodcg.com1.z0.glb.clouddn.com/' + data[i] + '"></a>' + '<img lazy-src="http://7xodcg.com1.z0.glb.clouddn.com/' + data[i] + '" />'  + '</div></li>';
			//img += '<img src="http://7xodcg.com1.z0.glb.clouddn.com/' + data[i] + '" />';
		}
		$(".img-box-ul").append(img);
		$(".img-box-ul").lazyload();
		$("a[rel=example_group]").fancybox();
	}
	

