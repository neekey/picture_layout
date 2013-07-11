/**
 * 图片拼接模块
 */
KISSY.add( 'PictureLayout', function( S ){

    /**
     * 图片凭借类
     * @param {Object} cfg
     * @param {Object} cfg.container
     * @param {Array} cfg.list
     * @param {Array} cfg.padding
     * @constructor
     */
    var PicLayout = function( cfg ){

        this.container = S.one( cfg.container );
        this.conHeight = this.container.height();
        this.conWidth = this.container.width();
        this.padding = cfg.padding || 3;
        this.URLList = cfg.list;
        this.imageList = [];
        this.imageLoadCount = 0;
        this.imageLoadTimeout = 2000;
        var self = this;

        /**
         * 载入所有的图片，若出错，或者超时的图片则直接忽略掉
         */
        S.each( this.URLList, function( URL ){

            var image = new Image();
            var timer = setTimeout(function(){
                self.imageLoadCount++;
                self.fire( 'imgLoad' );
            }, self.imageLoadTimeout);

            image.onload = function(){
                clearTimeout(timer);
                self.imageLoadCount++;
                self.imageList.push( {
                    image: image,
                    height: image.height,
                    width: image.width,
                    area: image.height * image.width
                });
                self.fire( 'imgLoad' );
            };

            image.onerror = function(){
                clearTimeout(timer);
                self.imageLoadCount++;
                self.fire( 'imgLoad' );
            };

            image.src = URL;
        });

        this.init();
    };

    S.augment(PicLayout, S.Event.Target);

    PicLayout.prototype.init = function(){

        var self = this;

        this.on( 'imgLoad', function(){
            // 若全部加载完毕
            if( self.imageLoadCount == self.URLList.length ){
                self.fire( 'allLoad' );
            }
        });

        this.on( 'allLoad', function(){
            self.render( self.calculate() );
        });
    };

    /**
     * 计算布局
     */
    PicLayout.prototype.calculate = function( data ){

        data = data || {};
        var height = data.height || this.conHeight;
        var width = data.width || this.conWidth;
        var imageList = data.list || this.imageList;

        // 若只有一张图片了
        if( imageList.length == 1 ){
            return [
                {
                    width: width,
                    height: height,
                    image: imageList[0]
                }
            ];
        }

        var groupA = { area: 0, list: [], totalWidth: 0, totalHeight: 0 };
        var groupB = { area: 0, list: [], totalWidth: 0, totalHeight: 0 };
        var totalArea = imageList[0].area;

        // 对图片面积从大到小排序
        imageList.sort(function( a, b ){
            totalArea += b.area;
            return b.area > a.area;
        });

        // 先对图片进行分组
        S.each(imageList, function( img, index ){

            if( groupA.area >= totalArea / 2 ){
                groupB.area += img.area;
                groupB.list.push( img );
            }
            else if( groupB.area >= totalArea / 2 ){
                groupA.area += img.area;
                groupA.list.push( img );
            }
            else {
                if( index % 2 ==  0 ){
                    groupA.area += img.area;
                    groupA.list.push( img );
                }
                else {
                    groupB.area += img.area;
                    groupB.list.push( img );
                }
            }
        });

        // 根据容器长宽决定布局（横向还是竖向）
        var floatAttr = 'height';
        var floatAttrValue = height;
        var groupFloatAttr = 'totalHeight';
        var fixedAttr = 'width';
        var fixedAttrValue = width;
        var groupFixedAttr = 'totalWidth';
        var floatAttrRadio;

        //  ┌──┐
        //  ├──┤
        //  └──┘
        if( height > width ){
            floatAttr = 'height';
            floatAttrValue = height;
            groupFloatAttr = 'totalHeight';
            fixedAttr = 'width';
            fixedAttrValue = width;
            groupFixedAttr = 'totalWidth';
        }
        //  ┌─┬─┐
        //  └─┴─┘
        else {
            floatAttr = 'width';
            floatAttrValue = width;
            groupFloatAttr = 'totalWidth';
            fixedAttr = 'height';
            fixedAttrValue = height;
            groupFixedAttr = 'totalHeight'
        }

        // 根据图片总体的长宽，将fixedAttr缩放后，看floatAttr的比例
//        S.each(groupA.list, function( img ){
//            groupA.totalWidth += img.width;
//            groupA.totalHeight += img.height;
//        });
//
//        S.each(groupB.list, function( img ){
//            groupB.totalWidth += img.width;
//            groupB.totalHeight += img.height;
//        });
//
//        groupA[ 'changed_' + floatAttr ] = groupA[ groupFloatAttr ] * ( fixedAttrValue / groupA[ groupFixedAttr ] );
//        groupB[ 'changed_' + floatAttr ] = groupB[ groupFloatAttr ] * ( fixedAttrValue / groupB[ groupFixedAttr ] );
//        floatAttrRadio = groupA[ 'changed_' + floatAttr ] / ( groupA[ 'changed_' + floatAttr ] +  groupB[ 'changed_' + floatAttr ] );

        // 根据两边总体面积的比例，来决定中轴的位置
        floatAttrRadio = groupA.area / ( groupA.area +  groupB.area );

        if( floatAttrRadio > 0.65 ){
            floatAttrRadio = 0.65;
        }
        if( floatAttrRadio < 0.35 ){
            floatAttrRadio = 0.35;
        }

        groupA[ 'final_' + floatAttr ] = floatAttrRadio * floatAttrValue;
        groupB[ 'final_' + floatAttr ] = floatAttrValue - groupA[ 'final_' + floatAttr ];

        /**
         * 返回的结果
         */
        var boundA = {};
        var boundAData = {};
        var boundB = {};
        var boundBData = {};

        boundA[ fixedAttr ] = fixedAttrValue;
        boundA[ floatAttr ] = groupA[ 'final_' + floatAttr ];
        boundAData[ fixedAttr ] = boundA[ fixedAttr ];
        boundAData[ floatAttr ] = boundA[ floatAttr ];
        boundAData.list = groupA.list;
        boundA.list = this.calculate( boundAData );

        boundB[ fixedAttr ] = fixedAttrValue;
        boundB[ floatAttr ] = groupB[ 'final_' + floatAttr ];
        boundBData[ fixedAttr ] = boundB[ fixedAttr ];
        boundBData[ floatAttr ] = boundB[ floatAttr ];
        boundBData.list = groupB.list;
        boundB.list = this.calculate( boundBData );

        // 随机决定顺序
        if( Math.random() > 0.5 ){
            return [ boundA, boundB ];
        }
        else {
            return [ boundB, boundA ];
        }

    };

    /**
     * 渲染计算出来的布局
     * @param data
     * @param container
     */
    PicLayout.prototype.render = function( data, container ){
        console.log( data );

        var self = this;
        container = container || this.container;

        S.each( data, function( bound ){

            var box = S.one( '<div class="PL-box"></div>' );
            box.style({
                width: bound.width,
                height: bound.height,
                float: 'left',
                overflow: 'hidden'
            });

            if( bound.image ){
                box.style({
                    width: bound.width - self.padding * 2,
                    height: bound.height - self.padding * 2,
                    border: self.padding + 'px solid white'
                });
                var img = bound.image.image;
                S.one( img ).style(self.resizeImg( img.width, img.height, bound.width, bound.height ));
                S.one( img).style( 'position', 'relative' );
                box.append( img );
            }

            if( bound.list ){
                self.render( bound.list, box );
            }

            container.append( box );
        });
    };

    /**
     * 计算图片的显示尺寸，以最小的缩放比来覆盖空间
     * @param width
     * @param height
     * @param conWidth
     * @param conHeight
     * @returns {{top: number, left: number, width: *, height: *}}
     */
    PicLayout.prototype.resizeImg = function( width, height, conWidth, conHeight ){

        var newWidth = width;
        var newHeight = height;
        var top = 0;
        var left = 0;

        if( width / height > conWidth / conHeight ){
            newHeight = conHeight;
            newWidth = newHeight / height * width;
            left = - ( ( newWidth - conWidth ) / 2 );
        }
        else {
            newWidth = conWidth;
            newHeight = newWidth / width * height;
            top = - ( ( newHeight - conHeight ) / 2 );
        }

        return  {
            top: top,
            left: left,
            width: newWidth,
            height: newHeight
        }
    };

    return PicLayout;
});