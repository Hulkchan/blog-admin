<template>
    <el-scrollbar wrapClass="scrollbar-wrapper">
        <el-menu mode="vertical" :show-timeout="200" :default-active="$route.path" :collapse="isCollapse" background-color="#304156" text-color="#bfcbd9" active-text-color="#409EFF">
            <sidebar-item v-for="route in routerArr" :key="route.name" :item="route" :base-path="route.path"></sidebar-item>
        </el-menu>
    </el-scrollbar>
</template>

<script>
import { mapGetters } from 'vuex'
import SidebarItem from './SidebarItem'
import { constantRouterMap } from '@/router/index.js'

export default {
    components: { SidebarItem },
    computed: {
        ...mapGetters(['sidebar']),
        routerArr() {
            return constantRouterMap
        },
        isCollapse() {
            return !this.sidebar.opened
        }
    }
}
</script>
