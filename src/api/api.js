import request from '@/utils/request'
import qs from 'qs'

/**
 * 1. 网站信息接口**/
// 网站信息获取
export function getWebInfo(data) {
    return request({
        url: `/option`,
        method: 'get'
    })
}

// 修改网站信息
export function putWebInfo(data) {
    return request({
        url: `/option`,
        method: 'put',
        data: qs.stringify(data)
    })
}

/**
 * 2. 发文**/
// 上传图片接口地址
export const uploadUrl = `${process.env.BASE_API}/imgUpload`
// 新增文章
export function postArticle(data) {
    return request({
        url: `/article`,
        method: 'post',
        data: qs.stringify(data)
    })
}

// 删除文章
export function deleteArticle(data) {
    return request({
        url: `/article/${data.id}`,
        method: 'delete'
    })
}

// 通过ID获取文章内容
export function getArticleById(data) {
    return request({
        url: `/article/${data.id}`,
        method: 'get'
    })
}

// 修改文章
export function putArticle(data) {
    return request({
        url: `/article/${data.id}`,
        method: 'put',
        data: qs.stringify(data.param)
    })
}

// 查询文章列表
export function getArticle(data) {
    return request({
        url: `/getArticle`,
        method: 'post',
        data: qs.stringify(data)
    })
}

/**
 * 3. 标签**/
// 获取标签列表
export function getTags(data) {
    return request({
        url: `/tag?current_page=${data.current_page}&&page_size=${data.page_size}&&keyword=${data.keyword}`,
        method: 'get'
    })
}

// 新增标签
export function postTag(data) {
    return request({
        url: `/tag`,
        method: 'post',
        data: qs.stringify(data)
    })
}

// 修改标签
export function putTag(data) {
    return request({
        url: `/tag`,
        method: 'put',
        data: qs.stringify(data)
    })
}

// 标签排序
export function patchTag(data) {
    return request({
        url: `/tag`,
        method: 'patch',
        data: qs.stringify(data)
    })
}

// 删除标签
export function deleteTag(data) {
    return request({
        url: `/tag/${data.id}`,
        method: 'delete'
    })
}
