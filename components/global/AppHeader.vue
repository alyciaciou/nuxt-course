<script setup>
    import { Icon } from "@iconify/vue"

    const route = useRoute()
    const router = useRouter()
    const transparentBgRoute = ["home", "rooms"]
    const isTransparentRoute = computed(() =>
        transparentBgRoute.includes(route.name)
    )
    const isScrolled = ref(false)

    const authToken = useCookie("auth_token")
    const username = ref(null)
    const isLoggedIn = computed(() => !!authToken.value) // 檢查是否已登入
    const userId = ref(null)

    const fetchUsername = async () => {
        if (!authToken.value) return // 如果沒有 token，不需要進行 API 請求

        try {
            const response = await $fetch(
                "https://freyja-s8qg.onrender.com/api/v1/user/",
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${authToken.value}`, // 添加 token 到 header
                    },
                }
            )

            if (response.status && response.result?.name) {
                username.value = response.result.name // 更新使用者名稱
                userId.value = response.result._id
            } else {
                console.error("無法取得使用者名稱，請檢查 API 回應:", response)
            }
        } catch (error) {
            console.error("API 請求錯誤:", error)
            // authToken.value = null; // 如果請求錯誤，清除 token
        }
    }

    const logout = () => {
        authToken.value = null // 清除 token
        username.value = null
        alert("您已登出")
        router.push("/")
    }

    const handleScroll = () => {
        isScrolled.value = window.scrollY > 50
    }

    onMounted(() => {
        window.addEventListener("scroll", handleScroll)
        fetchUsername() // 元件掛載時請求 API 獲取使用者名稱
    })

    onUnmounted(() => {
        window.removeEventListener("scroll", handleScroll)
    })
</script>

<template>
    <header
        :class="{
            scrolled: isScrolled,
            'bg-transparent': isTransparentRoute,
            'bg-neutral-120': !isTransparentRoute,
        }"
        class="position-fixed top-0 z-3 w-100"
    >
        <nav class="navbar navbar-expand-md p-0 px-3 py-4 px-md-20 py-md-6">
            <div class="container-fluid justify-content-between p-0">
                <NuxtLink class="navbar-brand p-0" to="/">
                    <img
                        src="/assets/images/logo-white.svg"
                        alt="logo"
                        class="logo img-fluid"
                    />
                </NuxtLink>
                <button
                    class="navbar-toggler collapsed p-2 text-white border-0 shadow-none"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbar"
                    aria-controls="navbar"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <Icon class="fs-1" icon="mdi:close" />
                    <Icon class="fs-5" icon="mdi:menu" />
                </button>
                <div id="navbar" class="collapse navbar-collapse">
                    <ul class="navbar-nav gap-4 ms-auto fw-bold">
                        <li class="nav-item">
                            <NuxtLink
                                to="/rooms"
                                class="nav-link p-4 text-neutral-0"
                            >
                                客房旅宿
                            </NuxtLink>
                        </li>

                        <!-- 未登入時顯示登入與註冊按鈕 -->
                        <template v-if="!isLoggedIn">
                            <li class="nav-item">
                                <NuxtLink
                                    to="/account/login"
                                    class="nav-link p-4 text-neutral-0"
                                >
                                    登入
                                </NuxtLink>
                            </li>
                            <li class="nav-item">
                                <NuxtLink
                                    to="/account/signup"
                                    class="nav-link p-4 text-neutral-0"
                                >
                                    註冊
                                </NuxtLink>
                            </li>
                        </template>

                        <!-- 已登入時顯示使用者名稱與下拉選單 -->
                        <template v-else>
                            <li class="nav-item">
                                <div class="btn-group">
                                    <button
                                        type="button"
                                        class="nav-link d-flex gap-2 p-4 text-neutral-0"
                                        data-bs-toggle="dropdown"
                                    >
                                        <Icon
                                            class="fs-5"
                                            icon="mdi:account-circle-outline"
                                        />
                                        {{ username }}
                                    </button>
                                    <ul
                                        class="dropdown-menu py-3 overflow-hidden"
                                        style="
                                            right: 0;
                                            left: auto;
                                            border-radius: 20px;
                                        "
                                    >
                                        <li>
                                            <NuxtLink
                                                v-if="userId"
                                                :to="{
                                                    name: 'profile',
                                                    params: { userId: userId },
                                                }"
                                                class="dropdown-item px-6 py-4"
                                            >
                                                我的帳戶
                                            </NuxtLink>
                                        </li>
                                        <li>
                                            <button
                                                @click="logout"
                                                class="dropdown-item px-6 py-4"
                                            >
                                                登出
                                            </button>
                                        </li>
                                    </ul>
                                </div>
                            </li>
                        </template>

                        <li class="nav-item">
                            <NuxtLink
                                to="/rooms"
                                class="btn btn-primary-100 px-8 py-4 text-white fw-bold border-0 rounded-3"
                            >
                                立即訂房
                            </NuxtLink>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    </header>
</template>

<style lang="scss" scoped>
    @import "bootstrap/scss/mixins/breakpoints";

    $grid-breakpoints: (
        xs: 0,
        sm: 576px,
        md: 768px,
        lg: 992px,
        xl: 1200px,
        xxl: 1400px,
        xxxl: 1537px,
    );

    .logo {
        max-width: 27vw;
    }

    header {
        transition: background-color 0.3s;
    }

    header.scrolled {
        background-color: #000 !important;
    }

    @include media-breakpoint-down(md) {
        .navbar-toggler {
            z-index: 1;
            visibility: hidden;

            svg {
                transition: opacity 0.3s;
            }

            svg:nth-child(1) {
                position: absolute;
                top: 28px;
                right: 28px;
                opacity: 1;
                visibility: visible;
            }

            svg:nth-child(2) {
                opacity: 0;
                visibility: hidden;
            }
        }

        .navbar-toggler.collapsed {
            svg:nth-child(1) {
                opacity: 0;
                visibility: hidden;
            }

            svg:nth-child(2) {
                opacity: 1;
                visibility: visible;
            }
        }

        .navbar-collapse {
            min-height: 100vh;
            background-color: #140f0a;
            position: fixed;
            inset: 0;
            opacity: 0;
            overflow: hidden;
            transition: opacity 0.05s;
        }

        .navbar-collapse.show {
            opacity: 1;
        }

        .navbar-nav {
            height: 100%;
            justify-content: center;
            align-items: center;
            text-align: center;

            a {
                width: 90vw;
            }
        }
    }

    .dropdown-menu {
        --bs-dropdown-min-width: 16rem;
        --bs-dropdown-link-hover-color: #bf9d7d;
        --bs-dropdown-link-hover-bg: #f7f2ee;
        --bs-dropdown-link-active-color: #fff;
        --bs-dropdown-link-active-bg: #bf9d7d;
    }
</style>
