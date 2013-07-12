KISSY.ready(function( S ){

    var imageURLList = [
        'http://farm8.staticflickr.com/7358/9248428534_cc1c1552af_z.jpg',
        'http://farm8.staticflickr.com/7441/9249700680_e29f31e5c2_b.jpg',
        'http://farm6.staticflickr.com/5498/9247412642_a76fe450a1_c.jpg',
        'http://farm4.staticflickr.com/3829/9248558901_1904e2ec6d.jpg',
        'http://farm8.staticflickr.com/7426/9246464121_670d644ae0.jpg',
        'http://farm4.staticflickr.com/3816/9244666011_2f15598496_z.jpg',
        'http://farm4.staticflickr.com/3741/9248125760_0aa3093911_b.jpg',
        'http://farm6.staticflickr.com/5544/9246868379_bf54ffe167.jpg',
        'http://farm4.staticflickr.com/3775/9247413450_17aa6e2ee7_c.jpg',
        'http://farm4.staticflickr.com/3715/9245130583_a069b5987d_b.jpg'
    ];

    var imageURLIpt = S.one( '.J_PLImageURL' );
    var addNewImage = S.one( '.J_PLAddImage' );
    var imageList = S.one( '.J_PLImageList' );
    var PLContainer = S.one( '.J_PLContainer' );
    var layoutImage = S.one( '.J_PLLayoutImage' );

    // 将默认图片加入到列表
    S.each( imageURLList, function( url ){
        addImageItemToList( url );
    });

    addNewImage.on( 'click', function(e){
        e.preventDefault();
        var url = imageURLIpt.val();
        imageURLIpt.val('');

        if( url ){
            // 保存到内存中
            imageURLList.push( url );
            // 在imageList中添加节点
            addImageItemToList( url );
            // DEBUG：将内存中的图片输出
            console.log(imageURLList);
        }
        else {
            alert( '图片地址不能为空!' );
        }
    });

    layoutImage.on( 'click', function(e){
        e.preventDefault();

        PLContainer.html( '' );

        S.use('PictureLayout', function( S, PicLayout){
            new PicLayout( { container: PLContainer, list: imageURLList });
        });
    });

    function addImageItemToList( url ){
        imageList.append('<li><img src="' + url + '" alt="图片"></li>');
    }

});
