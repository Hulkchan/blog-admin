<template lang='html'>
    <section class='addcontent'>
        <el-row :gutter="10">
            <el-form ref="form" :model="form" status-icon :rules="rules">
                <el-col :span="16">
                    <el-card shadow="never">
                        <el-form-item prop="title" style="margin-bottom:0" :show-message="false">
                            <div class="title_wrap" :class="fullscreen?'fullscreen':''">
                                <el-input v-model="form.title" placeholder="请输入标题" size="large"></el-input>
                                <el-button type="primary" 
                                        class="submit-button" 
                                        @click="postArticle"
                                        :loading="loading.save">发布</el-button>
                                <el-button @click="resetForm">清空</el-button>
                            </div>
                        </el-form-item>
                        <markdown-editor v-model="form.content" 
                                        ref="markdownEditor" 
                                        class="simplemde_editor mt-10"
                                        :configs="config"
                                        :highlight="true"
                                        previewClass="markdown-body"></markdown-editor>
                    </el-card>
                </el-col>
                <el-col :span="8">
                    <el-card shadow="never">
                        <el-row class="mt-10">
                            <div class="flex-div">
                                <div class="inline-label">关键字：</div>
                                <div class="inline-content">
                                    <el-form-item prop="keywords" style="margin-bottom:0" :show-message="false">
                                        <el-tag
                                            style=""
                                            :key="tag"
                                            v-for="tag in form.keywords"
                                            closable
                                            :disable-transitions="false"
                                            @close="handleClose(tag)">
                                            {{tag}}
                                        </el-tag>
                                        <el-input
                                            class="input-new-tag"
                                            v-if="inputVisible"
                                            v-model="inputValue"
                                            ref="saveTagInput"
                                            size="small"
                                            @keyup.enter.native="handleInputConfirm"
                                            @blur="handleInputConfirm">
                                        </el-input>
                                        <el-button v-else class="button-new-tag" size="small" @click="showInput">新增标签</el-button>
                                    </el-form-item>
                                </div>
                            </div>
                        </el-row>
                        <el-row class="mt-10">
                            <el-form-item prop="tag" label="标签：" style="margin-bottom:0" :show-message="false">
                                <el-select v-model="form.tag" multiple filterable clearable placeholder="请选择">
                                    <el-option
                                        v-for="item in tags"
                                        :key="item._id"
                                        :label="item.name"
                                        :value="item._id">
                                    </el-option>
                                </el-select>
                            </el-form-item>
                        </el-row>
                        <el-row class="mt-10">
                            <div class="flex-div">
                                <div class="inline-label">描述：</div>
                                <div class="inline-content">
                                    <el-form-item prop="description" style="margin-bottom:0">
                                        <el-input
                                            type="textarea"
                                            :autosize="{ minRows: 2, maxRows: 4}"
                                            placeholder="请输入描述"
                                            v-model="form.description">
                                        </el-input>
                                    </el-form-item>   
                                </div>
                            </div>
                        </el-row>
                        <el-row class="mt-10">
                            <upload-img :noSubmit="true" 
                                        ref="coverList"
                                        :imgNumLimit="3"></upload-img>
                        </el-row>
                    </el-card>
                </el-col>
            </el-form>
        </el-row>
        <el-dialog :visible.sync="dialogTableVisible" width="30%">
            <upload-img @handleSubmit="insertImg" v-if="dialogTableVisible"></upload-img>
        </el-dialog>
    </section>
</template>

<script>
import hljs from 'highlight.js'
import 'simplemde/dist/simplemde.min.css'
import 'highlight.js/styles/github-gist.css'
import markdownEditor from 'vue-simplemde/src/markdown-editor'
import uploadImg from '@/components/uploadImg'

import {
    postArticle,
    getTags,
    getArticleById,
    putArticle
} from '@/api/api'

window.hljs = hljs
export default {
    components: {
        markdownEditor,
        uploadImg
    },
    data() {
        const _this = this
        function uploadImg() {
            _this.dialogTableVisible = true
        }
        // 关键词规则
        const checkKeyword = (rule, value, callback) => {
            if (!value || value.length === 0) {
                this.$message({
                    message: '请填写关键字',
                    type: 'warning'
                })
                return callback(new Error(''))
            } else {
                callback()
            }
        }
        return {
            publishStatus: 'create',
            form: {
                title: '',
                keywords: [],
                keyword: '',
                description: '',
                tag: [],
                content: '',
                thumb: '',
                id: ''
            },
            articleStorage: 'article',
            tags: [],
            // 关键字
            inputVisible: false,
            inputValue: '',
            simplemde: null,
            dialogTableVisible: false,
            loading: {
                save: false
            },
            config: {
                // 编辑器是带有顶部工具栏的但是在国内要么访问慢
                // 所以需要再配置中设置自动下载字体图标为false
                autoDownloadFontAwesome: false,
                // 拼写检测
                spellChecker: false,
                // 代码高亮
                codeSyntaxHighlighting: true,
                // 顶部工具栏
                toolbar: [
                    'bold',
                    'fullscreen',
                    'preview',
                    'side-by-side',
                    'quote',
                    {
                        name: 'uploadImage',
                        action: uploadImg,
                        className: 'fa fa-picture-o',
                        title: 'Upload Image'
                    }
                ]
            },
            interval: null,
            rules: {
                title: [{
                    required: true,
                    message: '请输入标题',
                    trigger: 'blur'
                }, {
                    min: 5,
                    max: 50,
                    message: '长度在 5 到 50 个字符',
                    trigger: 'blur'
                }],
                keywords: [{
                    validator: checkKeyword,
                    trigger: 'blur'
                }],
                tag: [{
                    required: true,
                    message: '请选择标签',
                    trigger: 'change'
                }]
            }
        }
    },
    mounted() {
        this.$nextTick(() => {
            this.simplemde = this.$refs.markdownEditor.simplemde
        })
        this.getTags()
        this.interval = setInterval(() => {
            this.autoSave()
        }, 5000)
    },
    methods: {
        // 插入上传好的图片至编辑器
        insertImg(text) {
            this.dialogTableVisible = false
            const simplemde = this.$refs.markdownEditor.simplemde
            text.forEach(item => {
                simplemde.codemirror.replaceSelection(
                    '![](' + item + ')' + '<br>'
                )
            })
        },
        // 关键字添加
        handleInputConfirm() {
            const inputValue = this.inputValue
            if (inputValue) {
                this.form.keywords.push(inputValue)
            }
            this.inputVisible = false
            this.inputValue = ''
        },
        handleClose(tag) {
            this.form.keywords.splice(this.form.keywords.indexOf(tag), 1)
        },
        showInput() {
            this.inputVisible = true
            this.$nextTick(_ => {
                this.$refs.saveTagInput.$refs.input.focus()
            })
        },
        // 获取标签
        getTags() {
            const params = {
                current_page: 1,
                page_size: 9999,
                keyword: ''
            }
            getTags(params).then(res => {
                const data = res.data
                if (data.code === 1) {
                    this.tags = data.result.list
                    if (!this.$route.query.id) {
                        this.fillContent()
                    }
                    this.editContentShow()
                }
            })
        },
        // 检测自动保存，自动填充
        fillContent() {
            const article = localStorage.getItem(this.articleStorage)
            if (article) {
                this.form = Object.assign({}, JSON.parse(article).form)
                this.publishStatus = JSON.parse(article).publishStatus
                this.$refs.coverList.imgObj.imgList = this.form.thumb ? this.form.thumb.split(',') : []
            }
        },
        // 自动保存
        autoSave() {
            const saveForm = Object.assign({}, this.form)
            const saveContent = {
                form: saveForm,
                publishStatus: this.publishStatus
            }
            localStorage.setItem(this.articleStorage, JSON.stringify(saveContent))
        },
        // 通过id获取文章内容
        getArticleById(id) {
            const params = {
                id: id
            }
            getArticleById(params).then(res => {
                const data = res.data
                if (data.code === 1) {
                    for (const key in this.form) {
                        if (data.result[key]) {
                            this.form[key] = data.result[key]
                        }
                    }
                    this.form.id = data.result._id
                    this.form.tag = data.result.tag._id
                    this.form.keywords = data.result.keyword.split(',')
                    this.$refs.coverList.imgObj.imgList = this.form.thumb ? this.form.thumb.split(',') : []
                }
            })
        },
        // 编辑回显
        editContentShow() {
            const _id = this.$route.query.id
            if (_id) {
                this.publishStatus = 'edit'
                this.getArticleById(_id)
            }
        },
        // 新增文章
        postArticle() {
            this.$refs.form.validate((valid) => {
                if (valid) {
                    if (!this.form.content) {
                        this.$message({
                            message: '请填写正文',
                            type: 'warning'
                        })
                        return false
                    }
                    this.$confirm('您确定要发布这篇文章吗?', '提示', {
                        type: 'warning'
                    }).then(() => {
                        this.loading.save = true
                        if (this.publishStatus === 'create') {
                            this.form.thumb = this.$refs.coverList.imgObj.imgList.join(',')
                            this.form.keyword = this.form.keywords.join(',')
                            const params = Object.assign({}, this.form)
                            postArticle(params).then(res => {
                                const data = res.data
                                if (data.code === 1) {
                                    this.$notify({
                                        title: '成功',
                                        message: data.message,
                                        type: 'success'
                                    })
                                    this.resetForm()
                                }
                                this.loading.save = false
                            })
                        } else if (this.publishStatus === 'edit') {
                            const params = {
                                param: {
                                    title: this.form.title,
                                    keyword: this.form.keywords.join(','),
                                    thumb: this.$refs.coverList.imgObj.imgList.join(','),
                                    content: this.form.content,
                                    tag: this.form.tag,
                                    description: this.form.description
                                },
                                id: this.$route.query.id
                            }
                            putArticle(params).then(res => {
                                const data = res.data
                                if (data.code === 1) {
                                    this.$notify({
                                        title: '成功',
                                        message: data.message,
                                        type: 'success'
                                    })
                                    this.resetForm()
                                }
                                this.loading.save = false
                            })
                        }
                    })
                }
            })
        },
        resetForm() {
            this.publishStatus = 'create'
            this.$refs.form.resetFields()
            // 清空图片
            this.form.thumb = ''
            this.$refs.coverList.imgObj.imgList = []
            // 清空正文
            this.form.content = ''
            localStorage.removeItem(this.articleStorage)
        }
    },
    computed: {
        fullscreen() {
            if (this.simplemde) {
                return this.simplemde.isFullscreenActive()
            } else {
                return false
            }
        }
    },
    destroyed() {
        clearInterval(this.interval)
    }
}
</script>
<style lang='scss' scoped='scoped'>
.title_wrap {
    display: flex;
    justify-content: space-between;
    &.fullscreen {
        width: 100%;
        position: fixed;
        top: 0;
        left: 0;
        z-index: 1004;
        padding: 6px;
        background-color: #fff;
    }
}
.submit-button {
    margin-left: 10px;
}
.flex-div {
    display: flex;
    align-items: center;
    .inline-label {
        font-size: 14px;
        display: inline-block;
        color: #606266;
        min-width: 54px;
        font-weight: 700;
    }
    .inline-content {
        flex: 1;
    }
}
.el-tag {
    margin-right: 4px;
    min-height: 24px;
    height: auto;
    white-space: normal;
    word-break: break-all;
    max-width: 200px;
    margin-bottom: 4px;
}
.button-new-tag {
    height: 30px;
    line-height: 30px;
    padding-top: 0;
    padding-bottom: 0;
}
.input-new-tag {
    width: 90px;
    margin-left: 10px;
    vertical-align: bottom;
}
</style>
