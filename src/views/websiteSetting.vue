<template lang='html'>
    <section class='websiteSetting'>
        <el-row>
            <el-col :span="16">
                <el-form label-position="right"
                         :rules="rules"
                         ref="ruleForm"
                         :model="form">
                    <el-form-item label="网站标题" prop="title" :label-width="labelWidth">
                        <el-input v-model.trim="form.title" placeholder="请输入网站标题"></el-input>
                    </el-form-item>
                    <el-form-item label="网站副标题" prop="sub_title" :label-width="labelWidth">
                        <el-input v-model.trim="form.sub_title" placeholder="请输入副网站标题"></el-input>
                    </el-form-item>
                    <el-form-item label="网站关键字" prop="keyword" :label-width="labelWidth">
                        <el-input v-model.trim="form.keyword" placeholder="请输入副网站标题"></el-input>
                    </el-form-item>
                    <el-form-item label="站点网址" prop="url" :label-width="labelWidth">
                        <el-input v-model.trim="form.url" placeholder="请输入站点网址"></el-input>
                    </el-form-item>
                    <el-form-item label="网站官邮" prop="email" :label-width="labelWidth">
                        <el-input v-model.trim="form.email" placeholder="请输入网站官邮"></el-input>
                    </el-form-item>
                    <el-form-item label="ICP" prop="icp" :label-width="labelWidth">
                        <el-input v-model.trim="form.icp" placeholder="请输入ICP备案号"></el-input>
                    </el-form-item>
                    <el-form-item label="网站描述" prop="description" :label-width="labelWidth">
                        <el-input
                            type="textarea"
                            :autosize="{ minRows: 4, maxRows: 6}"
                            placeholder="请输入网站描述"
                            v-model.trim="form.description">
                        </el-input>
                    </el-form-item>
                    <el-form-item label="" :label-width="labelWidth">
                        <el-button type="success" icon="el-icon-check" @click="putWebInfo">保存</el-button>
                        <el-button type="danger" icon="el-icon-delete" @click="clearData">清空</el-button>
                    </el-form-item>
                </el-form>
            </el-col>
        </el-row>
        <el-upload
            :action="uploadUrl"
            list-type="picture-card"
            :on-preview="handlePictureCardPreview"
            :on-remove="handleRemove">
            <i class="el-icon-plus"></i>
        </el-upload>
        <el-dialog :visible.sync="dialogVisible">
            <img width="100%" :src="dialogImageUrl" alt="">
        </el-dialog>
    </section>
</template>

<script>
import { getWebInfo, putWebInfo } from '@/api/api'

export default {
    name: 'websiteSetting',
    data() {
        return {
            uploadUrl: 'http://172.18.15.0:9982/api/imgUpload',
            dialogImageUrl: '',
            dialogVisible: false,
            labelWidth: '120px',
            form: {
                _id: '',
                title: '',
                sub_title: '',
                keyword: '',
                url: '',
                email: '',
                icp: ''
            },
            rules: {}
        }
    },
    mounted() {
        this.getWebInfo()
    },
    methods: {
        handleRemove(file, fileList) {
            console.log(file, fileList)
        },
        handlePictureCardPreview(file) {
            this.dialogImageUrl = file.url
            this.dialogVisible = true
        },
        getWebInfo() {
            getWebInfo().then(res => {
                const data = res.data
                if (Number(data.code) === 1) {
                    // 获取信息后填充
                    for (const key in this.form) {
                        this.form[key] = data.result[key]
                    }
                }
            })
        },
        putWebInfo() {
            putWebInfo(this.form).then(res => {
                const data = res.data
                if (Number(data.code) === 1) {
                    this.$notify({
                        title: '成功',
                        message: '修改网站信息成功',
                        type: 'success'
                    })
                }
            })
        },
        clearData() {
            this.$refs.ruleForm.resetFields()
        }
    }
}
</script>
<style lang='scss' scoped='scoped'>
</style>
