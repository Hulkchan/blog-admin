<template lang='html'>
    <section class='contentManage'>
        <el-card>
            <el-form :inline="true" :model="form">
                <el-form-item label="" style="margin-bottom:0">
                    <el-date-picker
                        value-format="yyyy-MM-dd HH:mm:ss"
                        v-model="form.timeQuantum"
                        type="datetimerange"
                        placeholder="选择时间范围">
                    </el-date-picker>
                    <el-form-item  style="margin-bottom:0">
                        <el-select v-model="form.tag" filterable clearable placeholder="请选择标签">
                            <el-option
                                v-for="item in tags"
                                :key="item._id"
                                :label="item.name"
                                :value="item._id">
                            </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item style="margin-bottom:0">
                        <el-input type="primary" v-model="form.keywords" placeholder="请输入关键词"></el-input>
                    </el-form-item>
                    <el-form-item style="margin-bottom:0">
                        <el-button type="primary" @click="search">查询</el-button>
                    </el-form-item>
                </el-form-item>
            </el-form>
        </el-card>
        <el-card class="mt-10">
            <el-table :data="tableData"
                          highlight-current-row
                          v-loading="listLoading"
                          style="width: 100%;"
                          tooltip-effect="dark"
                          stripe border>
                <el-table-column label="标题" :show-overflow-tooltip="true">
                    <template slot-scope="scope">
                        <el-popover
                            placement="right"
                            title="封面"
                            max-width="200"
                            trigger="hover">
                            <span v-if="!scope.row.thumb">暂无封面</span>
                            <img :src="scope.row.thumb" style="width:120px;margin-left:10px;" v-if="scope.row.thumb"/>
                            <span class="aclick" slot="reference">{{ scope.row.title }}</span>
                        </el-popover>
                    </template>
                </el-table-column>
                <el-table-column label="标签" :show-overflow-tooltip="true" width="80">
                    <template slot-scope="scope">
                        <div>
                            <el-tag v-for="(item,index) in scope.row.tag" :key="index">{{ item.name }}</el-tag>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column label="发布时间" :show-overflow-tooltip="true">
                    <template slot-scope="scope">
                        <div>
                            <i class="el-icon-time"></i>
                            <span style="margin-left: 10px">{{ scope.row.created_at }}</span>
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
                <el-table-column label="描述" :show-overflow-tooltip="true">
                    <template slot-scope="scope">
                        <span>{{ scope.row.description }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="180">
                    <template slot-scope="scope">
                        <el-button type="primary" @click="modifyArticle(scope.row)">修改</el-button>
                        <el-button type="danger" @click="deleteArticle(scope.row)">删除</el-button>
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
        </el-card>
    </section>
</template>

<script>
import {
    getArticle,
    deleteArticle,
    getTags
} from '@/api/api'

export default {
    data() {
        return {
            form: {
                timeQuantum: [],
                keywords: '',
                tag: ''
            },
            tags: [],
            tableData: [],
            listLoading: false,
            currentPage: 1,
            pageSize: 10,
            total: 0
        }
    },
    mounted() {
        this.getTags()
        this.search()
    },
    methods: {
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
                    const tagId = this.$route.query.id
                    if (tagId) {
                        this.form.tag = tagId
                        this.search()
                    }
                }
            })
        },
        search() {
            this.currentPage = 1
            this.getList()
        },
        getList() {
            const params = {
                current_page: this.currentPage,
                page_size: this.pageSize,
                keyword: this.form.keywords,
                startTime: this.form.timeQuantum[0],
                endTime: this.form.timeQuantum[1],
                tag: this.form.tag
            }
            getArticle(params).then(res => {
                const data = res.data
                if (data.code === 1) {
                    this.tableData = data.result.list
                    this.total = data.result.pagination.total
                }
            })
        },
        handleCurrentChange(val) {
            this.currentPage = val
            this.getList()
        },
        handleSizeChange(val) {
            this.pageSize = val
            this.getList()
        },
        modifyArticle(row) {
            this.$router.push({
                path: '/addcontent',
                query: {
                    id: row._id
                }
            })
        },
        deleteArticle(row) {
            this.$confirm('您确定要删除这篇文章吗?', '提示', {
                type: 'warning'
            }).then(() => {
                const params = {
                    id: row._id
                }
                deleteArticle(params).then(res => {
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
        }
    }
}

</script>
<style lang='scss' scoped='scoped'>
.aclick {
    cursor: pointer;
    text-decoration: none;
    color: #666;
    &:hover{
        color: #58B7FF;
    }
}
</style>