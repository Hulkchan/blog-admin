<template lang='html'>
    <section class='uploadImg'>
        <el-tabs v-model="activeName">
            <el-tab-pane label="本地上传" name="localImg">
                <div class="upload_wrap">
                    <!--上传图片后显示的内容-->
                    <draggable :list="imgObj.imgList" class="img_Box" v-if="imgObj.imgList.length!==0">
                        <div class="img_Box_item" v-for="(item,index) in imgObj.imgList">
                            <img :src="item">
                            <div class="img_Box_tools">
                                <i class="el-icon-zoom-in" @click.stop="toBig(item)"></i>
                                <i class="el-icon-delete ml-10" @click.stop="removeImg(item,index)"></i>
                            </div>
                        </div>
                    </draggable>
                    <!--上传图片组件-->
                    <div class="img_uplod">
                        <el-upload
                            v-if="!imgNumLimit || imgObj.imgList.length < imgNumLimit"
                            class="edit-drag__upload"
                            :class="imgObj.imgList.length!==0?'has_imgs':''"
                            drag
                            multiple
                            :show-file-list="false"
                            :action="fileUpload"
                            :on-success="handleImgSuccess"
                            :before-upload="beforeCoverUpload"
                            multiple>
                            <i class="el-icon-plus" v-if="imgObj.imgList.length!==0"></i>
                            <i class="el-icon-upload" v-if="imgObj.imgList.length===0"></i>
                            <div class="el-upload__text" v-if="imgObj.imgList.length===0">将文件拖到此处，或<em>点击上传</em></div>
                            <div class="el-upload__tip" slot="tip" v-if="imgObj.imgList.length===0">只能上传jpg/png文件</div>
                        </el-upload>
                        <div class="el-upload__tip" slot="tip" v-if="imgObj.imgList.length!==0">只能上传jpg/png文件</div>
                    </div>
                    <div class="upload_button mt-10">
                        <el-button type="primary" size="small" @click="insertImg" v-if="!noSubmit">确定插入</el-button>
                    </div>
                </div>
            </el-tab-pane>
            <el-tab-pane label="网络图上传" name="webImg">
                <div class="upload_wrap">

                </div>
            </el-tab-pane>
        </el-tabs>
        <!--图片放大 Begin-->
        <el-dialog :visible.sync="dialogVisible">
            <div class="img_toBig--wrap">
                <img class="img_toBig" :src="dialogImageUrl">
            </div>
        </el-dialog>
        <!--图片缩小 End-->
    </section>
</template>

<script>
import {
    uploadUrl
} from '@/api/api'
import draggable from 'vuedraggable'

export default {
    name: 'uploadImg',
    components: {
        draggable
    },
    props: {
        noSubmit: {
            type: Boolean,
            default: false
        },
        imgNumLimit: {
            type: Number
        }
    },
    data() {
        return {
            activeName: 'localImg',
            imgObj: {
                imgList: []
            },
            fileUpload: '',
            dialogImageUrl: '',
            dialogVisible: false
        }
    },
    mounted() {
        this.fileUpload = uploadUrl
    },
    methods: {
        toBig(url) {
            this.dialogImageUrl = url
            this.dialogVisible = true
        },
        removeImg(url) {
            var _this = this
            _this.imgObj.imgList.forEach((item, index) => {
                if (item === url) {
                    _this.imgObj.imgList.splice(index, 1)
                }
            })
        },
        handleImgSuccess(response, file, fileList) {
            if (this.imgNumLimit && this.imgObj.imgList.length >= this.imgNumLimit) {
                this.$message.warning(`当前限制最多上传 ${this.imgNumLimit} 个文件`)
                return false
            }
            this.imgObj.imgList.push(response.result.url)
        },
        beforeCoverUpload() {

        },
        insertImg() {
            this.$emit('handleSubmit', this.imgObj.imgList)
        }
    }
}

</script>
<style lang='scss' scoped='scoped'>
.upload_wrap{
    min-height: 200px;
}
.img_Box {
    display: flex;
    flex-wrap: wrap;
    .img_Box_item {
        background-color: #ccc;
        width: 100px;
        height: 100px;
        line-height: 100px;
        text-align: center;
        font-size: 20px;
        color: #fff;
        margin-right: 6px;
        margin-bottom: 6px;
        cursor: pointer;
        position: relative;
        img {
            width: 100%;
            height: 100%;
        }
        &:hover .img_Box_tools {
            visibility: visible;
        }
        .img_Box_tools {
            position: absolute;
            width: 100%;
            height: 100%;
            background-color: rgba(0,0,0,0.6);
            top: 0;
            left: 0;
            visibility: hidden;
        }
    }
}
// 图片放大
.img_toBig--wrap{
    display: flex;
    justify-content: center;
    align-items: center;
    .img_toBig{
        max-width: 100%;
        max-height: 100%;
    }
}
</style>