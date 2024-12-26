<script setup>
    import { Icon } from "@iconify/vue"

    definePageMeta({
        name: "user-order",
    })

    // 儲存即將到來和歷史訂單
    const upcomingOrders = ref([])
    const pastOrders = ref([])
    const authToken = useCookie("auth_token")
    // 存儲當前選中的訂單 ID
    const selectedOrderId = ref(null)

    // 獲取訂單數據
    const fetchOrders = async () => {
        try {
            const response = await $fetch(
                "https://freyja-s8qg.onrender.com/api/v1/orders/",
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${authToken.value}`,
                    },
                }
            )
            console.log(response)

            if (response.status && Array.isArray(response.result)) {
                const now = new Date()
                upcomingOrders.value = []
                pastOrders.value = []

                // 過濾 status 為 -1 的訂單
                const validOrders = response.result.filter(
                    (order) => order.status !== -1
                )

                validOrders.forEach((order) => {
                    const checkInDate = new Date(order.checkInDate)
                    const checkOutDate = new Date(order.checkOutDate)
                    const totalNights = Math.ceil(
                        (checkOutDate - checkInDate) / (1000 * 60 * 60 * 24)
                    )

                    // 計算總價錢
                    const totalPrice = totalNights * order.roomId.price

                    // 加入計算結果到訂單數據
                    order.totalNights = totalNights
                    order.totalPrice = totalPrice

                    if (checkInDate >= now) {
                        upcomingOrders.value.push(order)
                    } else {
                        pastOrders.value.push(order)
                    }
                })

                console.log("即將到來的訂單:", upcomingOrders.value)
                console.log("歷史訂單:", pastOrders.value)
            } else {
                console.error("無法取得訂單數據:", response)
            }
        } catch (error) {
            console.error("API 請求錯誤:", error)
        }
    }
    // 點擊取消按鈕時設置選中的訂單 ID
    const openCancelModal = (orderId) => {
        selectedOrderId.value = orderId
    }
    // 確認取消訂單
    const cancelOrder = async () => {
        if (!selectedOrderId.value) return

        try {
            const response = await $fetch(
                `https://freyja-s8qg.onrender.com/api/v1/orders/${selectedOrderId.value}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${authToken.value}`,
                    },
                }
            )
            console.log(response)

            if (response.status) {
                // 刪除成功後從列表移除該訂單
                upcomingOrders.value = upcomingOrders.value.filter(
                    (order) => order._id !== selectedOrderId.value
                )
                selectedOrderId.value = null
            } else {
                console.error("取消訂單失敗:", response.message)
            }
        } catch (error) {
            console.error("取消訂單時發生錯誤:", error)
        }
    }
    onMounted(fetchOrders)
</script>

<template>
    <div class="row gap-6 gap-md-0">
        <div v-if="upcomingOrders.length" class="col-12 col-md-7">
            <div v-for="order in upcomingOrders" :key="order._id">
                <div
                    class="rounded-3xl d-flex flex-column gap-6 gap-md-10 p-4 p-md-10 bg-neutral-0"
                    style="max-width: 730px"
                >
                    <div>
                        <p class="mb-2 text-neutral-80 fs-8 fs-md-7 fw-medium">
                            預訂參考編號： {{ order._id }}
                        </p>
                        <h2 class="mb-0 text-neutral-100 fs-7 fs-md-5 fw-bold">
                            即將來的行程
                        </h2>
                    </div>

                    <img
                        class="img-fluid rounded-3"
                        :src="order.roomId.imageUrl"
                        alt="room-a"
                    />

                    <section class="d-flex flex-column gap-6">
                        <h3
                            class="d-flex align-items-center mb-0 text-neutral-80 fs-8 fs-md-6 fw-bold"
                        >
                            <p class="mb-0">
                                {{ order.roomId.name }}，{{ order.totalNights }}
                                晚
                            </p>
                            <span
                                class="d-inline-block mx-4 bg-neutral-80"
                                style="width: 1px; height: 18px"
                            />
                            <p class="mb-0">
                                住宿人數：{{ order.peopleNum }} 位
                            </p>
                        </h3>

                        <div class="text-neutral-80 fs-8 fs-md-7 fw-bold">
                            <p class="title-deco mb-2">
                                入住：{{
                                    new Date(
                                        order.checkInDate
                                    ).toLocaleDateString()
                                }}，15:00 可入住
                            </p>
                            <p class="title-deco mb-0">
                                退房：{{
                                    new Date(
                                        order.checkOutDate
                                    ).toLocaleDateString()
                                }}，12:00 前退房
                            </p>
                        </div>

                        <p class="mb-0 text-neutral-80 fs-8 fs-md-7 fw-bold">
                            NT$ {{ order.totalPrice }}
                        </p>
                    </section>

                    <hr class="my-0 opacity-100 text-neutral-40" />

                    <section
                        v-if="
                            order.roomId.facilityInfo &&
                            order.roomId.facilityInfo.length
                        "
                    >
                        <h3
                            class="title-deco mb-6 text-neutral-100 fs-8 fs-md-7 fw-bold"
                        >
                            房內設備
                        </h3>
                        <ul
                            class="d-flex flex-wrap row-gap-2 column-gap-10 p-6 mb-0 fs-8 fs-md-7 bg-neutral-0 border border-neutral-40 rounded-3 list-unstyled"
                        >
                            <li
                                v-for="(facility, index) in order.roomId
                                    .facilityInfo"
                                :key="index"
                                class="flex-item d-flex gap-2"
                            >
                                <Icon
                                    class="fs-5 text-primary-100"
                                    icon="material-symbols:check"
                                />
                                <p class="mb-0 text-neutral-80 fw-bold">
                                    {{ facility.title }}
                                </p>
                            </li>
                        </ul>
                    </section>

                    <section
                        v-if="
                            order.roomId.amenityInfo &&
                            order.roomId.amenityInfo.length
                        "
                    >
                        <h3
                            class="title-deco mb-6 text-neutral-100 fs-8 fs-md-7 fw-bold"
                        >
                            備品提供
                        </h3>
                        <ul
                            class="d-flex flex-wrap row-gap-2 column-gap-10 p-6 mb-0 fs-8 fs-md-7 bg-neutral-0 border border-neutral-40 rounded-3 list-unstyled"
                        >
                            <li
                                v-for="(amenity, index) in order.roomId
                                    .amenityInfo"
                                :key="index"
                                class="flex-item d-flex gap-2"
                            >
                                <Icon
                                    class="fs-5 text-primary-100"
                                    icon="material-symbols:check"
                                />
                                <p class="mb-0 text-neutral-80 fw-bold">
                                    {{ amenity.title }}
                                </p>
                            </li>
                        </ul>
                    </section>

                    <div class="d-flex gap-4">
                        <button
                            data-bs-toggle="modal"
                            data-bs-target="#cancelModal"
                            class="btn btn-outline-primary-100 w-50 py-4 fw-bold"
                            style="--bs-btn-hover-color: #fff"
                            type="button"
                            @click="openCancelModal(order._id)"
                        >
                            取消預訂
                        </button>
                        <!-- <RouterLink :to="{
                name: 'room-detail',
                params: {
                  roomId
                }
              }" class="btn btn-primary-100 text-neutral-0 w-50 py-4 fw-bold" type="button">
                查看詳情
              </RouterLink> -->
                    </div>
                </div>
            </div>
        </div>
        <div v-else>
            <p class="text-neutral-80">目前沒有即將到來的訂單。</p>
        </div>
        <div class="col-12 col-md-5">
            <div
                v-if="pastOrders.length"
                class="rounded-3xl d-flex flex-column gap-6 gap-md-10 p-4 p-md-10 bg-neutral-0"
            >
                <h2 class="mb-0 text-neutral-100 fs-7 fs-md-5 fw-bold">
                    歷史訂單
                </h2>
                <div v-for="order in pastOrders" :key="order._id">
                    <div class="d-flex flex-column flex-lg-row gap-6">
                        <img
                            class="img-fluid object-fit-cover rounded-3"
                            style="max-width: 120px; height: 80px"
                            :src="order.roomId.imageUrl"
                            :alt="order.roomId.name"
                        />
                        <section class="d-flex flex-column gap-4">
                            <p
                                class="mb-0 text-neutral-80 fs-8 fs-md-7 fw-medium"
                            >
                                預訂參考編號： {{ order._id }}
                            </p>

                            <h3
                                class="d-flex align-items-center mb-0 text-neutral-80 fs-8 fs-md-6 fw-bold"
                            >
                                {{ order.roomId.name }}
                            </h3>

                            <div class="text-neutral-80 fw-medium">
                                <p class="mb-2">
                                    住宿天數： {{ order.totalNights }} 晚
                                </p>
                                <p class="mb-0">
                                    住宿人數：{{ order.peopleNum }} 位
                                </p>
                            </div>

                            <div class="text-neutral-80 fs-8 fs-md-7 fw-medium">
                                <p class="title-deco mb-2">
                                    入住：{{
                                        new Date(
                                            order.checkInDate
                                        ).toLocaleDateString()
                                    }}，15:00 可入住
                                </p>
                                <p class="title-deco mb-0">
                                    退房：{{
                                        new Date(
                                            order.checkOutDate
                                        ).toLocaleDateString()
                                    }}，12:00 前退房
                                </p>
                            </div>
                            <p
                                class="mb-0 text-neutral-80 fs-8 fs-md-7 fw-bold"
                            >
                                NT$ {{ order.totalPrice }}
                            </p>
                        </section>
                    </div>

                    <hr class="my-0 opacity-100 text-neutral-40" />
                </div>

                <button
                    class="btn btn-outline-primary-100 py-4 fw-bold"
                    style="--bs-btn-hover-color: #fff"
                    type="button"
                >
                    查看更多
                </button>
            </div>
            <div v-else>
                <p class="text-neutral-80">目前沒有歷史訂單。</p>
            </div>
        </div>

        <div id="cancelModal" class="modal fade" tabindex="-1">
            <div
                class="modal-dialog modal-dialog-centered align-items-end align-items-md-center m-0 mx-md-auto h-100"
            >
                <div class="modal-content">
                    <div class="modal-header">
                        <button
                            type="button"
                            class="btn-close"
                            data-bs-dismiss="modal"
                            aria-label="Close"
                        />
                    </div>
                    <div
                        class="modal-body mx-auto my-10 my-md-15 text-neutral-80 fs-8 fs-md-6 fw-bold"
                    >
                        確定要取消此房型的預訂嗎？訂單編號：{{
                            selectedOrderId
                        }}
                    </div>
                    <div class="modal-footer d-flex gap-4">
                        <button
                            type="button"
                            class="btn btn-outline-primary-100 flex-grow-1 m-0 py-4 fw-bold"
                            style="--bs-btn-hover-color: #fff"
                            data-bs-dismiss="modal"
                        >
                            關閉視窗
                        </button>
                        <button
                            type="button"
                            class="btn btn-primary-100 flex-grow-1 m-0 py-4 text-white fw-bold"
                            @click="cancelOrder"
                            data-bs-dismiss="modal"
                        >
                            確定取消
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
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

    .rounded-3xl {
        border-radius: 1.25rem;
    }

    .title-deco {
        display: flex;
        align-items: center;
    }

    .title-deco::before {
        --color: #bf9d7d;
        content: "";
        display: inline-block;
        width: 4px;
        height: 24px;
        background-color: var(--color);
        border-radius: 10px;
        margin-right: 0.75rem;
    }

    .title-deco:nth-child(2)::before {
        --color: #909090;
    }

    .flex-item {
        max-width: 97px;
        width: 100%;
        white-space: nowrap;
    }

    .modal {
        backdrop-filter: blur(10px);

        @include media-breakpoint-down(md) {
            backdrop-filter: none;
        }
    }

    .modal-header {
        @include media-breakpoint-down(md) {
            border-bottom: 0 !important;
        }
    }

    .modal-content {
        @include media-breakpoint-down(md) {
            border-bottom-left-radius: 0 !important;
            border-bottom-right-radius: 0 !important;
        }
    }
</style>
