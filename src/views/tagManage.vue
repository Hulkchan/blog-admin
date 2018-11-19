<template lang='html'>
    <section class='tagManage'>
        <el-card>
            <el-form :inline="true" :model="form">
                <el-form-item label="" style="margin-bottom:0">
                    <el-date-picker
                        value-format="yyyy-MM-dd HH:mm:ss"
                        v-model="form.timeQuantum"
                        type="datetimerange"
                        placeholder="选择时间范围">
                    </el-date-picker>
                    <el-form-item style="margin-bottom:0">
                        <el-input type="primary" v-model="form.keyword" placeholder="请输入关键词"></el-input>
                    </el-form-item>
                    <el-form-item style="margin-bottom:0">
                        <el-button type="primary" @click="search">查询</el-button>
                    </el-form-item>
                </el-form-item>
            </el-form>
        </el-card>
        <el-card class="mt-10">
            <el-row>
                <el-button type="primary" @click="createTag">新增</el-button>
            </el-row>
            <el-row class="mt-10">
                <el-table :data="tableData"
                          highlight-current-row
                          v-loading="listLoading"
                          style="width: 100%;"
                          tooltip-effect="dark"
                          stripe border>
                    <el-table-column label="标题" :show-overflow-tooltip="true">
                        <template slot-scope="scope">
                            <span>{{ scope.row.name }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="发布时间" :show-overflow-tooltip="true">
                        <template slot-scope="scope">
                            <div>
                                <i class="el-icon-time"></i>
                                <span style="margin-left: 10px">{{ scope.row.create_at }}</span>
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column label="更新时间" :show-overflow-tooltip="true">
                        <template slot-scope="scope">
                            <div>
                                <i class="el-icon-time"></i>
                                <span style="margin-left: 10px">{{ scope.row.update_at }}</span>
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column label="排序" :show-overflow-tooltip="true" width="100">
                        <template slot-scope="scope">
                            <el-popover
                                placement="top"
                                width="160"
                                trigger="manual"
                                v-model="scope.row.isShow"
                                @show="sortChangeShow(scope.row)">
                                <el-input v-model="scope.row.sort"></el-input>
                                <div style="text-align: right; margin: 0">
                                    <el-button size="mini" type="text" @click="cancelSort(scope.row)">取消</el-button>
                                    <el-button type="text" size="mini" @click="patchTag(scope.row)">确定</el-button>
                                </div>
                                <el-button slot="reference" type="text" @click="scope.row.isShow = true">{{ scope.row.sort }}</el-button>
                            </el-popover>
                        </template>
                    </el-table-column>
                    <el-table-column label="标签文章数" :show-overflow-tooltip="true" width="100">
                        <template slot-scope="scope">
                            <el-button type="text" @click="getArticleByTag(scope.row)">{{ scope.row.count }}</el-button>
                        </template>
                    </el-table-column>
                    <el-table-column label="描述" :show-overflow-tooltip="true">
                        <template slot-scope="scope">
                            <span>{{ scope.row.description }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="操作" width="180">
                        <template slot-scope="scope">
                            <el-button type="primary" @click="editTag(scope.row)">修改</el-button>
                            <el-button type="danger" @click="deleteTag(scope.row)">删除</el-button>
                        </template>
                    </el-table-column>
                </el-table>
                <el-row class="mt-10">
                    <el-pagination
                        @current-change="handleCurrentChange"
                        @size-change="handleSizeChange"
                        layout="total, sizes, prev, pager, next, jumper"
                        :page-sizes="[10, 15, 20, 50, 100]"
                        :page-size="pageSize"
                        :current-page="currentPage"
                        :total="total"
                        background
                        style="float:right;">
                    </el-pagination>
                </el-row>
            </el-row> 
        </el-card>
        <!--新增/编辑 dialog Begin-->
        <el-dialog title="" :visible.sync="dialogFormVisible">
            <el-form :model="dialogForm" ref="dialogForm">
                <el-form-item label="标签名称" :label-width="formLabelWidth" prop="name" placeholder="请输入标签名称">
                    <el-input v-model="dialogForm.name"></el-input>
                </el-form-item>
                <el-form-item label="描述" :label-width="formLabelWidth" prop="description">
                    <el-input
                        type="textarea"
                        :autosize="{ minRows: 2, maxRows: 4}"
                        placeholder="请输入描述"
                        v-model="dialogForm.description">
                    </el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="dialogFormVisible = false">取 消</el-button>
                <el-button type="primary" @click="submitTag">确 定</el-button>
            </div>
        </el-dialog>
        <!--新增/编辑 dialog End-->
    </section>
</template>

<script>
import {
    getTags,
    postTag,
    putTag,
    deleteTag,
    patchTag
} from '@/api/api'

export default {
    name: 'tagManage',
    data() {
        return {
            dialogFormVisible: false,
            publishStatus: 'create',
            formLabelWidth: '120px',
            listLoading: false,
            currentPage: 1,
            pageSize: 10,
            total: 0,
            tableData: [],
            form: {
                keyword: '',
                timeQuantum: []
            },
            dialogForm: {
                name: '',
                description: ''
            }
        }
    },
    mounted() {
        this.search()
    },
    methods: {
        getArticleByTag(row) {
            this.$router.push({
                path: '/contentManage',
                query: {
                    id: row._id
                }
            })
        },
        sortChangeShow(row) {
            row.originalSort = row.sort
        },
        cancelSort(row) {
            row.sort = row.originalSort
            row.isShow = false
        },
        patchTag(row) {
            const params = {
                id: row._id,
                sort: row.sort
            }
            patchTag(params).then(res => {
                const data = res.data
                if (data.code === 1) {
                    row.isShow = false
                }
            })
        },
        search() {
            this.currentPage = 1
            this.getTags()
        },
        getTags() {
            const params = {
                current_page: this.currentPage,
                page_size: this.pageSize,
                keyword: this.form.keyword
            }
            this.listLoading = true
            getTags(params).then(res => {
                const data = res.data
                if (data.code === 1) {
                    this.tableData = data.result.list
                    this.total = data.result.pagination.total
                }
                this.listLoading = false
            })
        },
        createTag() {
            this.publishStatus = 'create'
            this.dialogFormVisible = true
            this.resetDialogForm()
        },
        resetDialogForm() {
            this.dialogForm.name = ''
            this.dialogForm.description = ''
            this.dialogForm.id = ''
        },
        editTag(row) {
            this.publishStatus = 'edit'
            this.dialogForm.name = row.name
            this.dialogForm.description = row.description
            this.dialogForm.id = row._id
            this.dialogFormVisible = true
        },
        submitTag() {
            this.dialogFormVisible = false
            switch (this.publishStatus) {
                case 'create':
                    this.postTag()
                    break
                case 'edit':
                    this.putTag()
                    break
                default:
                    this.postTag()
                    break
            }
        },
        postTag() {
            const params = {
                name: this.dialogForm.name,
                description: this.dialogForm.description
            }
            postTag(params).then(res => {
                const data = res.data
                if (data.code === 1) {
                    this.$notify({
                        title: '成功',
                        message: data.message,
                        type: 'success'
                    })
                    this.search()
                }
            })
        },
        putTag() {
            const params = {
                _id: this.dialogForm.id,
                name: this.dialogForm.name,
                description: this.dialogForm.description
            }
            putTag(params).then(res => {
                const data = res.data
                if (data.code === 1) {
                    this.$notify({
                        title: '成功',
                        message: data.message,
                        type: 'success'
                    })
                    this.search()
                }
            })
        },
        deleteTag(row) {
            this.$confirm('您确定要删除这个标签吗?', '提示', {
                type: 'warning'
            }).then(() => {
                const params = {
                    id: row._id
                }
                deleteTag(params).then(res => {
                    const data = res.data
                    if (data.code === 1) {
                        this.$notify({
                            title: '成功',
                            message: data.message,
                            type: 'success'
                        })
                        this.search()
                    }
                })
            })
        },
        handleCurrentChange(val) {
            this.currentPage = val
            this.getTags()
        },
        handleSizeChange(val) {
            this.pageSize = val
            this.getTags()
        }
    }
}

</script>
<style lang='scss' scoped='scoped'>

</style>