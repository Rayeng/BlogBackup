title: Hexo个人网站搭建——基础and相册篇
date: 2017-07-05 21:12:05
tags:
- HEXO
---

折腾了一段时间，Blog基本的东西也都弄好了，之前也写过开篇，不过信息量太少，这次完善一下，提供搭建参考，有兴趣可以自己建个网站玩玩。
本Blog主要是基于Hexo+Yilia+Coding Page搭建，主要涉及的一些东西也是前端开发相关的，非常基础，工具和Yilia大部分都已经支持ok。
<!-- more -->

## 基础搭建
Hexo博客搭建基本原理是Hexo本地生成静态网页，然后托管到Coding、GitHub上，启动Page服务即可，最基础搭建可参考liuyan的博文。[Liu Yan关于使用Hexo+gitcafe搭建个人博客](http://yanliu.org/2015/08/07/Hexo%E6%90%AD%E5%BB%BA%E4%B8%AA%E4%BA%BA%E5%8D%9A%E5%AE%A2/http://yanliu.org/2015/08/07/Hexo%E6%90%AD%E5%BB%BA%E4%B8%AA%E4%BA%BA%E5%8D%9A%E5%AE%A2/)

博客页面主题选择，liuyan使用的是[Next](https://github.com/iissnan/hexo-theme-next)主题，我使用的是[Yilia](https://github.com/litten/hexo-theme-yilia)主题，都是排名前列的，大家可以根据自己爱好选择，把相应的主题clone放到themes目录即可。

域名选择，可以直接选择使用Coding的域名，也可以购买一个域名，域名的购买可以选择阿里云，我买的100/3year，然后在域名管理界面创建一个cname指向[Coding网站](https://coding.net)即可，这个在[coding官方文档](https://coding.net/help/doc/pages/index.html)有指导，另Coding需要用户绑定手机号才能自定义域名。

小功能：
网站访问量统计:[不蒜子-关于访问量统计工具](http://ibruce.info/2015/04/04/busuanzi/)
网页加密：[使用AES算法加密hexo文章](https://crackcer.com/hexo-aes-password.html)

## 相册搭建
对于Hexo静态网页来说，定位主要是文本，也不可能把大量的照片托管到Coding上，因此要搭建一个相册，就必须选择一个图床，我选择的是七牛，对个人用户来说足够。把照片上传到七牛，然后在你的网站调用显示。
[我的Blog相册](http://www.rayblog.cn/album)大部分样式参考的是Yilia主题作者[Litten](http://litten.me/photos)的,主要做了一些小修改，和添加。

第一步：把照片片上传到七牛，可以手动上传，也可以选择使用写js自动上传，七牛有完整的[SDK接口文档](https://developer.qiniu.com/sdk#official-sdk)，可以参考，很清晰。
上传脚本如下,最终生成json信息：

```
    const fs = require("fs");
    const path = "./";
    var qiniu = require("qiniu");
    var config = new qiniu.conf.Config();
    // 空间对应的机房
    config.zone = qiniu.zone.Zone_z0;

    //需要填写你的 Access Key 和 Secret Key
    qiniu.conf.ACCESS_KEY = 'yourakey';
    qiniu.conf.SECRET_KEY = 'yourskey';
	
    var mac = new qiniu.auth.digest.Mac(qiniu.conf.ACCESS_KEY, qiniu.conf.SECRET_KEY);

    //要上传的空间
    bucket = 'yourspace';

    var options = {
       scope: bucket
    }	

    //构建上传策略函数
    function uptoken(options) {
      var putPolicy = new qiniu.rs.PutPolicy(options);
      return putPolicy.uploadToken(mac);;
    }

    //构造上传函数
    function uploadFile(uptoken, key, localFile) {
        var formUploader = new qiniu.form_up.FormUploader(config);
        var extra = new qiniu.form_up.PutExtra();
        formUploader.putFile(uptoken, key, localFile, extra, function(err, ret) {
          if(!err) {
            // 上传成功， 处理返回值
            console.log('upload success : ',ret.hash, ret.key);
          } else {
            // 上传失败， 处理返回代码
            console.log(err);
          }
      });
    }

    /**
     * 读取文件后缀名称，并转化成小写
     * @param file_name
     * @returns
     */
    function getFilenameSuffix(file_name) {
      if(file_name=='.DS_Store'){
        return '.DS_Store';
      }
        if (file_name == null || file_name.length == 0)
            return null;
        var result = /\.[^\.]+/.exec(file_name);
        return result == null ? null : (result + "").toLowerCase();
    }


    fs.readdir(path, function (err, files) {
        if (err) {
            return;
        }
        var arr = [];
        (function iterator(index) {
            if (index == files.length) {
                fs.writeFile("./tibet.json", JSON.stringify(arr, null, "\t"));
                return;
            }

            fs.stat(path + "/" + files[index], function (err, stats) {
                if (err) {
                    return;
                }
                if (stats.isFile()) {
                  var suffix = getFilenameSuffix(files[index]);
                  if(!(suffix=='.js'|| suffix == '.DS_Store'|| suffix == '.json')){
                    //要上传文件的本地路径
                    filePath = path+'/'+files[index];
                    console.log('抓取到文件: '+files[index]);
                    //上传到七牛后保存的文件名
                    key = files[index];
                    //生成上传 Token
                    token = uptoken(options);
                    // 异步执行
                    uploadFile(token, key, filePath);
                    arr.push(files[index]);
                }

                          }
                iterator(index + 1);
            })
        }(0));
    });
```

第二步：把生成的json文件，使用js，插入到网页中；
在相应相册的index.md里面插入下面代码：（fancybox使用fancybox3）
```
<link type="text/css" href="/ins.css" rel="stylesheet">
<link type="text/css" href="/jquery.fancybox.css" rel="stylesheet">

<div class="instagram">
    <section class="archives album">
	    <ul class="img-box-ul">
	    </ul>
    </section>
</div>

<script src="https://code.jquery.com/jquery-3.2.1.min.js"></script>
<script src="/jquery.lazyload.js"></script>
<script src="/jquery.fancybox.js"></script>
<script src="../photos.js"></script>

<script>
	var that = this;
	$.getJSON("tibet.json", function (data) {
		that.render(that.page, data);
	});
</script>
```
photos.js代码如下：
```
	var render = function(page, data){
		var img = "";
		for (var i = 0; i < data.length; i++) {
			img += '<li><div class="img-box">' + '<a class="img-bg " rel="example_group" data-fancybox="images" href="http://yourqiniu.url.com/' + data[i] + '"></a>' + '<img lazy-src="http://yourqiniu.url.com/' + data[i] + '" />'  + '</div></li>';
			//img += '<img src="http://yourqiniu.url.com/' + data[i] + '" />';
		}
		$(".img-box-ul").append(img);
		$(".img-box-ul").lazyload();
		$("a[rel=example_group]").fancybox();
	}
	
```

第三步：修改相关样式，调试；
样式是基于Yilia样式进行修改的，原名字也未动，[样式链接，点击查看....](http://www.rayblog.cn/ins.css)

第四步：相册分文件夹：
Hexo的Source\album目录下，是可以自己创建更多深层目录的，以此可以实现分文件夹，具体代码样式请看[我的相册](http://www.rayblog.cn/album)

## 结束语
目前折腾的东西都比较简单，大家可以尝试探索，互相学习，完善自己的网站，欢迎常访问！

## 参考资料
* [ Hexo官方文档](https://hexo.io/zh-cn/)
* [ Coding官方文档](https://coding.net/help/)
* [ Yilia主题](https://github.com/litten/hexo-theme-yilia)
* [ Markdown语法说明文档](http://www.appinn.com/markdown/)
* [ Liu Yan关于使用Hexo+gitcafe搭建个人博客](http://yanliu.org/2015/08/07/Hexo%E6%90%AD%E5%BB%BA%E4%B8%AA%E4%BA%BA%E5%8D%9A%E5%AE%A2/http://yanliu.org/2015/08/07/Hexo%E6%90%AD%E5%BB%BA%E4%B8%AA%E4%BA%BA%E5%8D%9A%E5%AE%A2/)
* [ Fens关于使用Hexo+github搭建一个web应用](http://blog.fens.me/hexo-blog-github/)
* [ 不蒜子](http://ibruce.info/2015/04/04/busuanzi/)
* [ 使用AES算法加密hexo文章](https://crackcer.com/hexo-aes-password.html)
* [ hexo博客进阶－相册和独立域名](http://www.cnblogs.com/jarson-7426/p/5515870.html)
* [ Hexo折腾记——基本配置篇](https://m.aliyun.com/yunqi/articles/8607?spm=5176.100239.0.0.tgnWEu)

## <!-- -->
**转载请注明出处：[www.rayblog.cn](http://www.rayblog.cn)**<span style="float: right;" id="busuanzi_container_page_pv">浏览量[ <span id="busuanzi_value_page_pv"></span> ]</span>	